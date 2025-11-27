# Infrastructure

Our infrastructure is hosted using [MoJ's Cloud Platform](https://user-guide.cloud-platform.service.justice.gov.uk/).
Resources are defined in the [cloud-platform-environments repository](https://github.com/ministryofjustice/cloud-platform-environments),
on a per-environment basis.

- [Dev](https://github.com/ministryofjustice/cloud-platform-environments/tree/main/namespaces/live.cloud-platform.service.justice.gov.uk/care-arrangement-plan-dev)
- [Prod](https://github.com/ministryofjustice/cloud-platform-environments/tree/main/namespaces/live.cloud-platform.service.justice.gov.uk/care-arrangement-plan-prod)

The just defines the infrastructure for the express app. This includes:

- [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) - defining web access to the app
- [Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) - provisioning the required
  amount of pods to manage the load
- [Config](https://kubernetes.io/docs/concepts/configuration/configmap/) - configurable values for the app
- [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) - secret config values for the app

# Alerts
The following sections are short runbooks to explain what each alert means, and actions that could be taken toremedy the issue.


# SlowResponse
This alert fires when, over a 3 minute period, more than 1% of requests were slower than 5 seconds. In other words the p99 latency is > 5s.
This means that some users are experiencing slow loading of the website. 
Action could include:
- Reviewing the ingress dashboard - the link is in the Slack message.
- Checking the pods e.g.
```
NSP=care-arrangement-plan-prod
kubectl -n $NSP get pods -owide
```

# SlownessOutage
This alert fires when, over a 3 minute period, more than 10% of requests were slower than 7.5 seconds.
In other words the p90 latency is > 7.5s.
This means that a significant percentage of users are experiencing slow loading of the website.
Check the actions under the slow response section.
Additional action could include:
- Restart the pods with `kubectl rollout restart deployment/$NSP-deployment -n $NSP`

# High4xxRate
This alert fires when, over a 3 minute period, x% of responses are 4xx responses.
Note: As this alert was frequently being triggered by bots hitting 4xx pages throughout non-working hours, it hasbeen restricted to only firing during weekdays and working hours.
This could indicate an issue with the database, or that a significant percentage of content has been deleted without adding a redirect.
Action could include:
- Reviewing Grafana to understand the extent and timeline of the timeline and identify the specific 4cc codes (e.g. is it mostly 400 or 404?).
- Checking the health of infrastructure.
- Verifying content was not unintentionally deleted.
- Investigating client request patterns to see if a new integration or client application is misbehaving.

# High5xxRate
This alert fires when, over a 3 minute period, 5% of responses are 5xx errors.
This could indicate an issue with the codebase throwing a php error. Or, an issue with failing infrastructure like RDS orElastiCache triggering a php error.
Action could include:
- Reviewing logs for a php error message.
- Reviewing recent deployments, looking for a php bug.
- Checking the health of infrastructure.

# ElastiCacheCPUUtilizationHigh
This alert fires when the ElastiCache CPU utilisation is above 70%.
Actions could include:
- Review and monitor the Grafana dashboard.
- Provision a larger instance.

# ElastiCacheFreeableMemoryLow
This alert fires when the ElastiCache freeable memory is lower than 500MB.
Actions could include:
- Review and monitor the Grafana dashboard.
- Provision a larger instance.