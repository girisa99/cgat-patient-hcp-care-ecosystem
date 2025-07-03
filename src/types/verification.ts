export interface ResultSummary {
  summary?: {
    complianceScore?: number;
  };
  databaseUsageScore?: number;
  severityScore?: number;
  overallScore?: number;
  healthScore?: number;
  typeConsistencyScore?: number;
  duplicates?: { totalDuplicates?: number; severityScore?: number };
  [key: string]: unknown;
}

export interface VerificationResults {
  singleSourceResult: ResultSummary & { violations?: unknown[] };
  mockDataResult: ResultSummary & { violations?: unknown[] };
  codeQualityResult: ResultSummary & { duplicates?: { totalDuplicates?: number; severityScore?: number } };
  databaseResult: ResultSummary;
  moduleRegistryResult: ResultSummary;
  typescriptResult: ResultSummary;
  [key: string]: unknown;
}