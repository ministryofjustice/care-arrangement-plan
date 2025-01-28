import i18n from 'i18n'
import express from 'express'
import path from 'path'

import config from '../config'

const { includeWelshLanguage } = config

const i18nSetup = (app: express.Express): void => {
  // TODO - add a language toggle within the page
  i18n.configure({
    defaultLocale: 'en',
    locales: includeWelshLanguage ? ['en', 'cy'] : ['en'],
    queryParameter: 'lang',
    directory: path.resolve(__dirname, '../locales'),
    updateFiles: false,
    retryInDefaultLocale: true,
  })

  app.use(i18n.init)
}

export default i18nSetup
