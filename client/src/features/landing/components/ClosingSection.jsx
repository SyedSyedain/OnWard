import { TICKETS } from '../content.js';

/** The close: the three real tickets, fanned. Picking one opens the start form at that difficulty. */
export default function ClosingSection({ onStart }) {
  return (
    <section className="closing">
      <div className="container closing__inner">
        <div className="closing__copy" data-reveal>
          <h2>Your first ticket is waiting.</h2>
          <button type="button" className="key key--primary" onClick={() => onStart()}>
            Start a simulation
          </button>
        </div>

        <ul className="fan" data-reveal aria-label="Tickets you can take">
          {TICKETS.map((ticket, index) => (
            <li key={ticket.id} style={{ '--i': index }}>
              <button type="button" className="fan__card entry" onClick={() => onStart(ticket.difficulty)}>
                <span className="entry__head">
                  <span>Ticket {ticket.id}</span>
                  <span className="chip chip--ink">{ticket.label}</span>
                </span>
                <span className="fan__area">{ticket.area}</span>
                <span className="fan__lines" aria-hidden="true">
                  <span className="mini__bar" style={{ '--w': '78%' }} />
                  <span className="mini__bar" style={{ '--w': '54%' }} />
                  <span className="mini__bar" style={{ '--w': '66%' }} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
