import { NextFunction, Request, Response } from 'express'
import i18n from 'i18n'
import { convertWhichDaysSessionValueToField, formatListOfStrings } from '../utils/formValueUtils'

const formattedAnswers = (request: Request, _response: Response, next: NextFunction) => {
  const { livingAndVisiting, initialAdultName, secondaryAdultName, specialDays } = request.session

  request.formattedAnswers = {
    mostlyLive: () => {
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
    },
    whichSchedule: () => {
      if (!livingAndVisiting.whichSchedule) return undefined
      return livingAndVisiting.whichSchedule.noDecisionRequired
        ? i18n.__('doNotNeedToDecide')
        : livingAndVisiting.whichSchedule.answer
    },
    willOvernightsHappen: () => {
      if (!livingAndVisiting.overnightVisits) return undefined
      return livingAndVisiting.overnightVisits.willHappen ? i18n.__('yes') : i18n.__('no')
    },
    whichDaysOvernight: () => {
      if (!livingAndVisiting.overnightVisits?.whichDays) return undefined
      if (livingAndVisiting.overnightVisits.whichDays.describeArrangement) {
        return livingAndVisiting.overnightVisits.whichDays.describeArrangement
      }
      if (livingAndVisiting.overnightVisits.whichDays.noDecisionRequired) {
        return i18n.__('doNotNeedToDecide')
      }

      const days = convertWhichDaysSessionValueToField(livingAndVisiting.overnightVisits.whichDays)[0].map(
        day => day.charAt(0).toUpperCase() + day.slice(1),
      )

      return i18n.__('livingAndVisiting.whichDaysOvernight.answer', {
        adult: request.sessionHelpers.parentNotMostlyLivedWith(),
        days: formatListOfStrings(days),
      })
    },
    willDaytimeVisitsHappen: () => {
      if (!livingAndVisiting.daytimeVisits) return undefined
      return livingAndVisiting.daytimeVisits.willHappen ? i18n.__('yes') : i18n.__('no')
    },
    whichDaysDaytimeVisits: () => {
      if (!livingAndVisiting.daytimeVisits?.whichDays) return undefined
      if (livingAndVisiting.daytimeVisits.whichDays.describeArrangement) {
        return livingAndVisiting.daytimeVisits?.whichDays.describeArrangement
      }
      if (livingAndVisiting.daytimeVisits?.whichDays.noDecisionRequired) {
        return i18n.__('doNotNeedToDecide')
      }

      const days = convertWhichDaysSessionValueToField(livingAndVisiting.daytimeVisits.whichDays)[0].map(
        day => day.charAt(0).toUpperCase() + day.slice(1),
      )

      return i18n.__('livingAndVisiting.whichDaysDaytimeVisits.answer', {
        adult: request.sessionHelpers.parentNotMostlyLivedWith(),
        days: formatListOfStrings(days),
      })
    },
    whatWillHappen: () =>
      specialDays.whatWillHappen.noDecisionRequired ? i18n.__('doNotNeedToDecide') : specialDays.whatWillHappen.answer,
  }

  next()
}

export default formattedAnswers
