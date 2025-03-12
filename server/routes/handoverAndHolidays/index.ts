import { Router } from 'express'
import getBetweenHouseholds from './getBetweenHouseholds'
import whereHandover from './whereHandover'

const handoverAndHolidaysRoutes = (router: Router) => {
  getBetweenHouseholds(router)
  whereHandover(router)
}

export default handoverAndHolidaysRoutes
