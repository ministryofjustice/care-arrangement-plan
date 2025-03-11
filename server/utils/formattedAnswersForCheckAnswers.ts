import i18n from 'i18n'
import { formatWhichDatsSessionValue } from './formValueUtils'
import { parentNotMostlyLivedWith } from './sessionHelpers'
import { CAPSession } from '../@types/session'

export const mostlyLive = (session: Partial<CAPSession>) => {
  const { livingAndVisiting, initialAdultName, secondaryAdultName } = session
  if (!livingAndVisiting.mostlyLive) return undefined
  switch (livingAndVisiting.mostlyLive.where) {
    case 'withInitial':
      return i18n.__('livingAndVisiting.mostlyLive.with', { adult: initialAdultName })
    case 'withSecondary':
      return i18n.__('livingAndVisiting.mostlyLive.with', { adult: secondaryAdultName })
    case 'split':
      return i18n.__('livingAndVisiting.mostlyLive.split', {
        initialAdult: initialAdultName,
        secondaryAdult: secondaryAdultName,
      })
    case 'other':
      return livingAndVisiting.mostlyLive.describeArrangement
    default:
      return undefined
  }
}

export const whichSchedule = (session: Partial<CAPSession>) => {
  const { livingAndVisiting } = session
  if (!livingAndVisiting.whichSchedule) return undefined
  return livingAndVisiting.whichSchedule.noDecisionRequired
    ? i18n.__('doNotNeedToDecide')
    : livingAndVisiting.whichSchedule.answer
}

export const willOvernightsHappen = (session: Partial<CAPSession>) => {
  const { livingAndVisiting } = session
  if (!livingAndVisiting.overnightVisits) return undefined
  return livingAndVisiting.overnightVisits.willHappen ? i18n.__('yes') : i18n.__('no')
}

export const whichDaysOvernight = (session: Partial<CAPSession>) => {
  const { livingAndVisiting } = session
  if (!livingAndVisiting.overnightVisits?.whichDays) return undefined
  if (livingAndVisiting.overnightVisits.whichDays.describeArrangement) {
    return livingAndVisiting.overnightVisits.whichDays.describeArrangement
  }
  if (livingAndVisiting.overnightVisits.whichDays.noDecisionRequired) {
    return i18n.__('doNotNeedToDecide')
  }

  return i18n.__('livingAndVisiting.whichDaysOvernight.answer', {
    adult: parentNotMostlyLivedWith(session),
    days: formatWhichDatsSessionValue(livingAndVisiting.overnightVisits.whichDays),
  })
}

export const willDaytimeVisitsHappen = (session: Partial<CAPSession>) => {
  const { livingAndVisiting } = session
  if (!livingAndVisiting.daytimeVisits) return undefined
  return livingAndVisiting.daytimeVisits.willHappen ? i18n.__('yes') : i18n.__('no')
}

export const whichDaysDaytimeVisits = (session: Partial<CAPSession>) => {
  const { livingAndVisiting } = session
  if (!livingAndVisiting.daytimeVisits?.whichDays) return undefined
  if (livingAndVisiting.daytimeVisits.whichDays.describeArrangement) {
    return livingAndVisiting.daytimeVisits?.whichDays.describeArrangement
  }
  if (livingAndVisiting.daytimeVisits?.whichDays.noDecisionRequired) {
    return i18n.__('doNotNeedToDecide')
  }

  return i18n.__('livingAndVisiting.whichDaysDaytimeVisits.answer', {
    adult: parentNotMostlyLivedWith(session),
    days: formatWhichDatsSessionValue(livingAndVisiting.daytimeVisits.whichDays),
  })
}

export const whatWillHappen = (session: Partial<CAPSession>) =>
  session.specialDays.whatWillHappen.noDecisionRequired
    ? i18n.__('doNotNeedToDecide')
    : session.specialDays.whatWillHappen.answer
