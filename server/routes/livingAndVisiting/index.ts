import { Router } from 'express'
import mostlyLiveRoutes from './mostlyLive'
import willOvernightsHappenRoutes from './willOvernightsHappen'
import willDaytimeVisitsHappenRoutes from './willDaytimeVisitsHappen'
import whichScheduleRoutes from './whichSchedule'

const livingAndVisitingRoutes = (router: Router) => {
  mostlyLiveRoutes(router)
  whichScheduleRoutes(router)
  willOvernightsHappenRoutes(router)
  willDaytimeVisitsHappenRoutes(router)
}

export default livingAndVisitingRoutes
