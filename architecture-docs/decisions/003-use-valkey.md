# Use Valkey

Date: 2025-01-27

## Status

⌛️ Superseded

## Context

We need to be able to store a user's session data, and the maximum size of a cookie (~4KB) is too small for this. We
cannot use local storage as this would require Javascript, and also this wouldn't allow us to change the pages loading
depending upon session data.

## Considerations

This would generally be done using a Redis cache, as it is faster than a relational database and natively supports
clearing the session data once it has expired. We propose to use Valkey, an open-source fork of Redis. This has multiple
benefits

- Applies the government standard of using open-source
- Is cheaper - AWS Elasticache offers Valkey for 33% cheaper than Redis, and has 90% lower minimum metered data storage.
  For the low traffic levels we're expecting, this represents a significant saving

Valkey is designed as a drop-in replacement for Redis.

## Decision

We will use Valkey as a session cache.
