import i18n from 'i18n';

import { dayValues, planLastMinuteChangesField, whichDaysField, yesOrNo } from '../@types/fields';
import { WhichDays } from '../@types/session';

export const formatListOfStrings = (words: string[]) => {
  switch (words.length) {
    case 0:
      return '';
    case 1:
      return words[0];
    case 2:
      return words.join(' and ');
    default:
      return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
  }
};

export const convertBooleanValueToRadioButtonValue = (booleanValue: boolean): yesOrNo | undefined => {
  switch (booleanValue) {
    case true:
      return 'Yes';
    case false:
      return 'No';
    default:
      return undefined;
  }
};

export const convertWhichDaysFieldToSessionValue = (
  whichDays: whichDaysField,
  describeArrangement: string,
): WhichDays => {
  if (whichDays[0] === 'other') {
    return { describeArrangement };
  }

  return { days: whichDays as dayValues[] };
};

export const convertWhichDaysSessionValueToField = (whichDays: WhichDays | undefined): [whichDaysField, string?] => {
  if (whichDays?.describeArrangement) {
    return [['other'], whichDays.describeArrangement];
  }

  return [whichDays?.days, undefined];
};

//TODO does this translate days in welsh?
export const formatWhichDaysSessionValue = (whichDays: WhichDays | undefined): string => {
  if (!whichDays?.days) {
    return '';
  }

  const lowercaseDays = convertWhichDaysSessionValueToField(whichDays)[0];
  const uppercaseDays = lowercaseDays.map((day) => day.charAt(0).toUpperCase() + day.slice(1));

  if (uppercaseDays.length === 1) {
    return `a ${uppercaseDays[0]}`;
  }

  return formatListOfStrings(uppercaseDays);
};

export const formatPlanChangesOptionsIntoList = (field: planLastMinuteChangesField[] | undefined): string => {
  const translatedStrings = field.map(getTranslatedPlanChangesField).map((s) => s.toLowerCase());
  return formatListOfStrings(translatedStrings);
};

const getTranslatedPlanChangesField = (field: planLastMinuteChangesField) => {
  const ns = 'decisionMaking.planLastMinuteChanges';
  switch (field) {
    case 'text':
      return i18n.__(`${ns}.textMessage`);
    case 'phone':
      return i18n.__(`${ns}.phoneCall`);
    case 'email':
      return i18n.__(`${ns}.email`);
    case 'app':
      return i18n.__(`${ns}.app`);
    case 'anotherArrangement':
      return i18n.__(`${ns}.anotherArrangement`);
  }
};
