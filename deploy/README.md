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
