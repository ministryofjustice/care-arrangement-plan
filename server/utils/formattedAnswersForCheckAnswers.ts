import i18n from 'i18n'
import { formatWhichDaysSessionValue } from './formValueUtils'
import { parentMostlyLivedWith, parentNotMostlyLivedWith } from './sessionHelpers'
import { CAPSession } from '../@types/session'
import { whereHandoverField } from '../@types/fields'

export const mostlyLive = (session: Partial<CAPSession>) => {
  const { livingAndVisiting, initialAdultName, secondaryAdultName } = session
  if (!livingAndVisiting.mostlyLive) return undefined
  switch (livingAndVisiting.mostlyLive.where) {
    case 'withInitial':
    case 'withSecondary':
      return i18n.__('livingAndVisiting.mostlyLive.with', { adult: parentMostlyLivedWith(session) })
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

export const whichSchedule = ({ livingAndVisiting }: Partial<CAPSession>) => {
  if (!livingAndVisiting.whichSchedule) return undefined
  return livingAndVisiting.whichSchedule.noDecisionRequired
    ? i18n.__('doNotNeedToDecide')
    : livingAndVisiting.whichSchedule.answer
}

export const willOvernightsHappen = ({ livingAndVisiting }: Partial<CAPSession>) => {
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

  return i18n.__('checkYourAnswers.livingAndVisiting.whichDaysOvernight', {
    adult: parentNotMostlyLivedWith(session),
    days: formatWhichDaysSessionValue(livingAndVisiting.overnightVisits.whichDays),
  })
}

export const willDaytimeVisitsHappen = ({ livingAndVisiting }: Partial<CAPSession>) => {
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

  return i18n.__('checkYourAnswers.livingAndVisiting.whichDaysDaytimeVisits', {
    adult: parentNotMostlyLivedWith(session),
    days: formatWhichDaysSessionValue(livingAndVisiting.daytimeVisits.whichDays),
  })
}

export const getBetweenHouseholds = ({
  handoverAndHolidays,
  initialAdultName,
  secondaryAdultName,
}: Partial<CAPSession>) => {
  if (handoverAndHolidays.getBetweenHouseholds.noDecisionRequired) {
    return i18n.__('doNotNeedToDecide')
  }
  switch (handoverAndHolidays.getBetweenHouseholds.how) {
    case 'initialCollects':
      return i18n.__('handoverAndHolidays.getBetweenHouseholds.collectsTheChildren', { adult: initialAdultName })
    case 'secondaryCollects':
      return i18n.__('handoverAndHolidays.getBetweenHouseholds.collectsTheChildren', { adult: secondaryAdultName })
    case 'other':
      return handoverAndHolidays.getBetweenHouseholds.describeArrangement
    default:
      return undefined
  }
}

export const whereHandover = ({ handoverAndHolidays, initialAdultName, secondaryAdultName }: Partial<CAPSession>) => {
  if (handoverAndHolidays.whereHandover.noDecisionRequired) {
    return i18n.__('doNotNeedToDecide')
  }

  const getAnswerForWhereHandoverWhere = (where: whereHandoverField) => {
    switch (where) {
      case 'neutral':
        return i18n.__('handoverAndHolidays.whereHandover.neutralLocation')
      case 'initialHome':
        return i18n.__('handoverAndHolidays.whereHandover.atHome', { adult: initialAdultName })
      case 'secondaryHome':
        return i18n.__('handoverAndHolidays.whereHandover.atHome', { adult: secondaryAdultName })
      case 'school':
        return i18n.__('handoverAndHolidays.whereHandover.atSchool')
      case 'someoneElse':
        return handoverAndHolidays.whereHandover.someoneElse
      default:
        return undefined
    }
  }

  return handoverAndHolidays.whereHandover.where.map(getAnswerForWhereHandoverWhere).join(', ')
}

export const willChangeDuringSchoolHolidays = ({ handoverAndHolidays }: Partial<CAPSession>) => {
  if (handoverAndHolidays.willChangeDuringSchoolHolidays.noDecisionRequired) {
    return i18n.__('doNotNeedToDecide')
  }
  return handoverAndHolidays.willChangeDuringSchoolHolidays.willChange ? i18n.__('yes') : i18n.__('no')
}

export const howChangeDuringSchoolHolidays = ({ handoverAndHolidays }: Partial<CAPSession>) => {
  if (!handoverAndHolidays.howChangeDuringSchoolHolidays) return undefined

  return handoverAndHolidays.howChangeDuringSchoolHolidays.noDecisionRequired
    ? i18n.__('doNotNeedToDecide')
    : handoverAndHolidays.howChangeDuringSchoolHolidays.answer
}

export const itemsForChangeover = ({ handoverAndHolidays }: Partial<CAPSession>) =>
  handoverAndHolidays.itemsForChangeover.noDecisionRequired
    ? i18n.__('doNotNeedToDecide')
    : handoverAndHolidays.itemsForChangeover.answer

export const whatWillHappen = ({ specialDays }: Partial<CAPSession>) =>
  specialDays.whatWillHappen.noDecisionRequired ? i18n.__('doNotNeedToDecide') : specialDays.whatWillHappen.answer

export const whatOtherThingsMatter = ({ otherThings }: Partial<CAPSession>) =>
  otherThings.whatOtherThingsMatter.noDecisionRequired
    ? i18n.__('doNotNeedToDecide')
    : otherThings.whatOtherThingsMatter.answer
