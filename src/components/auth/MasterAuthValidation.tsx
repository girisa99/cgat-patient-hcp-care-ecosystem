/**
 * MASTER AUTH VALIDATION UTILITIES
 * Extracted validation logic from MasterAuthForm for better maintainability
 * Part of Stability Framework Phase 2 refactoring
 */

interface ValidationResult {
  isValid: boolean;
  message: string;
}

interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export class MasterAuthValidation {
  /**
   * Validate signup form data
   */
  static validateSignup(signupData: SignupData): ValidationResult {
    // Check password match
    if (signupData.password !== signupData.confirmPassword) {
      return {
        isValid: false,
        message: "Passwords do not match"
      };
    }

    // Check password length
    if (signupData.password.length < 6) {
      return {
        isValid: false,
        message: "Password must be at least 6 characters"
      };
    }

    // Check email format
    if (!this.isValidEmail(signupData.email)) {
      return {
        isValid: false,
        message: "Please enter a valid email address"
      };
    }

    // Check required fields
    if (!signupData.firstName.trim()) {
      return {
        isValid: false,
        message: "First name is required"
      };
    }

    if (!signupData.lastName.trim()) {
      return {
        isValid: false,
        message: "Last name is required"
      };
    }

    return {
      isValid: true,
      message: "Valid"
    };
  }

  /**
   * Validate login form data
   */
  static validateLogin(email: string, password: string): ValidationResult {
    if (!email.trim()) {
      return {
        isValid: false,
        message: "Email is required"
      };
    }

    if (!this.isValidEmail(email)) {
      return {
        isValid: false,
        message: "Please enter a valid email address"
      };
    }

    if (!password.trim()) {
      return {
        isValid: false,
        message: "Password is required"
      };
    }

    return {
      isValid: true,
      message: "Valid"
    };
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check password strength
   */
  static checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 20;
    } else {
      feedback.push("Use at least 8 characters");
    }

    if (/[a-z]/.test(password)) {
      score += 20;
    } else {
      feedback.push("Include lowercase letters");
    }

    if (/[A-Z]/.test(password)) {
      score += 20;
    } else {
      feedback.push("Include uppercase letters");
    }

    if (/\\d/.test(password)) {
      score += 20;
    } else {
      feedback.push("Include numbers");
    }

    if (/[!@#$%^&*(),.?\\":{}|<>]/.test(password)) {
      score += 20;
    } else {
      feedback.push("Include special characters");
    }

    return {
      score,
      feedback,
      isStrong: score >= 80
    };
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Check if password meets security requirements
   */
  static meetsSecurityRequirements(password: string): ValidationResult {
    if (password.length < 6) {
      return {
        isValid: false,
        message: "Password must be at least 6 characters long"
      };
    }

    // Additional security checks can be added here
    // For now, we keep it simple to match the original validation

    return {
      isValid: true,
      message: "Password meets security requirements"
    };
  }
}

export default MasterAuthValidation;
