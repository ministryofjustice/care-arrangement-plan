# Sending emails

Date: 2025-01-27

## Status

🤔 Proposed

## Context

In the future, we may want to email the care arrangement plan to one or both parents.

## Considerations

We should use GOV.UK Notify, as it is free and has a Node.js client. It adds a layer of official-ness to the email, and
gives a useful dashboard to track email stats. It would also allow us to easily branch out to sending texts or letters
if that was ever desired. It has support for sending documents.

- We would need to consider how we get consent for emailing someone. Would we need them to verify their email prior to
  sending the plan to them?
- How would we get consent to email the person not filling in the form?
- If we allow sending the plan to the parent _not_ filling in the form, we need to be aware that this is an avenue for
  fraud - unless we verify the person filling in the form is who they say they are, any third party could send a parent
  plan claiming to be one of the parents.

## Decision

We would use GOV.UK Notify to send emails, however there are non-technical considerations raised which will need to be
resolved prior to commiting.
