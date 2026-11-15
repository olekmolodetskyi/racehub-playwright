# racehub-playwright

Test framework with tests to test racehub website.

## application under testing (AUT)

RaceHub - demo app to register on running events for runners and to register running events for organizers

## AUT url

https://race-staging.omolodetskyi.org

## Tech stack

Playwright on TypeScript

## Prerequisites

Node version >=24.0

## how to install

```bash
npm ci
npx playwright install
```

## setup

Copy `.env.example` to `.env` and replace URL placeholder with your racehub url

## how to start

```bash
npm test
npm test:ui
```

## how to see results

```bash
npm run report
```

## status

Work in progress
