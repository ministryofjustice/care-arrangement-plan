export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    nowInMinutes: number
  }
}

export declare global {
  namespace Express {
    interface Request {
      flash(type: 'errors'): ValidationError[]
      flash(type: 'errors', message: ValidationError[]): number
    }
  }
}
