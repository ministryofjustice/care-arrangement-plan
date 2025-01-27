# Persisting permanent data

Date: 2025-01-27

## Status

🤔 Proposed

## Context

In the future, we may want to persist data permanently, to allow people to come back to revisit or edit their care
arrangement plans. This would be an optional step.

## Considerations

Long term data storage would change our privacy requirement, we would have to ensure we remain under UK GDPR, and have
processes to delete user data etc.

The proposed architecture would add a relational database which persists the data. We would then allow the user to
"sign-in" somehow, and access their data

- We could use the GOV.UK One Login service for a full sign-in experience. In this case we would have an internal GUID
  for the user, and a table mapping our internal ID to the One Login `sub` field. This wouldn't allow users to have
  multiple care arrangement plans, so we'd have to consider how to handle that use case if required
- We could allow a user to "sign-in" using an email and reference number combination. This is effectively close enough
  to a username and password that we would still need all the bells and whistles for that, so it's not a great option
- We could collect an email, and then have the user enter their email and get sent a code/magic link to log in. We could
  include a reference number to allow them to have multiple plans simultaneously. This might cause friction in the user
  journey, as it would involve changing flows to go into the emails.

We should avoid creating a full custom account. One Login is the advised way to do this now.

## Decision

Nothing has been decided yet, these are the proposals. My preferred solution would be using One Login.
