import express, { Router } from 'express'

const setUpWebRequestParsing = (): Router => {
  const router = express.Router()
  router.use(express.json())
  router.use(express.urlencoded({ extended: true }))
  return router
}

export default setUpWebRequestParsing
