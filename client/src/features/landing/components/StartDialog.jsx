import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionsApi } from '../../../api/sessionsApi.js';
import { pathForSession } from '../../../lib/sessionRoutes.js';
import { DIFFICULTIES } from '../content.js';

/** The start form, in a native <dialog> so focus and Escape work for free. */
export default function StartDialog({ open, initialDifficulty = 'easy', onClose }) {
  const dialogRef = useRef(null);
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      setDifficulty(initialDifficulty);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open, initialDifficulty]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { session } = await sessionsApi.create({ studentName, difficulty });
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
          <h2 id="start-title">Start a simulation</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" />
          </button>
        </header>

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

        <p className="dialog__role">Role: Backend developer, ShopSphere.</p>

        {error && (
          <p className="dialog__error" role="alert">
            {error.message}
          </p>
        )}

        <button type="submit" className="key key--primary key--wide" disabled={submitting}>
          {submitting ? 'Writing your ticket…' : 'Get my ticket'}
        </button>
      </form>
    </dialog>
  );
}
