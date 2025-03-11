import { Router } from 'express'
import i18n from 'i18n'
import { body, matchedData, validationResult } from 'express-validator'
import paths from '../../constants/paths'
import formFields from '../../constants/formFields'
import { convertBooleanValueToRadioButtonValue } from '../../utils/formValueUtils'
import { yesOrNo } from '../../@types/fields'

const willOvernightsHappenRoutes = (router: Router) => {
  router.get(paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN, (request, response) => {
    const { livingAndVisiting } = request.session

    response.render('pages/livingAndVisiting/willOvernightsHappen', {
      errors: request.flash('errors'),
      title: i18n.__('livingAndVisiting.willOvernightsHappen.title', {
        adult: request.sessionHelpers.parentNotMostlyLivedWith(),
      }),
      backLinkHref: paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN,
      formValues: {
        [formFields.WILL_OVERNIGHTS_HAPPEN]: convertBooleanValueToRadioButtonValue(
          livingAndVisiting.overnightVisits?.willHappen,
        ),
      },
    })
  })

  router.post(
    paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN,
    // TODO C5141-1013: Add error messages
    body(formFields.WILL_OVERNIGHTS_HAPPEN).exists(),
    (request, response) => {
      const errors = validationResult(request)

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array())
        return response.redirect(paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN)
      }

      const formData = matchedData<{
        [formFields.WILL_OVERNIGHTS_HAPPEN]: yesOrNo
      }>(request)

      const willOvernightsHappen = formData[formFields.WILL_OVERNIGHTS_HAPPEN] === 'Yes'

      if (request.session.livingAndVisiting?.overnightVisits?.willHappen !== willOvernightsHappen) {
        request.session.livingAndVisiting = {
          ...request.session.livingAndVisiting,
          overnightVisits: {
            willHappen: willOvernightsHappen,
          },
        }
      }

      if (willOvernightsHappen) {
        return response.redirect(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT)
      }

      return response.redirect(paths.LIVING_VISITING_WILL_DAYTIME_VISITS_HAPPEN)
    },
  )
}

export default willOvernightsHappenRoutes
