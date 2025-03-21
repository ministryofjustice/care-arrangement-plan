// convert errors to format for GOV.UK error summary component
import { FieldValidationError } from 'express-validator';

const errorSummaryList = (errors: FieldValidationError[] = []) => {
  return errors.map((error) => {
    return {
      text: error.msg,
      href: error.path ? `#${error.path}-error` : undefined,
    };
  });
};

export default errorSummaryList;
