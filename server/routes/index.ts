import { Router } from 'express'

const routes = (): Router => {
  const router = Router()
  router.get('/', async (request, response) => {
    response.render('pages/index')
  })

  return router
}

export default routes
