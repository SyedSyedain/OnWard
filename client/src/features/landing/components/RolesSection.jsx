import { Check, ChartColumn, PanelsTopLeft, Rocket, Server } from 'lucide-react';
import { ROLES, SECTION_NOTES } from '../content.js';
import SectionHead from './SectionHead.jsx';

const ROLE_ICONS = {
  'backend-developer': Server,
  'frontend-developer': PanelsTopLeft,
  'data-analyst': ChartColumn,
  'devops-engineer': Rocket,
};

const BAR_HEIGHTS = [38, 62, 48, 80, 56, 92];
const PIPELINE = [
  { id: 'build', label: 'Build', done: true },
  { id: 'test', label: 'Test', done: true },
  { id: 'ship', label: 'Deploy', done: false },
];

/** The roles you can practise, each with a small picture of the work it involves. */
export default function RolesSection({ onStart }) {
  return (
    <section id="roles" className="section">
      <div className="container">
        <SectionHead title="Pick a role to practise." note={SECTION_NOTES.roles} />

        <ul className="rgrid" data-reveal>
          {ROLES.map((role, index) => (
            <li key={role.id} style={{ '--i': index }}>
              {role.open ? (
                <button type="button" className="rcard" onClick={() => onStart()}>
                  <RoleCard role={role} />
                </button>
              ) : (
                <div className="rcard" aria-disabled="true">
                  <RoleCard role={role} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function RoleCard({ role }) {
  const Icon = ROLE_ICONS[role.id];
  return (
    <>
      <span className="rcard__scene" aria-hidden="true">
        <RoleScene id={role.id} />
      </span>
      <span className="rcard__body">
        <span className="rcard__head">
          <Icon aria-hidden="true" />
          <span className="rcard__title">{role.title}</span>
        </span>
        <span className="rcard__line">{role.line}</span>
        <span className={`chip ${role.open ? 'chip--green' : ''}`}>{role.open ? 'Open' : 'Soon'}</span>
      </span>
    </>
  );
}

function RoleScene({ id }) {
  switch (id) {
    case 'backend-developer':
      return (
        <span className="scene scene--api num">
          <span className="api__row">
            <span className="api__method">POST</span>
            /cart/items
          </span>
          <span className="api__json">{'{ "quantity": 2 }'}</span>
          <span className="api__row api__row--reply">
            <span className="chip chip--green">201</span>
            Created
          </span>
        </span>
      );
    case 'frontend-developer':
      return (
        <span className="scene scene--ui">
          <span className="ui__image" />
          <span className="ui__text">
            <span className="mini__code" style={{ '--w': '80%' }} />
            <span className="mini__code" style={{ '--w': '46%' }} />
          </span>
          <span className="ui__button">Add to cart</span>
        </span>
      );
    case 'data-analyst':
      return (
        <span className="scene scene--bars">
          {BAR_HEIGHTS.map((height, index) => (
            <span key={index} style={{ '--h': `${height}%`, '--j': index }} data-peak={index === 5 || undefined} />
          ))}
        </span>
      );
    default:
      return (
        <span className="scene scene--pipe">
          {PIPELINE.map((stage) => (
            <span key={stage.id} className="pipe__stage" data-done={stage.done || undefined}>
              <span className="pipe__dot">{stage.done && <Check />}</span>
              {stage.label}
            </span>
          ))}
        </span>
      );
  }
}
