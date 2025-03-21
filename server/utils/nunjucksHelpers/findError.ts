import { FieldValidationError } from 'express-validator';

// find specific error and return errorMessage for field validation
const findError = (errors: FieldValidationError[], formFieldId: string) => {
  if (!errors) return null;
  const errorForMessage = errors.find((error) => error.path === formFieldId);

  if (errorForMessage === undefined) return null;

  return {
    text: errorForMessage?.msg,
  };
};

export default findError;
