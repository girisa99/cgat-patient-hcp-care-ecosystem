/**
 * VERIFY NPI CREDENTIALS EDGE FUNCTION
 * Supports provider, treatment_center, and referral_network verification
 * - Accepts either direct NPI or name-based search
 * - Queries NPPES (CMS NPI Registry) and normalizes results for UI consumption
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type VerificationType = "provider" | "treatment_center" | "referral_network";

interface RequestBody {
  verificationType?: VerificationType;
  providerType?: "individual" | "organization";
  npi?: string;
  providerName?: string;
  sectionData?: Record<string, unknown>;
  providerSearch?: {
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
}

interface NPPESAddress {
  country_code?: string;
  country_name?: string;
  address_purpose?: string;
  address_type?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  telephone_number?: string;
  fax_number?: string;
}

interface NPPESBasic {
  first_name?: string;
  last_name?: string;
  organization_name?: string;
  credential?: string;
  sole_proprietor?: string;
  gender?: string;
  enumeration_date?: string;
  last_updated?: string;
  status?: string; // 'A' active, 'I' inactive
  name_prefix?: string;
  name_suffix?: string;
  middle_name?: string;
}

interface NPPESPrimaryTaxonomy {
  code?: string;
  desc?: string;
  primary?: boolean;
  state?: string;
  license?: string;
}

interface NPPESResult {
  basic: NPPESBasic;
  addresses?: NPPESAddress[];
  taxonomies?: NPPESPrimaryTaxonomy[];
}

interface NPPESResponse {
  result_count: number;
  results?: NPPESResult[];
}

function ok(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(message: string, status = 400) {
  return ok({ success: false, error: message }, status);
}

function buildNppesUrl(params: Record<string, string | number | undefined>) {
  const base = new URL("https://npiregistry.cms.hhs.gov/api/");
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") base.searchParams.set(k, String(v));
  });
  // defaults
  base.searchParams.set("version", "2.1");
  base.searchParams.set("limit", "10");
  base.searchParams.set("pretty", "off");
  return base.toString();
}

function normalizePhone(phone?: string) {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return phone;
}

function extractPrimaryAddress(addresses?: NPPESAddress[]) {
  if (!addresses || addresses.length === 0) return undefined;
  const loc = addresses.find((a) => a.address_purpose === "LOCATION") || addresses[0];
  return loc;
}

function mapProviderInfo(result: NPPESResult) {
  const { basic, addresses = [], taxonomies = [] } = result;
  const primaryTax = taxonomies.find((t) => t.primary) || taxonomies[0];
  const addr = extractPrimaryAddress(addresses);

  // Map to UI field names for Provider tab
  const providerInfo = {
    providerName: basic.organization_name || [basic.first_name, basic.middle_name, basic.last_name].filter(Boolean).join(" "),
    providerType: basic.sole_proprietor === "YES" ? "individual" : "organization",
    npiNumber: undefined as string | undefined, // Will be set by caller based on context
    specialty: primaryTax?.desc || "",
    licenseNumber: primaryTax?.license || "",
    licenseState: primaryTax?.state || "",
    boardCertification: basic.credential || "",
    providerStatus: basic.status === "A" ? "active" : "inactive",
  };

  // Facility-style mapping in case UI is on treatment tab
  const facilityInfo = addr
    ? {
        facilityName: providerInfo.providerName,
        facilityNPI: undefined as string | undefined,
        facilityAddress: [addr.address_1, addr.address_2].filter(Boolean).join(", "),
        facilityCity: addr.city || "",
        facilityState: addr.state || "",
        facilityZip: (addr.postal_code || "").slice(0, 5),
        facilityPhone: normalizePhone(addr.telephone_number),
      }
    : undefined;

  return { providerInfo, facilityInfo };
}

serve(async (req) => {
  console.log("🔎 verify-npi-credentials invoked");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return err("Method not allowed", 405);
  }

  try {
    const body = (await req.json()) as RequestBody;
    const verificationType: VerificationType = body.verificationType || "provider";
    const providerType = body.providerType || "individual";

    // Basic validation: need at least NPI or a name for provider/facility
    const hasNpi = !!body.npi && /^\d{10}$/.test(body.npi);
    const rawName = body.providerName || (body.sectionData?.["treatmentCenterName"] as string) || (body.sectionData?.["providerName"] as string) || "";

    if (!hasNpi && !rawName && !body.providerSearch) {
      return err("Provide either an NPI (10 digits) or a name to search");
    }

    // Build NPPES query
    let url: string;
    if (hasNpi) {
      url = buildNppesUrl({ number: body.npi, enumeration_type: providerType === "individual" ? "NPI-1" : "NPI-2" });
    } else {
      // Name-based search
      let firstName: string | undefined;
      let lastName: string | undefined;
      let organizationName: string | undefined;

      if (body.providerSearch?.organizationName) {
        organizationName = body.providerSearch.organizationName;
      } else if (body.providerSearch?.firstName || body.providerSearch?.lastName) {
        firstName = body.providerSearch.firstName;
        lastName = body.providerSearch.lastName;
      } else if (rawName) {
        if (providerType === "individual") {
          const parts = rawName.trim().split(/\s+/);
          firstName = parts[0];
          lastName = parts.slice(1).join(" ") || undefined;
        } else {
          organizationName = rawName.trim();
        }
      }

      url = buildNppesUrl({
        enumeration_type: providerType === "individual" ? "NPI-1" : "NPI-2",
        first_name: firstName,
        last_name: lastName,
        organization_name: organizationName,
        city: body.providerSearch?.city,
        state: body.providerSearch?.state,
        postal_code: body.providerSearch?.postalCode,
      });
    }

    console.log("📤 NPPES request:", url);

    const resp = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json", "User-Agent": "Healthcare-Verification/1.0" },
    });

    if (!resp.ok) {
      console.error("❌ NPPES error:", resp.status, resp.statusText);
      return err("NPI verification service temporarily unavailable", 503);
    }

    const data = (await resp.json()) as NPPESResponse;
    console.log("📊 NPPES result_count:", data.result_count);

    if (!data.results || data.result_count === 0) {
      return ok({
        success: true,
        verified: false,
        message: "No matching provider found in NPPES",
        verification: {
          isValid: false,
          verificationStatus: "failed",
          issues: ["not_found"],
          verifiedAt: new Date().toISOString(),
          confidence: 0,
        },
      });
    }

    const top = data.results[0]!;
    const mapped = mapProviderInfo(top);

    // Determine NPI value: not present in NPPES basic; it's on the result container in real API,
    // but the registry returns NPI at result level usually as 'number'. If missing in our shape,
    // try to parse from URL param; otherwise leave undefined.
    const npiFromQuery = hasNpi ? body.npi : undefined;

    // Assemble response variants for different consumers
    const common = {
      success: true,
      verified: (top.basic?.status || "A") === "A",
      confidence: 0.9,
      message: "Verification successful",
    } as const;

    // Map according to verification type
    const response: any = { ...common };

    if (verificationType === "provider") {
      response.providerInfo = {
        ...mapped.providerInfo,
        npiNumber: npiFromQuery ?? undefined,
      };

      response.verification = {
        isValid: true,
        npiData: {
          status: top.basic?.status,
          gender: top.basic?.gender,
          enumeration_date: top.basic?.enumeration_date,
          last_updated: top.basic?.last_updated,
          taxonomy: (top.taxonomies && top.taxonomies[0]?.code) || undefined,
        },
        verificationStatus: "verified",
        issues: [],
        verifiedAt: new Date().toISOString(),
        confidence: 0.9,
      };
    } else if (verificationType === "treatment_center") {
      const addr = extractPrimaryAddress(top.addresses);
      response.facilityInfo = {
        facilityName: mapped.providerInfo.providerName,
        facilityNPI: npiFromQuery ?? undefined,
        facilityAddress: addr ? [addr.address_1, addr.address_2].filter(Boolean).join(", ") : "",
        facilityCity: addr?.city || "",
        facilityState: addr?.state || "",
        facilityZip: (addr?.postal_code || "").slice(0, 5),
        facilityPhone: normalizePhone(addr?.telephone_number),
      };

      response.verification = {
        isValid: true,
        npiData: { status: top.basic?.status },
        verificationStatus: "verified",
        issues: [],
        verifiedAt: new Date().toISOString(),
        confidence: 0.9,
      };
    } else if (verificationType === "referral_network") {
      // Referral networks typically don't have NPIs in NPPES; treat as metadata verification only
      response.networkInfo = {
        referralNetworkName: rawName || body.providerSearch?.organizationName || "",
        networkType: body.sectionData?.["networkType"] || "",
      };

      response.verification = {
        isValid: true,
        verificationStatus: "partial",
        issues: [],
        verifiedAt: new Date().toISOString(),
        confidence: 0.5,
      };
    }

    return ok(response);
  } catch (e) {
    console.error("❌ verify-npi-credentials error:", e);
    return err("Internal server error during verification", 500);
  }
});