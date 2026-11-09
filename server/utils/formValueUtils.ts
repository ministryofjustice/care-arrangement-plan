import { Request } from 'express';

import { dayValues, itemsForChangeoverField, whichDaysField, yesOrNo } from '../@types/fields';
import { WhichDays } from '../@types/session';

const escapeHtmlText = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export const formatUnorderedList = (items: Array<string | undefined>): string | undefined => {
  const labels = items.filter((item): item is string => !!item);
  if (!labels.length) return undefined;

  const listItems = labels.map((item) => `<li>${escapeHtmlText(item)}</li>`).join('');
  return `<ul class="govuk-list govuk-list--bullet govuk-!-margin-bottom-0">${listItems}</ul>`;
};

export const formatListOfStrings = (words: string[], request: Request) => {
  if (!words) {
    return '';
  }
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

const itemsForChangeoverLabels = (
  options: itemsForChangeoverField[] | undefined,
  describeArrangement: string | undefined,
  request: Request,
) => {
  if (!options?.length) return [];

  return options
    .map((option) =>
      option === 'otherItems'
        ? describeArrangement
        : request.__(`handoverAndHolidays.itemsForChangeover.items.${option}`),
    )
    .filter((label): label is string => !!label);
};

export const formatItemsForChangeover = (
  options: itemsForChangeoverField[] | undefined,
  describeArrangement: string | undefined,
  request: Request,
) => {
  const labels = itemsForChangeoverLabels(options, describeArrangement, request);
  return labels.length ? labels.join(', ') : undefined;
};

export const formatItemsForChangeoverList = (
  options: itemsForChangeoverField[] | undefined,
  describeArrangement: string | undefined,
  request: Request,
) => formatUnorderedList(itemsForChangeoverLabels(options, describeArrangement, request));

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
