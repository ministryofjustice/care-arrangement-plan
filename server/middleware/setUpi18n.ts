import { Router } from 'express'
import i18n from 'i18n'
import path from 'path'
import config from '../config'

const setUpi18n = (): Router => {
  const router = Router()

  const { includeWelshLanguage } = config

  // TODO - add a language toggle within the page
  i18n.configure({
    defaultLocale: 'en',
    locales: includeWelshLanguage ? ['en', 'cy'] : ['en'],
    queryParameter: 'lang',
    directory: path.resolve(__dirname, '../locales'),
    updateFiles: false,
    retryInDefaultLocale: true,
    objectNotation: true,
  })

  router.use(i18n.init)

  return router
}

export default setUpi18n
