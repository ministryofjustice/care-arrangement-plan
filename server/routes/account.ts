import crypto from 'crypto';

import type { Request, Response, Router } from 'express-serve-static-core';

import config from '../config';
import paths from '../constants/paths';
import logger from '../logging/logger';
import { buildAuthorizeUrl, buildLogoutUrl, completeAuthorization, createAuthorizeRequest } from '../oneLogin/client';
import OneLoginError from '../oneLogin/error';

const returnPathsToIgnore = new Set<string>([
  paths.SIGN_IN,
  paths.ONE_LOGIN_CALLBACK,
  paths.SIGN_OUT,
  paths.SIGNED_OUT,
  paths.PASSWORD,
]);

const sameSecret = (left: string, right: string) => {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && crypto.timingSafeEqual(leftBytes, rightBytes);
};

// Returns one of this service's own paths. The request value is only compared, never redirected to.
const applicationPath = (candidate: unknown): paths => {
  if (typeof candidate !== 'string') {
    return paths.START;
  }

  const pathOnly = candidate.trim().split(/[?#]/, 1)[0];
  for (const path of Object.values(paths)) {
    if (!returnPathsToIgnore.has(path) && path === pathOnly) {
      return path;
    }
  }

  return paths.START;
};

const issuerRedirectUrl = (candidate: string) => {
  if (!config.oneLogin.enabled) {
    throw new OneLoginError('GOV.UK One Login is not enabled', 404);
  }

  const trusted = new URL(config.oneLogin.issuer);
  let target: URL;
  try {
    target = new URL(candidate);
  } catch {
    throw new OneLoginError('GOV.UK One Login returned an invalid redirect', 502);
  }

  const pathname = target.pathname;
  const pathIsSafe =
    pathname.startsWith('/') &&
    !pathname.startsWith('//') &&
    !pathname.includes('\\') &&
    !pathname.includes('\r') &&
    !pathname.includes('\n');

  if (target.origin !== trusted.origin || target.username || target.password || !pathIsSafe) {
    throw new OneLoginError('GOV.UK One Login returned an unexpected redirect', 502);
  }

  const safeUrl = new URL(trusted.origin);
  safeUrl.pathname = pathname;
  safeUrl.search = target.search;
  return safeUrl.href;
};

const renderProblem = (request: Request, response: Response, status: number) => {
  response.status(status).render('pages/oneLogin/problem', {
    title: request.__('oneLogin.problem.title'),
  });
};

const accountRoutes = (router: Router) => {
  router.get(paths.SIGN_IN, async (request, response, next) => {
    if (!config.oneLogin.enabled) {
      next();
      return;
    }

    try {
      const authorizeRequest = createAuthorizeRequest();
      request.session.returnUrl = applicationPath(request.query.returnURL ?? request.session.returnUrl);
      request.session.oneLoginRequest = {
        state: authorizeRequest.state,
        nonce: authorizeRequest.nonce,
        codeVerifier: authorizeRequest.codeVerifier,
      };
      const authorizeUrl = issuerRedirectUrl(
        await buildAuthorizeUrl({
          nonce: authorizeRequest.nonce,
          state: authorizeRequest.state,
          codeChallenge: authorizeRequest.codeChallenge,
          locale: request.session.lang,
        }),
      );
      response.redirect(authorizeUrl);
    } catch (error) {
      logger.error(error, 'Unable to start GOV.UK One Login');
      renderProblem(request, response, error instanceof OneLoginError ? error.status : 502);
    }
  });

  router.get(paths.ONE_LOGIN_CALLBACK, async (request, response, next) => {
    if (!config.oneLogin.enabled) {
      next();
      return;
    }

    const state = typeof request.query.state === 'string' ? request.query.state : undefined;
    const code = typeof request.query.code === 'string' ? request.query.code : undefined;
    const providerError = typeof request.query.error === 'string' ? request.query.error : undefined;
    const pending = request.session.oneLoginRequest;
    const stateMatches = Boolean(pending && state && sameSecret(state, pending.state));

    if (providerError || !pending || !stateMatches || !code) {
      logger.info('Rejected GOV.UK One Login callback', { providerError: providerError || 'invalid_callback' });
      renderProblem(request, response, 400);
      return;
    }

    const { nonce, codeVerifier } = pending;
    const returnPath = applicationPath(request.session.returnUrl);
    delete request.session.oneLoginRequest;

    try {
      const { idToken, user } = await completeAuthorization({
        code,
        codeVerifier,
        nonce,
      });

      request.session.regenerate((regenerateError) => {
        if (regenerateError) {
          next(regenerateError);
          return;
        }

        request.session.oneLogin = { ...user, idToken };
        logger.info('Received successful login request');
        response.redirect(returnPath);
      });
    } catch (error) {
      logger.error(error, 'GOV.UK One Login callback failed');
      renderProblem(request, response, error instanceof OneLoginError ? error.status : 502);
    }
  });

  router.get(paths.SIGN_OUT, async (request, response, next) => {
    if (!config.oneLogin.enabled) {
      next();
      return;
    }

    try {
      const idToken = request.session.oneLogin?.idToken;
      const logoutUrl = idToken ? issuerRedirectUrl(await buildLogoutUrl(idToken)) : paths.SIGNED_OUT;
      request.session.destroy((destroyError) => {
        if (destroyError) {
          next(destroyError);
          return;
        }
        response.redirect(logoutUrl);
      });
    } catch (error) {
      logger.error(error, 'Unable to sign out of GOV.UK One Login');
      renderProblem(request, response, error instanceof OneLoginError ? error.status : 502);
    }
  });

  router.get(paths.SIGNED_OUT, (request, response, next) => {
    if (!config.oneLogin.enabled) {
      next();
      return;
    }

    response.render('pages/oneLogin/signedOut', {
      title: request.__('oneLogin.signedOut.title'),
    });
  });
};

export default accountRoutes;
