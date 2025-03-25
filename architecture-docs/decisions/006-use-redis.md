# Use Redis

Date: 2025-03-25

## Status

✅ Accepted

## Context

While we initially decided to use Valkey as a cache, MoJ's Cloud Platform only supports Redis at this time. In the
interests of maintaining consistency with the rest of the MoJ ecosystem, we should use Redis too.

## Decision

We will use Redis as a session cache.
