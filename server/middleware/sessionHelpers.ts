import { NextFunction, Request, Response } from 'express'
import i18n from 'i18n'
import { formatNames } from '../utils/formValueUtils'

const sessionHelpers = (request: Request, _response: Response, next: NextFunction) => {
  const { namesOfChildren, livingAndVisiting, initialAdultName, secondaryAdultName, specialDays, numberOfChildren } =
    request.session

  request.sessionHelpers = {
    formattedChildrenNames: () => formatNames(namesOfChildren),
    parentNotMostlyLivedWith: () =>
      livingAndVisiting.mostlyLive.where === 'withInitial' ? secondaryAdultName : initialAdultName,
    collectiveChildrenName: () => (numberOfChildren === 1 ? namesOfChildren[0] : i18n.__('theChildren')),
    whatWillHappenAnswer: () =>
      specialDays.whatWillHappen.noDecisionRequired ? i18n.__('doNotNeedToDecide') : specialDays.whatWillHappen.answer,
  }

  next()
}

export default sessionHelpers
