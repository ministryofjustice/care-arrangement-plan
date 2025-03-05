import { whereMostlyLive } from '../fields'

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    nowInMinutes: number
    courtOrderInPlace: boolean
    numberOfChildren: number
    namesOfChildren: string[]
    initialAdultName: string
    secondaryAdultName: string
    livingAndVisiting?: {
      mostlyLive?: {
        where: whereMostlyLive
        describeArrangement?: string
      }
      overnightVisits?: {
        willHappen: boolean
      }
      daytimeVisits?: {
        willHappen: boolean
      }
    }
    specialDays?: {
      whatWillHappen?: {
        noDecisionRequired: boolean
        answer?: string
      }
    }
  }
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
        whatWillHappenAnswer: () => string
      }
    }
  }
}
