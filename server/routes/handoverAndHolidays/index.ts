import { Router } from 'express'
import getBetweenHouseholdsRoutes from './getBetweenHouseholds'
import whereHandoverRoutes from './whereHandover'
import willChangeDuringSchoolHolidaysRoutes from './willChangeDuringSchoolHolidays'
import howChangeDuringSchoolHolidaysRoutes from './howChangeDuringSchoolHolidays'
import itemsForChangeoverRoutes from './itemsForChangeover'

const handoverAndHolidaysRoutes = (router: Router) => {
  getBetweenHouseholdsRoutes(router)
  whereHandoverRoutes(router)
  willChangeDuringSchoolHolidaysRoutes(router)
  howChangeDuringSchoolHolidaysRoutes(router)
  itemsForChangeoverRoutes(router)
}

export default handoverAndHolidaysRoutes
