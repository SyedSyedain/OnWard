# Ledgerly

Ledgerly is the backend of a group expense-splitting app. Friends create a group, add expenses that are
split equally or by shares, see who owes whom, and "settle up" when someone pays their share back.

You have joined the Ledgerly backend team. Your Engineering Manager will give you a ticket
describing what needs to change.

## Project layout

```
src/
├── index.js                    # exports createLedgerly(), which wires everything together
├── lib/
│   ├── errors.js               # error types shared by every service
│   ├── money.js                # splitting an amount in paise between members
│   └── validation.js           # small input checks
├── repositories/
│   └── createStore.js          # in-memory storage for groups, expenses, settlements and activity
└── services/                   # business rules (this is where most work happens)
    ├── groupService.js         # groups and members
    ├── expenseService.js       # adding, listing and deleting expenses
    ├── balanceService.js       # member balances and suggested settlements
    ├── settlementService.js    # "settle up" payments between members
    └── activityService.js      # the group activity feed
tests/                          # automated tests for the services
```

## Running the project

Ledgerly has no dependencies, so there is nothing to install.

```bash
npm test         # runs the test suite
```

## Using the services

```js
import { createLedgerly } from './src/index.js';

const app = createLedgerly();
const group = app.groupService.createGroup({ name: 'Goa Trip', members: ['Asha', 'Bala'] });
```

## Conventions

- Services contain the business rules. Invalid input throws a `ValidationError`, missing records throw a
  `NotFoundError`, and requests that clash with the current state throw a `ConflictError`.
- All money is stored in paise (integer), never as floating-point rupees.
- A member's balance is positive when the group owes them money and negative when they owe the group.
