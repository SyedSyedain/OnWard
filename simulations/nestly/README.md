# Nestly

Nestly is the website of a home-rental marketplace. Guests browse listing cards, narrow them down with
search filters (price range, guests, amenities), pick a stay date range to see the night count and total
price, save favourites, and read reviews on the listing page.

You have joined the Nestly frontend team. Your Engineering Manager will give you a ticket
describing what needs to change.

## Project layout

```
index.html                 # page shell that loads src/main.js
src/
├── main.js                # mounts the app in the browser and wires up events
├── data/listings.js       # sample listings and reviews
├── lib/
│   ├── html.js            # escapeHtml and attribute helpers
│   ├── format.js          # price, rating and pluralisation formatting
│   ├── dates.js           # date parsing, night count, date-range labels, stay validation
│   ├── pricing.js         # stay quote: nights, fees and total
│   └── store.js           # tiny observable store
├── state/
│   ├── reducer.js         # pure reducer for filters, stay dates and favourites
│   └── selectors.js       # filtering, sorting, pagination and derived lists
└── components/            # functions that take props and return HTML strings
    ├── listingCard.js
    ├── searchFilters.js
    ├── bookingWidget.js
    ├── reviewList.js
    └── listingDetail.js
tests/                     # automated tests (plain node:test, no browser needed)
```

## Running the project

Open `index.html` through any static file server (for example `npx serve .`), or just run the tests:

```bash
npm test         # runs the test suite
```

## Conventions

- Components are pure functions: props in, HTML string out. No DOM access outside `src/main.js`.
- Any user-provided text must go through `escapeHtml` before it is placed in markup.
- Prices are whole rupees per night.
- Dates travel as `YYYY-MM-DD` strings and are parsed as UTC to avoid time-zone surprises.
- State is never mutated; reducers return new objects.
