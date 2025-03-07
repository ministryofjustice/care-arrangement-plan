import { NextFunction, Request, Response } from 'express'
import i18n from 'i18n'
import { formatListOfStrings } from '../utils/formValueUtils'

const sessionHelpers = (request: Request, _response: Response, next: NextFunction) => {
  const { namesOfChildren, livingAndVisiting, initialAdultName, secondaryAdultName, specialDays, numberOfChildren } =
    request.session

  request.sessionHelpers = {
    formattedChildrenNames: () => formatListOfStrings(namesOfChildren),
    parentNotMostlyLivedWith: () =>
      livingAndVisiting.mostlyLive.where === 'withInitial' ? secondaryAdultName : initialAdultName,
    collectiveChildrenName: () => (numberOfChildren === 1 ? namesOfChildren[0] : i18n.__('theChildren')),
    mostlyLiveComplete: () => {
      if (!livingAndVisiting?.mostlyLive) return false

      const { mostlyLive, overnightVisits, daytimeVisits, whichSchedule } = livingAndVisiting

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
    },
    whatWillHappenComplete: () => !!specialDays?.whatWillHappen,
  }

  next()
}

export default sessionHelpers
