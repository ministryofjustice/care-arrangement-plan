import { Router } from 'express'
import mostlyLiveRoutes from './mostlyLive'
import willOvernightsHappenRoutes from './willOvernightsHappen'
import willDaytimeVisitsHappenRoutes from './willDaytimeVisitsHappen'
import whichScheduleRoutes from './whichSchedule'
import whichDaysOvernightRoutes from './whichDaysOvernight'

const livingAndVisitingRoutes = (router: Router) => {
  mostlyLiveRoutes(router)
  whichScheduleRoutes(router)
  willOvernightsHappenRoutes(router)
  whichDaysOvernightRoutes(router)
  willDaytimeVisitsHappenRoutes(router)
}

export default livingAndVisitingRoutes
