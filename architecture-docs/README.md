# Architecture

The app is a simple express app, using the nunjucks templating engine. It is hosted in AWS, with the infrastructure
defined using Kubernetes deployment files.

For MVS, as we only need to store transient session data, there is a simple architecture of the containerised web
application connecting to a Elasticache cluster.

![MVS Technical Architecture Diagram](./assets/technical-architecture.svg)

Post-MVS, we may wish to email a completed care arrangement plan to one/both parents. We also may want to store the
data more permanently, allowing users to come back and edit it. A suggested architecture is below.

![POST-MVS Technical Architecture Diagram](./assets/post-mvs-technical-architecture.svg)

> [!NOTE]
> These diagrams simplify the kubernetes cluster, reducing the application to a single block

## Architecture Decision Records

1. ✅ [Choose app language](decisions/001-choose-app-language)
1. ✅ [Choose hosting environment](decisions/002-choose-hosting-environment)
1. ⌛ [Use Valkey](decisions/003-use-valkey.md)
1. 🤔 [Sending emails](decisions/004-sending-emails.md)
1. 🤔 [Persisting permanent data](decisions/005-persisting-permanent-data.md)
1. ✅ [USe Redis](decisions/006-use-redis.md)

### Statuses

- ✅ Accepted
- ❌ Rejected
- 🤔 Proposed
- ⌛️ Superseded
- ♻️ Amended
