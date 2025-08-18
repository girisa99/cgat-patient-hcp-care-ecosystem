import { z } from 'zod';

// Common validation schemas
export const commonSchemas = {
  uuid: z.string().uuid('Invalid UUID format'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number and special character'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format'),
  url: z.string().url('Invalid URL format'),
  ipAddress: z.string().ip('Invalid IP address'),
  userAgent: z.string().max(500, 'User agent too long'),
  fileName: z.string()
    .min(1, 'Filename cannot be empty')
    .max(255, 'Filename too long')
    .regex(/^[^<>:"|?*\\\/]+$/, 'Filename contains invalid characters')
    .refine(name => !name.startsWith('.'), 'Filename cannot start with dot')
    .refine(name => !name.endsWith('.'), 'Filename cannot end with dot'),
  fileSize: z.number().min(1, 'File size must be positive').max(100 * 1024 * 1024, 'File too large (max 100MB)')
};

// Security-specific validation
export const securitySchemas = {
  alertType: z.enum(['suspicious_access', 'failed_auth', 'data_breach', 'unusual_pattern']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  alertStatus: z.enum(['active', 'investigating', 'resolved', 'false_positive']),
  accessPattern: z.object({
    user_id: commonSchemas.uuid,
    ip_address: commonSchemas.ipAddress.optional(),
    resource: z.string().min(1).max(100),
    user_agent: commonSchemas.userAgent.optional(),
    timestamp: z.string().datetime().optional()
  })
};

// Healthcare-specific validation
export const healthcareSchemas = {
  facilityType: z.enum(['hospital', 'clinic', 'pharmacy', 'laboratory', 'treatmentFacility', 'referralFacility', 'prescriberFacility', 'other']),
  userRole: z.enum(['superAdmin', 'onboardingTeam', 'patientCaregiver', 'demoUser']),
  complianceStandard: z.enum(['HIPAA', 'FDA', '21_CFR_Part_11', 'GxP', 'SOX']),
  clinicalDataType: z.enum(['patient_data', 'trial_data', 'medication_data', 'device_data', 'other'])
};

// API validation utilities
export class APIValidator {
  /**
   * Validate and sanitize API request parameters
   */
  static validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: string[];
  } {
    try {
      const result = schema.safeParse(data);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        const errors = result.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        return { success: false, errors };
      }
    } catch (error) {
      return { 
        success: false, 
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      };
    }
  }

  /**
   * Sanitize string input by removing potentially dangerous characters
   */
  static sanitizeString(input: string, options: {
    maxLength?: number;
    allowHtml?: boolean;
    trimWhitespace?: boolean;
  } = {}): string {
    let sanitized = input;

    // Trim whitespace if requested
    if (options.trimWhitespace !== false) {
      sanitized = sanitized.trim();
    }

    // Remove null bytes and other control characters
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Remove HTML tags if not allowed
    if (!options.allowHtml) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    // Escape potential XSS characters
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    // Truncate if too long
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    return sanitized;
  }

  /**
   * Validate file upload parameters
   */
  static validateFileUpload(file: {
    name: string;
    size: number;
    type: string;
  }, options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}) {
    const errors: string[] = [];

    // Validate filename
    const filenameResult = this.validateRequest(commonSchemas.fileName, file.name);
    if (!filenameResult.success) {
      errors.push(...(filenameResult.errors || []));
    }

    // Validate file size
    const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
    if (file.size > maxSize) {
      errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(maxSize / 1024 / 1024).toFixed(2)}MB`);
    }

    // Check dangerous extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (dangerousExtensions.includes(extension)) {
      errors.push(`Dangerous file type not allowed: ${extension}`);
    }

    // Validate allowed types
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} not allowed`);
    }

    // Validate allowed extensions
    if (options.allowedExtensions && !options.allowedExtensions.includes(extension)) {
      errors.push(`File extension ${extension} not allowed`);
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Validate SQL injection attempts in user input
   */
  static detectSQLInjection(input: string): {
    suspicious: boolean;
    patterns: string[];
  } {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /'[^']*'|"[^"]*"/g, // String literals
      /--|\#|\/\*/g, // SQL comments
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi, // Classic injection patterns
      /(\bunion\s+(all\s+)?select)/gi,
      /(\bexec\s*\()/gi
    ];

    const detectedPatterns: string[] = [];
    
    for (const pattern of sqlPatterns) {
      const matches = input.match(pattern);
      if (matches) {
        detectedPatterns.push(...matches);
      }
    }

    return {
      suspicious: detectedPatterns.length > 0,
      patterns: detectedPatterns
    };
  }

  /**
   * Validate XSS attempts in user input
   */
  static detectXSS(input: string): {
    suspicious: boolean;
    patterns: string[];
  } {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi, // Event handlers like onclick, onload, etc.
      /<iframe\b[^>]*>/gi,
      /<object\b[^>]*>/gi,
      /<embed\b[^>]*>/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi
    ];

    const detectedPatterns: string[] = [];
    
    for (const pattern of xssPatterns) {
      const matches = input.match(pattern);
      if (matches) {
        detectedPatterns.push(...matches);
      }
    }

    return {
      suspicious: detectedPatterns.length > 0,
      patterns: detectedPatterns
    };
  }

  /**
   * Comprehensive input validation for API endpoints
   */
  static validateApiInput(input: any, options: {
    requireAuth?: boolean;
    maxDepth?: number;
    maxProperties?: number;
    sanitize?: boolean;
  } = {}) {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check object depth to prevent DoS
    const maxDepth = options.maxDepth || 10;
    const depth = this.getObjectDepth(input);
    if (depth > maxDepth) {
      errors.push(`Object depth ${depth} exceeds maximum ${maxDepth}`);
    }

    // Check number of properties
    const maxProps = options.maxProperties || 100;
    const propCount = this.countProperties(input);
    if (propCount > maxProps) {
      errors.push(`Object has ${propCount} properties, maximum ${maxProps} allowed`);
    }

    // Validate strings for injection attempts
    this.validateStringsRecursively(input, (str, path) => {
      if (options.sanitize) {
        return this.sanitizeString(str);
      }

      const sqlCheck = this.detectSQLInjection(str);
      if (sqlCheck.suspicious) {
        errors.push(`SQL injection detected at ${path}: ${sqlCheck.patterns.join(', ')}`);
      }

      const xssCheck = this.detectXSS(str);
      if (xssCheck.suspicious) {
        errors.push(`XSS attempt detected at ${path}: ${xssCheck.patterns.join(', ')}`);
      }

      return str;
    });

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  private static getObjectDepth(obj: any, currentDepth = 0): number {
    if (typeof obj !== 'object' || obj === null || currentDepth > 20) {
      return currentDepth;
    }

    let maxDepth = currentDepth;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const depth = this.getObjectDepth(obj[key], currentDepth + 1);
        maxDepth = Math.max(maxDepth, depth);
      }
    }
    
    return maxDepth;
  }

  private static countProperties(obj: any): number {
    if (typeof obj !== 'object' || obj === null) {
      return 0;
    }

    let count = 0;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        count++;
        count += this.countProperties(obj[key]);
      }
    }
    
    return count;
  }

  private static validateStringsRecursively(
    obj: any, 
    validator: (str: string, path: string) => string,
    path = 'root'
  ): any {
    if (typeof obj === 'string') {
      return validator(obj, path);
    } else if (Array.isArray(obj)) {
      return obj.map((item, index) => 
        this.validateStringsRecursively(item, validator, `${path}[${index}]`)
      );
    } else if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          result[key] = this.validateStringsRecursively(
            obj[key], 
            validator, 
            `${path}.${key}`
          );
        }
      }
      return result;
    }
    
    return obj;
  }
}

