import { Request } from 'express';

import { dayValues, whichDaysField, yesOrNo } from '../@types/fields';
import { WhichDays } from '../@types/session';

export const formatListOfStrings = (words: string[], request: Request) => {
  switch (words.length) {
    case 0:
      return '';
    case 1:
      return words[0];
    case 2:
      return request.__('aAndB', { itemA: words[0], itemB: words[1] });
    default:
      return request.__('aAndB', { itemA: words.slice(0, -1).join(', '), itemB: words[words.length - 1] });
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

export const formatWhichDaysSessionValue = (whichDays: WhichDays | undefined, request: Request): string => {
  if (!whichDays?.days) {
    return '';
  }

  const days = convertWhichDaysSessionValueToField(whichDays)[0].map((day) => request.__(`days.${day}`));

  if (days.length === 1) {
    return request.__('aItem', { item: days[0] });
  }

  return formatListOfStrings(days, request);
};

export const formatPlanChangesOptionsIntoList = (request: Request): string => {
  const translatedStrings = request.session.decisionMaking.planLastMinuteChanges.options
    .map((option) => request.__(`decisionMaking.planLastMinuteChanges.${option}`))
    .map((s) => s.toLowerCase());
  return formatListOfStrings(translatedStrings, request);
};
