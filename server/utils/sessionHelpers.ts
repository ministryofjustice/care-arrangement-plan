import { formatListOfStrings } from './formValueUtils'
import { CAPSession } from '../@types/session'

export const formattedChildrenNames = (session: Partial<CAPSession>) => formatListOfStrings(session.namesOfChildren)

export const parentMostlyLivedWith = (session: Partial<CAPSession>) =>
  session.livingAndVisiting.mostlyLive.where === 'withInitial' ? session.initialAdultName : session.secondaryAdultName

export const parentNotMostlyLivedWith = (session: Partial<CAPSession>) =>
  session.livingAndVisiting.mostlyLive.where === 'withInitial' ? session.secondaryAdultName : session.initialAdultName

export const mostlyLiveComplete = (session: Partial<CAPSession>) => {
  if (!session.livingAndVisiting?.mostlyLive) return false

  const { mostlyLive, overnightVisits, daytimeVisits, whichSchedule } = session.livingAndVisiting

  if (mostlyLive.where === 'other') {
    return true
  }
  if (mostlyLive.where === 'split') {
    return !!whichSchedule
  }

  const overnightComplete =
    overnightVisits?.willHappen !== undefined && (!overnightVisits.willHappen || !!overnightVisits.whichDays)
  const daytimeVisitsComplete =
    daytimeVisits?.willHappen !== undefined && (!daytimeVisits.willHappen || !!daytimeVisits.whichDays)
  return overnightComplete && daytimeVisitsComplete
}

export const getBetweenHouseholdsComplete = (session: Partial<CAPSession>) =>
  !!session.handoverAndHolidays?.getBetweenHouseholds

export const whereHandoverComplete = (session: Partial<CAPSession>) => !!session.handoverAndHolidays?.whereHandover

export const willChangeDuringSchoolHolidaysComplete = ({ handoverAndHolidays }: Partial<CAPSession>) => {
  if (!handoverAndHolidays?.willChangeDuringSchoolHolidays) return false

  return !(
    handoverAndHolidays.willChangeDuringSchoolHolidays.willChange && !handoverAndHolidays.howChangeDuringSchoolHolidays
  )
}

export const itemsForChangeoverComplete = (session: Partial<CAPSession>) =>
  !!session.handoverAndHolidays?.itemsForChangeover

export const whatWillHappenComplete = (session: Partial<CAPSession>) => !!session.specialDays?.whatWillHappen
