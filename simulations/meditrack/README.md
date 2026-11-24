# MediTrack

MediTrack is the patient web app of a neighbourhood clinic. Patients browse the doctors, pick an
appointment slot, book it, and manage their upcoming appointments.

You have joined the MediTrack frontend team. Your Engineering Manager will give you a ticket
describing what needs to change.

## Project layout

```
index.html                  # page shell, loads src/main.js
src/
├── main.js                 # mounts the app in the browser and wires up events
├── data/seed.js            # sample doctors, slots and appointments
├── lib/
│   ├── html.js             # escapeHtml helper used by every component
│   ├── store.js            # tiny store: getState, dispatch, subscribe
│   ├── format.js           # time, date and doctor name formatting
│   ├── validation.js       # booking form validation
│   ├── filtering.js        # doctor search and specialty filter
│   └── pagination.js       # splits a list into pages
├── state/
│   ├── reducer.js          # actions and state transitions
│   └── selectors.js        # derived data (visible doctors, slots by day, upcoming appointments)
└── components/             # functions that take props and return HTML strings
    ├── doctorList.js
    ├── slotPicker.js
    ├── bookingForm.js
    ├── appointmentList.js
    └── cancelDialog.js
tests/                      # automated tests (node:test)
```

## Running the project

```bash
npm test         # runs the test suite
```

To look at the app, serve the folder with any static file server (for example
`npx serve .`) and open `index.html`. There is no build step and no dependencies.

## Conventions

- Components are plain functions: props in, HTML string out. Always pass user text through `escapeHtml`.
- State changes only through the reducer. Reducers never modify the previous state.
- Times are stored as 24-hour `HH:mm` strings and dates as `YYYY-MM-DD`; formatting happens at render time.
- Selectors take the state (which includes `today`) so they stay pure and easy to test.
