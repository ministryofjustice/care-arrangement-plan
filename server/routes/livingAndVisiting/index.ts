import { Router } from 'express'
import mostlyLiveRoutes from './mostlyLive'
import willOvernightsHappenRoutes from './willOvernightsHappen'
import willDaytimeVisitsHappenRoutes from './willDaytimeVisitsHappen'

const livingAndVisitingRoutes = (router: Router) => {
  mostlyLiveRoutes(router)
  willOvernightsHappenRoutes(router)
  willDaytimeVisitsHappenRoutes(router)
}

export default livingAndVisitingRoutes
