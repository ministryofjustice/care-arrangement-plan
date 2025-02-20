import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig(),
  {
    rules: {
      'no-underscore-dangle': 'off', // This is needed for i18n
    },
  },
]
