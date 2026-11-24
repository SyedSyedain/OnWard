# Pulsewave

Pulsewave is the web player of a music streaming service. Listeners browse their playlists, search for
tracks, build a play queue, like songs and control playback from a now-playing bar.

You have joined the Pulsewave frontend team. Your Engineering Manager will give you a ticket
describing what needs to change.

## Project layout

```
index.html                 # page shell that loads src/main.js
src/
├── main.js                # mounts the app in the browser and wires up events
├── app.js                 # renders the whole page from the current state
├── data/seed.js           # sample tracks and playlists
├── lib/
│   ├── html.js            # escapeHtml helper used by every component
│   ├── format.js          # track and playlist duration formatting
│   └── shuffle.js         # Fisher-Yates shuffle with an injectable random source
├── state/
│   ├── store.js           # tiny store: getState, dispatch, subscribe
│   ├── reducer.js         # the actions the player understands
│   └── selectors.js       # derived values: search results, liked songs, playlist length
└── components/            # functions that take props and return HTML strings
    ├── trackRow.js
    ├── playlistView.js
    ├── queuePanel.js
    ├── searchBox.js
    └── nowPlayingBar.js
tests/                     # automated tests
```

## Running the project

```bash
npm test         # runs the test suite
```

To look at the app, serve this folder with any static file server (for example
`python3 -m http.server`) and open `index.html` in the browser.

## Conventions

- Components are plain functions: props in, HTML string out. Always pass user-facing text through `escapeHtml`.
- State is changed only through reducer actions. Reducers return new objects instead of editing the old ones.
- Tracks are referred to by id in playlists, the queue and the player.
