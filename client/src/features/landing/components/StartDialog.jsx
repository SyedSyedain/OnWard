import { PanelsTopLeft, Server, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionsApi } from '../../../api/sessionsApi.js';
import { simulationsApi } from '../../../api/simulationsApi.js';
import { initials, readProfile, saveProfile } from '../../../lib/profile.js';
import { pathForSession } from '../../../lib/sessionRoutes.js';
import { DIFFICULTIES } from '../content.js';

const ROLE_OPTIONS = [
  { id: 'frontend-developer', title: 'Frontend developer', line: 'Components, state, accessibility', Icon: PanelsTopLeft },
  { id: 'backend-developer', title: 'Backend developer', line: 'APIs, business rules, data', Icon: Server },
];

/**
 * The start form, in a native <dialog> so focus and Escape work for free. The first time it also
 * creates the profile (name, email, role, kept in this browser); after that it shows who is signed in.
 */
export default function StartDialog({ open, initialDifficulty = 'easy', initialRole, onClose }) {
  const dialogRef = useRef(null);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(readProfile);
  const [editing, setEditing] = useState(false);
  const [studentName, setStudentName] = useState(profile?.name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [difficulty, setDifficulty] = useState('easy');
  const [roleId, setRoleId] = useState(initialRole ?? profile?.roleId ?? 'frontend-developer');
  const [simulations, setSimulations] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      const saved = readProfile();
      setProfile(saved);
      setEditing(false);
      setStudentName(saved?.name ?? '');
      setEmail(saved?.email ?? '');
      setDifficulty(initialDifficulty);
      setRoleId(initialRole ?? saved?.roleId ?? 'frontend-developer');
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open, initialDifficulty, initialRole]);

  // The codebase names are a nice-to-have; the form works without them.
  useEffect(() => {
    if (!open || simulations.length > 0) return;
    simulationsApi
      .list()
      .then((data) => setSimulations(data.simulations))
      .catch(() => {});
  }, [open, simulations.length]);

  const roleApps = simulations.filter((simulation) => simulation.roleId === roleId);
  const ticketCount = roleApps.reduce((total, simulation) => total + simulation.issueCount, 0);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      saveProfile({ name: studentName, email, roleId });
      const { session } = await sessionsApi.create({ studentName: studentName.trim(), difficulty, roleId });
      navigate(pathForSession(session));
    } catch (createError) {
      setError(createError);
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby="start-title"
      onClose={onClose}
      onClick={(event) => event.target === dialogRef.current && onClose()}
    >
      <form className="dialog__body" onSubmit={handleSubmit}>
        <header className="dialog__head">
          <h2 id="start-title">{profile ? 'Start a ticket' : 'Create your profile'}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" />
          </button>
        </header>

        {profile && !editing ? (
          <div className="profilechip">
            <span className="profilechip__avatar" aria-hidden="true">
              {initials(profile.name)}
            </span>
            <span className="profilechip__text">
              <span className="profilechip__name">{profile.name}</span>
              <span className="profilechip__email">{profile.email}</span>
            </span>
            <button type="button" className="profilechip__edit" onClick={() => setEditing(true)}>
              Edit
            </button>
          </div>
        ) : (
          <>
            <label className="field">
              <span className="field__label">Your name, as it should appear on the record</span>
              <input
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={60}
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
              />
            </label>
            <label className="field">
              <span className="field__label">Email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                maxLength={120}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
          </>
        )}

        <fieldset className="choice">
          <legend className="field__label">Role</legend>
          <div className="rolepick">
            {ROLE_OPTIONS.map(({ id, title, line, Icon }) => (
              <label key={id} className="rolepick__option">
                <input
                  type="radio"
                  name="role"
                  value={id}
                  checked={roleId === id}
                  onChange={() => setRoleId(id)}
                />
                <span className="rolepick__card">
                  <Icon aria-hidden="true" />
                  <span className="rolepick__title">{title}</span>
                  <span className="rolepick__line">{line}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="choice">
          <legend className="field__label">Difficulty</legend>
          <div className="segmented">
            {DIFFICULTIES.map((option) => (
              <label key={option.id} className="segmented__option">
                <input
                  type="radio"
                  name="difficulty"
                  value={option.id}
                  checked={difficulty === option.id}
                  onChange={() => setDifficulty(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {!profile && <p className="dialog__role">Saved in this browser only. No password needed.</p>}

        {roleApps.length > 0 && (
          <p className="dialog__role">
            {ticketCount} tickets across {roleApps.map((simulation) => simulation.name).join(', ')}. You get one
            at random.
          </p>
        )}

        {error && (
          <p className="dialog__error" role="alert">
            {error.message}
          </p>
        )}

        <button type="submit" className="key key--primary key--wide" disabled={submitting}>
          {submitting ? 'Writing your ticket…' : profile ? 'Get my ticket' : 'Create profile and get a ticket'}
        </button>
      </form>
    </dialog>
  );
}
