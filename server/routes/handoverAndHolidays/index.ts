import { Router } from 'express'
import getBetweenHouseholds from './getBetweenHouseholds'

const handoverAndHolidaysRoutes = (router: Router) => {
  getBetweenHouseholds(router)
}

export default handoverAndHolidaysRoutes
