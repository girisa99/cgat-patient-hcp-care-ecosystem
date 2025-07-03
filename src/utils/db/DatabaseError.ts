export class DatabaseError extends Error {
  constructor(message: string, public readonly original?: any) {
    super(message);
    this.name = 'DatabaseError';
    // Maintain proper stack trace (only in V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}