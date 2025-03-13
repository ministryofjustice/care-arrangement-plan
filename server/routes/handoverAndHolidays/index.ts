import { Router } from 'express'
import getBetweenHouseholdsRoutes from './getBetweenHouseholds'
import whereHandoverRoutes from './whereHandover'
import willChangeDuringSchoolHolidaysRoutes from './willChangeDuringSchoolHolidays'
import howChangeDuringSchoolHolidaysRoutes from './howChangeDuringSchoolHolidays'

const handoverAndHolidaysRoutes = (router: Router) => {
  getBetweenHouseholdsRoutes(router)
  whereHandoverRoutes(router)
  willChangeDuringSchoolHolidaysRoutes(router)
  howChangeDuringSchoolHolidaysRoutes(router)
}

export default handoverAndHolidaysRoutes
