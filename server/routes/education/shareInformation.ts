import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { educationShareInformationField } from '../../@types/fields';
import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { formattedChildrenNames, getBackUrl } from '../../utils/sessionHelpers';

const shareInformationRoutes = (router: Router) => {
  router.get(paths.EDUCATION_SHARE_INFORMATION, checkFormProgressFromConfig(FORM_STEPS.EDUCATION_SHARE_INFORMATION), (request, response) => {
    const errors = request.flash('errors');
    const childName = formattedChildrenNames(request);
    const formValues = {
      [formFields.EDUCATION_SHARE_INFORMATION_OPTION]: request.session.education?.shareInformation?.options?.[0],
      [formFields.EDUCATION_SHARE_INFORMATION_DESCRIBE_ARRANGEMENT]: request.session.education?.shareInformation?.describeArrangement,
      ...request.flash('formValues')?.[0],
    };

    response.render('pages/education/shareInformation', {
      title: request.__('education.shareInformation.title', { childName }),
      backLinkHref: getBackUrl(request.session, paths.TASK_LIST),
      errors,
      formValues,
    });
  });

  router.post(
    paths.EDUCATION_SHARE_INFORMATION,
    checkFormProgressFromConfig(FORM_STEPS.EDUCATION_SHARE_INFORMATION),
    (request, response, next) => {
      if (request.body.skip !== 'true') {
        return next();
      }

      request.session.education = {
        ...request.session.education,
        shareInformation: {
          ...request.session.education?.shareInformation,
          noDecisionRequired: true,
          options: undefined,
          describeArrangement: undefined,
        },
      };

      addCompletedStep(request, FORM_STEPS.EDUCATION_SHARE_INFORMATION);

      return response.redirect(paths.EDUCATION_ROUTINE_DECISIONS);
    },
    body(formFields.EDUCATION_SHARE_INFORMATION_OPTION)
      .notEmpty()
      .withMessage((_value, { req }) => req.__('education.shareInformation.emptyError')),
    body(formFields.EDUCATION_SHARE_INFORMATION_DESCRIBE_ARRANGEMENT)
      .if(body(formFields.EDUCATION_SHARE_INFORMATION_OPTION).equals('anotherArrangement'))
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('education.shareInformation.descriptionEmptyError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.EDUCATION_SHARE_INFORMATION_DESCRIBE_ARRANGEMENT]: string;
        [formFields.EDUCATION_SHARE_INFORMATION_OPTION]: educationShareInformationField;
      }>(request, { onlyValidData: false });

      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.EDUCATION_SHARE_INFORMATION);
      }

      const {
        [formFields.EDUCATION_SHARE_INFORMATION_OPTION]: option,
        [formFields.EDUCATION_SHARE_INFORMATION_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData;

      request.session.education = {
        ...request.session.education,
        shareInformation: {
          ...request.session.education?.shareInformation,
          noDecisionRequired: false,
          options: [option],
          describeArrangement: option === 'anotherArrangement' ? describeArrangement : undefined,
        },
      };

      addCompletedStep(request, FORM_STEPS.EDUCATION_SHARE_INFORMATION);

      return response.redirect(paths.EDUCATION_ROUTINE_DECISIONS);
    },
  );
};

export default shareInformationRoutes;
