import { Router } from 'express'
import mostlyLiveRoutes from './mostlyLive'
import willOvernightsHappenRoutes from './willOvernightsHappen'
import willDaytimeVisitsHappenRoutes from './willDaytimeVisitsHappen'
import whichScheduleRoutes from './whichSchedule'
import whichDaysOvernightRoutes from './whichDaysOvernight'
import whichDaysDaytimeVisitsRoutes from './whichDaysDaytimeVisits'

const livingAndVisitingRoutes = (router: Router) => {
  mostlyLiveRoutes(router)
  whichScheduleRoutes(router)
  willOvernightsHappenRoutes(router)
  whichDaysOvernightRoutes(router)
  willDaytimeVisitsHappenRoutes(router)
  whichDaysDaytimeVisitsRoutes(router)
}

export default livingAndVisitingRoutes
