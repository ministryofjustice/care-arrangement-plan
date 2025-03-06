import { whereMostlyLive } from './fields'

export type Days = {
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
}

export type CAPSession = {
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
    whichSchedule?: {
      noDecisionRequired: boolean
      answer?: string
    }
    overnightVisits?: {
      willHappen: boolean
      whichDays?: {
        days?: days
        describeArrangement?: string
        noDecisionRequired?: boolean
      }
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
