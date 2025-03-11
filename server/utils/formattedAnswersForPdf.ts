import i18n from 'i18n'
import { CAPSession } from '../@types/session'

// eslint-disable-next-line import/prefer-default-export
export const whatWillHappen = (session: Partial<CAPSession>) =>
  session.specialDays.whatWillHappen.noDecisionRequired
    ? i18n.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', { senderName: session.initialAdultName })
    : `${i18n.__('sharePlan.yourProposedPlan.senderSuggested', { senderName: session.initialAdultName })}\n"${session.specialDays.whatWillHappen.answer}"`
