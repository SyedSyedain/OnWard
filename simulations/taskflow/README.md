# TaskFlow

TaskFlow is the web app of a team kanban board. Teams keep their work in columns, add cards with an
assignee and a due date, drag cards between columns, and filter the board by person.

You have joined the TaskFlow frontend team. Your Engineering Manager will give you a ticket
describing what needs to change.

## Project layout

```
index.html                 # page shell that loads src/main.js
src/
├── main.js                # mounts the app into the page and wires up events
├── lib/
│   ├── html.js            # escapeHtml helper used by every component
│   ├── dates.js           # date parsing, due-date status and formatting
│   ├── validation.js      # new-card form validation
│   └── shortcuts.js       # maps keyboard events to board actions
├── store/
│   ├── createStore.js     # tiny observable store (getState, dispatch, subscribe)
│   ├── reducer.js         # pure reducer for cards, columns, filter and undo
│   └── selectors.js       # derived data: visible cards, column counts, assignees
└── components/            # functions that take props and return HTML strings
    ├── card.js
    ├── column.js
    ├── newCardForm.js
    └── board.js
tests/                     # automated tests (helpers.js builds fresh state)
```

## Running the project

Open `index.html` in a browser (serve the folder with any static file server so ES modules load), or
run the tests:

```bash
npm test         # runs the test suite
```

## Conventions

- Components are plain functions that return HTML strings. They never touch the DOM.
- User-provided text must go through `escapeHtml` before it is placed in markup.
- State changes only through the reducer. Reducers are pure and must not modify the state they receive.
- Due dates are stored as `YYYY-MM-DD` strings. Functions that depend on the current time take `now` as an argument.
