import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import fs from 'fs'
import i18n from 'i18n'
import logger from '../../logger'

const nunjucksSetup = (app: express.Express): void => {
  app.set('view engine', 'njk')

  let assetManifest: Record<string, string> = {}

  try {
    const assetMetadataPath = path.resolve(__dirname, '../../assets/manifest.json')
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'))
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error(e, 'Could not read asset manifest file')
    }
  }

  const njkEnv = nunjucks.configure([path.join(__dirname, '../views'), 'node_modules/govuk-frontend/dist/'], {
    autoescape: true,
    express: app,
  })

  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)
  njkEnv.addGlobal('__', i18n.__)
  njkEnv.addGlobal('getLocale', () => i18n.getLocale)
  // convert errors to format for GOV.UK error summary component
  njkEnv.addFilter('errorSummaryList', (errors = []) => {
    return Object.keys(errors).map(error => {
      return {
        text: errors[error].msg,
        href: errors[error].path ? `#${errors[error].path}-error` : undefined,
      }
    })
  })
}

export default nunjucksSetup
