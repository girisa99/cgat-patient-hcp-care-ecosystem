/**
 * INTERNAL DOMAIN WHITELIST
 * Configuration for auto-detecting internal team members based on email domain
 */

// Whitelisted domains for internal users
export const INTERNAL_DOMAINS = [
  'geniecellgene.com',
  'genieaisuite.com',
  'geniehealth.io',
  // Add more internal domains as needed
];

// Check if email belongs to an internal domain
export const isInternalDomain = (email: string): boolean => {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return INTERNAL_DOMAINS.some(d => domain === d || domain?.endsWith(`.${d}`));
};

// Get domain from email
export const getEmailDomain = (email: string): string | null => {
  if (!email) return null;
  return email.split('@')[1]?.toLowerCase() || null;
};
