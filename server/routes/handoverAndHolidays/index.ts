import { Router } from 'express'
import getBetweenHouseholdsRoutes from './getBetweenHouseholds'
import whereHandoverRoutes from './whereHandover'
import willChangeDuringSchoolHolidaysRoutes from './willChangeDuringSchoolHolidays'

const handoverAndHolidaysRoutes = (router: Router) => {
  getBetweenHouseholdsRoutes(router)
  whereHandoverRoutes(router)
  willChangeDuringSchoolHolidaysRoutes(router)
}

export default handoverAndHolidaysRoutes
