import express, { Router } from 'express'
import config from '../config'

const { buildNumber, gitRef, branchName } = config

const setUpHealthCheck = (): Router => {
  const router = express.Router()

  router.get('/health', (_, response, next) => {
    response.json({
      gitHash: gitRef,
      branch: branchName,
      version: buildNumber,
      uptime: Math.floor(process.uptime()),
    })
  })
  return router
}

export default setUpHealthCheck
