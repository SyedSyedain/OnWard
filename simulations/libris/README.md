# Libris

Libris is the backend of a college library system. It manages the book catalogue and its physical
copies, members and their borrowing limits, checkouts, returns with late fines, renewals and a
queue of holds (reservations) for books that are out on loan.

You have joined the Libris backend team. Your Engineering Manager will give you a ticket
describing what needs to change.

## Project layout

```
src/
├── index.js                    # createLibrary(): wires the repositories and services together
├── data/seed.js                # sample books, copies and members
├── lib/
│   ├── errors.js               # error types shared by every service
│   ├── dates.js                # helpers for calendar dates written as YYYY-MM-DD
│   └── policy.js               # loan length, renewal rules, fine rate
├── repositories/createStore.js # in-memory storage for books, copies, members, loans and holds
└── services/                   # business rules (this is where most work happens)
    ├── catalogueService.js     # books, copies and availability
    ├── memberService.js        # registering and looking up members
    ├── fineService.js          # late-fine calculation
    ├── holdService.js          # the holds queue
    └── loanService.js          # checkout, return and renewal
tests/                          # automated tests for the services
```

## Running the project

```bash
npm test         # runs the test suite (Node 24 or newer, no dependencies to install)
```

## Conventions

- Services contain the business rules. Invalid input throws a `ValidationError`, missing records
  throw a `NotFoundError`, and requests that conflict with the current state throw a `ConflictError`.
- Every service call that depends on "today" receives the date as an argument (`'YYYY-MM-DD'`).
  Services never read the system clock.
- Money is stored in paise (integer), never as floating-point rupees.
