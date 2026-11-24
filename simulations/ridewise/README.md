# Ridewise

Ridewise is the backend of a city ride-hailing service. It estimates fares, books rides, matches
the nearest available driver, moves rides through their lifecycle and applies promo codes.

You have joined the Ridewise backend team. Your Engineering Manager will give you a ticket
describing what needs to change.

## Project layout

```
src/
├── index.js                # public entry point, builds every service
├── config.js               # pricing and cancellation constants
├── data/seed.js            # sample drivers and promo codes
├── lib/
│   ├── errors.js           # error types shared by every service
│   └── geo.js              # distance between two coordinates
├── repositories/
│   └── createStore.js      # in-memory storage for drivers, rides and promo redemptions
└── services/               # business rules (this is where most work happens)
    ├── fareService.js      # fare estimates and cancellation fees
    ├── promoService.js     # promo code validation and redemption
    ├── driverService.js    # driver availability and nearest-driver matching
    └── rideService.js      # booking and ride status transitions
tests/                      # automated tests for the services
```

## Running the project

```bash
npm test         # runs the test suite
```

## Ride lifecycle

`requested` -> `accepted` -> `started` -> `completed`. A ride can also end as `cancelled`.

## Conventions

- Services contain the business rules.
- Invalid input throws a `ValidationError`. Missing records throw a `NotFoundError`.
  Actions that are not allowed in the current state throw a `ConflictError`.
- Money is stored in paise (integer), never as floating-point rupees.
- Timestamps are passed in explicitly as milliseconds since the epoch (`at`).
