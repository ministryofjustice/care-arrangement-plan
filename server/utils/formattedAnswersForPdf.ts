import i18n from 'i18n'
import { CAPSession } from '../@types/session'
import { parentMostlyLivedWith, parentNotMostlyLivedWith } from './sessionHelpers'
import { formatWhichDaysSessionValue } from './formValueUtils'
import { whereHandoverField } from '../@types/fields'

const senderSuggested = (senderName: string, suggestion: string) =>
  `${i18n.__('sharePlan.yourProposedPlan.senderSuggested', { senderName })}\n"${suggestion}"`

export const mostlyLive = (session: Partial<CAPSession>) => {
  const { livingAndVisiting, initialAdultName, secondaryAdultName } = session
  if (!livingAndVisiting.mostlyLive) return undefined
  switch (livingAndVisiting.mostlyLive.where) {
    case 'withInitial':
    case 'withSecondary':
      return i18n.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedLiveWith', {
        senderName: initialAdultName,
        adult: parentMostlyLivedWith(session),
      })
    case 'split':
      return i18n.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedSplit', {
        senderName: initialAdultName,
        otherAdult: secondaryAdultName,
      })
    case 'other':
      return senderSuggested(session.initialAdultName, livingAndVisiting.mostlyLive.describeArrangement)
    default:
      return undefined
  }
}

export const whichSchedule = ({ livingAndVisiting, initialAdultName }: Partial<CAPSession>) => {
  if (!livingAndVisiting.whichSchedule) return undefined
  return livingAndVisiting.whichSchedule.noDecisionRequired
    ? i18n.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName })
    : senderSuggested(initialAdultName, livingAndVisiting.whichSchedule.answer)
}

export const willOvernightsHappen = (session: Partial<CAPSession>) => {
  const { livingAndVisiting, initialAdultName } = session
  if (!livingAndVisiting.overnightVisits) return undefined
  return livingAndVisiting.overnightVisits.willHappen
    ? i18n.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedStayOvernight', {
        senderName: initialAdultName,
        adult: parentNotMostlyLivedWith(session),
      })
    : i18n.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedNoOvernights', { senderName: initialAdultName })
}

export const whichDaysOvernight = ({ livingAndVisiting, initialAdultName }: Partial<CAPSession>) => {
  if (!livingAndVisiting.overnightVisits?.whichDays) return undefined
  if (livingAndVisiting.overnightVisits.whichDays.describeArrangement) {
    return senderSuggested(initialAdultName, livingAndVisiting.overnightVisits.whichDays.describeArrangement)
  }
  if (livingAndVisiting.overnightVisits.whichDays.noDecisionRequired) {
    return i18n.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName })
  }

  return i18n.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedOvernightDays', {
    senderName: initialAdultName,
    days: formatWhichDaysSessionValue(livingAndVisiting.overnightVisits.whichDays),
  })
}

export const willDaytimeVisitsHappen = (session: Partial<CAPSession>) => {
  const { livingAndVisiting, initialAdultName } = session
  if (!livingAndVisiting.daytimeVisits) return undefined
  return livingAndVisiting.daytimeVisits.willHappen
    ? i18n.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedDaytimeVisits', {
        senderName: initialAdultName,
        adult: parentNotMostlyLivedWith(session),
      })
    : i18n.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedNoDaytimeVisits', { senderName: initialAdultName })
}

export const whichDaysDaytimeVisits = ({ livingAndVisiting, initialAdultName }: Partial<CAPSession>) => {
  if (!livingAndVisiting.daytimeVisits?.whichDays) return undefined
  if (livingAndVisiting.daytimeVisits.whichDays.describeArrangement) {
    return senderSuggested(initialAdultName, livingAndVisiting.daytimeVisits.whichDays.describeArrangement)
  }
  if (livingAndVisiting.daytimeVisits?.whichDays.noDecisionRequired) {
    return i18n.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName })
  }

  return i18n.__('sharePlan.yourProposedPlan.livingAndVisiting.suggestedDaytimeVisitDays', {
    senderName: initialAdultName,
    days: formatWhichDaysSessionValue(livingAndVisiting.daytimeVisits.whichDays),
  })
}

export const getBetweenHouseholds = ({
  handoverAndHolidays,
  initialAdultName,
  secondaryAdultName,
}: Partial<CAPSession>) => {
  if (handoverAndHolidays.getBetweenHouseholds.noDecisionRequired) {
    return i18n.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName })
  }
  switch (handoverAndHolidays.getBetweenHouseholds.how) {
    case 'initialCollects':
      return i18n.__('sharePlan.yourProposedPlan.handoverAndHolidays.suggestedCollects', {
        senderName: initialAdultName,
        adult: initialAdultName,
      })
    case 'secondaryCollects':
      return i18n.__('sharePlan.yourProposedPlan.handoverAndHolidays.suggestedCollects', {
        senderName: initialAdultName,
        adult: secondaryAdultName,
      })
    case 'other':
      return senderSuggested(initialAdultName, handoverAndHolidays.getBetweenHouseholds.describeArrangement)
    default:
      return undefined
  }
}

export const whereHandover = ({ handoverAndHolidays, initialAdultName, secondaryAdultName }: Partial<CAPSession>) => {
  if (handoverAndHolidays.whereHandover.noDecisionRequired) {
    return i18n.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName })
  }

  // TODO
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

export const willChangeDuringSchoolHolidays = ({ handoverAndHolidays, initialAdultName }: Partial<CAPSession>) => {
  if (handoverAndHolidays.willChangeDuringSchoolHolidays.noDecisionRequired) {
    return i18n.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName })
  }
  return handoverAndHolidays.willChangeDuringSchoolHolidays.willChange
    ? i18n.__('sharePlan.yourProposedPlan.handoverAndHolidays.suggestedChangeDuringSchoolHolidays', {
        senderName: initialAdultName,
      })
    : i18n.__('sharePlan.yourProposedPlan.handoverAndHolidays.suggestedNoChangeDuringSchoolHolidays', {
        senderName: initialAdultName,
      })
}

export const howChangeDuringSchoolHolidays = ({ handoverAndHolidays, initialAdultName }: Partial<CAPSession>) => {
  if (!handoverAndHolidays.howChangeDuringSchoolHolidays) return undefined

  return handoverAndHolidays.howChangeDuringSchoolHolidays.noDecisionRequired
    ? i18n.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName })
    : senderSuggested(initialAdultName, handoverAndHolidays.howChangeDuringSchoolHolidays.answer)
}

export const itemsForChangeover = ({ handoverAndHolidays, initialAdultName }: Partial<CAPSession>) =>
  handoverAndHolidays.itemsForChangeover.noDecisionRequired
    ? i18n.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName })
    : senderSuggested(initialAdultName, handoverAndHolidays.itemsForChangeover.answer)

export const whatWillHappen = ({ specialDays, initialAdultName }: Partial<CAPSession>) =>
  specialDays.whatWillHappen.noDecisionRequired
    ? i18n.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName })
    : senderSuggested(initialAdultName, specialDays.whatWillHappen.answer)
