import { CAPSession } from '../session'

export declare module 'express-session' {
  // Declare that the session.d.ts will potentially contain these additional fields
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface SessionData extends CAPSession {}
}

export declare global {
  namespace Express {
    interface Request {
      flash(type: 'errors'): ValidationError[]
      flash(type: 'errors', message: ValidationError[]): number
      flash(type: 'formValues'): Record<string, string | string[] | number[]>[]
      flash(type: 'formValues', message: Record<string, string | string[] | number[]>): number
      sessionHelpers: {
        formattedChildrenNames: () => string
        parentNotMostlyLivedWith: () => string
        collectiveChildrenName: () => string
        mostlyLiveComplete: () => boolean
        whatWillHappenComplete: () => boolean
      }
      formattedAnswers: {
        mostlyLive: () => string
        whichSchedule: () => string
        willOvernightsHappen: () => string
        whichDaysOvernight: () => string
        willDaytimeVisitsHappen: () => string
        whichDaysDaytimeVisits: () => string
      }
    }
  }
}
