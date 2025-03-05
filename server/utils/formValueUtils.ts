import { yesOrNo } from '../@types/fields'

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
