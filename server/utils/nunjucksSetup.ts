import fs from 'fs';
import path from 'path';

import express from 'express';
import i18n from 'i18n';
import { configure as configureNunjucks } from 'nunjucks';

import config from '../config';
import cookieNames from '../constants/cookieNames';
import formFields from '../constants/formFields';
import paths from '../constants/paths';
import logger from '../logging/logger';

import getAssetPath from './getAssetPath';
import errorSummaryList from './nunjucksHelpers/errorSummaryList';
import findError from './nunjucksHelpers/findError';
import urlize from './nunjucksHelpers/urlize';

const nunjucksSetup = (app: express.Express): void => {
  app.set('view engine', 'njk');

  let assetManifest: Record<string, string> = {};

  try {
    const assetMetadataPath = getAssetPath('manifest.json');
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'));
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error(e, 'Could not read asset manifest file');
    }
  }

  const njkEnv = configureNunjucks([path.join(__dirname, '../views'), 'node_modules/govuk-frontend/dist/'], {
    autoescape: true,
    express: app,
  });

  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url);
  njkEnv.addGlobal('feedbackUrl', config.feedbackUrl);
  njkEnv.addGlobal('contactEmail', config.contactEmail);
  njkEnv.addGlobal(
    'previewEnd',
    config.previewEnd.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
  );
  njkEnv.addGlobal('paths', paths);
  njkEnv.addGlobal('formFields', formFields);
  njkEnv.addGlobal('cookieNames', cookieNames);
  njkEnv.addGlobal('__', i18n.__);
  njkEnv.addGlobal('getLocale', () => i18n.getLocale);
  njkEnv.addFilter('findError', findError);
  njkEnv.addFilter('errorSummaryList', errorSummaryList);
  njkEnv.addFilter('customUrlize', urlize);
};

export default nunjucksSetup;
