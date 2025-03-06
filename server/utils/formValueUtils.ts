import { dayValues, whichDaysField, yesOrNo } from '../@types/fields'
import { Days, WhichDays } from '../@types/session'

const daysOfWeek: dayValues[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export const formatNames = (names: string[]) => {
  switch (names.length) {
    case 0:
      return ''
    case 1:
      return names[0]
    case 2:
      return names.join(' and ')
    default:
      return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
  }
}

export const convertBooleanValueToRadioButtonValue = (booleanValue: boolean): yesOrNo | undefined => {
  switch (booleanValue) {
    case true:
      return 'Yes'
    case false:
      return 'No'
    default:
      return undefined
  }
}

export const convertWhichDaysFieldToSessionValue = (
  whichDays: whichDaysField,
  describeArrangement: string,
): WhichDays => {
  if (whichDays[0] === 'other') {
    return { describeArrangement }
  }

  return {
    days: daysOfWeek.reduce((acc, day) => {
      acc[day] = whichDays.includes(day)
      return acc
    }, {} as Days),
  }
}

export const convertWhichDaysSessionValueToField = (whichDays: WhichDays | undefined): [whichDaysField, string?] => {
  if (whichDays?.describeArrangement) {
    return [['other'], whichDays.describeArrangement]
  }

  return [daysOfWeek.filter(day => whichDays?.days?.[day])]
}
