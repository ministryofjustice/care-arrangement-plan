import logger from './logger'
import createApp from './server/app'

const app = createApp()

app.listen(app.get('port'), () => {
  logger.info(`Server listening on port ${app.get('port')}`)
})
