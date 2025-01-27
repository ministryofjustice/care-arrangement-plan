# Choose app language

Date: 2025-01-27

## Status

✅ Accepted

## Context

We need a language to write the app in. It should be well known, and have support for the GOV.UK design system. It should
match the existing patterns at the MoJ. We also need the capability to create the care arrangement plan file.

## Considerations

The backend of the app is very simple, it just needs to serve the web pages, and create the final care arrangement plan.
Therefor we don't need a separate backend service.

#### Python

We could create a python app using a web framework such as Django. There are examples of this on the MoJ GitHub. It doesn't
have native support for the design system, this needs to be separately configured. There are packages that can be used
to create PDF or ODT files.

#### Javascript/Typescript

We could create a node app. This would natively support the design system, and there are template repositories for this
pattern using Express.js on the MoJ GitHub, which fulfil almost our exact use case. This is a very common pattern, so it
will be easy for the app to be supported long term. There are packages that can be used to create PDF or ODT files.

We would use Typescript over Javascript as the benefits of having types outweighs the small inconvenience of having to
transpile the code.

## Decision

We will create a Node.js application running an express server. We will use Typescript. This application will handle all
of the service.