// Pre-defined validation schemas for common API endpoints
export const apiSchemas = {
  // User authentication
  loginRequest: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password required')
  }),

  // User registration  
  registerRequest: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    role: healthcareSchemas.userRole.optional()
  }),

  // Security alert creation
  createSecurityAlert: z.object({
    alert_type: securitySchemas.alertType,
    severity: securitySchemas.severity,
    user_id: commonSchemas.uuid.optional(),
    ip_address: commonSchemas.ipAddress.optional(),
    user_agent: commonSchemas.userAgent.optional(),
    resource_accessed: z.string().max(100).optional(),
    alert_details: z.record(z.any()).default({})
  }),

  // File upload validation
  fileUpload: z.object({
    fileName: commonSchemas.fileName,
    fileSize: commonSchemas.fileSize,
    fileType: z.string().min(1).max(100),
    checksum: z.string().optional()
  }),

  // Healthcare facility
  createFacility: z.object({
    name: z.string().min(1).max(200),
    type: healthcareSchemas.facilityType,
    email: commonSchemas.email.optional(),
    phone: commonSchemas.phone.optional(),
    address: z.string().max(500).optional(),
    license_number: z.string().max(50).optional(),
    npi_number: z.string().regex(/^\d{10}$/, 'NPI must be 10 digits').optional()
  })
};

// Middleware function for Express-like frameworks
export const createValidationMiddleware = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    const result = APIValidator.validateRequest(schema, req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.errors
      });
    }
    
    // Attach validated data to request
    req.validatedBody = result.data;
    next();
  };
};

// Helper function for Supabase edge functions
export const validateEdgeFunctionInput = (
  input: unknown, 
  schema: z.ZodSchema,
  options?: { sanitize?: boolean }
): { success: boolean; data?: any; error?: string } => {
  try {
    // First run security validation
    const securityCheck = APIValidator.validateApiInput(input, { 
      sanitize: options?.sanitize 
    });
    
    if (!securityCheck.success) {
      return {
        success: false,
        error: `Security validation failed: ${securityCheck.errors?.join(', ')}`
      };
    }

    // Then run schema validation
    const result = APIValidator.validateRequest(schema, input);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return {
        success: false,
        error: `Schema validation failed: ${result.errors?.join(', ')}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};