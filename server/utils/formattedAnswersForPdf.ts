import i18n from 'i18n'
import { CAPSession } from '../@types/session'
import { parentMostlyLivedWith, parentNotMostlyLivedWith } from './sessionHelpers'
import { formatWhichDatsSessionValue } from './formValueUtils'

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
    days: formatWhichDatsSessionValue(livingAndVisiting.overnightVisits.whichDays),
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
    days: formatWhichDatsSessionValue(livingAndVisiting.daytimeVisits.whichDays),
  })
}

export const whatWillHappen = ({ specialDays, initialAdultName }: Partial<CAPSession>) =>
  specialDays.whatWillHappen.noDecisionRequired
    ? i18n.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: initialAdultName })
    : senderSuggested(initialAdultName, specialDays.whatWillHappen.answer)
