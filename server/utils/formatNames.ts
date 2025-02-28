const formatNames = (names: string[]) => {
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

export default formatNames
