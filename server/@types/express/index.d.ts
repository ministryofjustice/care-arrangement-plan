import { CAPSession } from '../session';

export declare module 'express-session' {
  // Declare that the session.d.ts will potentially contain these additional fields
  interface SessionData extends CAPSession {
    nowInMinutes: number;
    pageHistory: string[];
    previousPage: string;
    lang: string;
  }
}

export declare global {
  namespace Express {
    interface Request {
      flash(type: 'errors'): ValidationError[];
      flash(type: 'errors', message: ValidationError[]): number;
      flash(type: 'formValues'): Record<string, string | string[] | number[]>[];
      flash(type: 'formValues', message: Record<string, string | string[] | number[]>): number;
    }

    interface Locals {
      analyticsEnabled?: boolean;
      ga4Id?: string;
    }
  }
}
