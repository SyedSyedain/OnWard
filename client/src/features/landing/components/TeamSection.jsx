import { Check, EyeOff, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HINT_LIMIT, SECTION_NOTES, TEAM } from '../content.js';
import { prefersReducedMotion } from '../hooks/useInView.js';
import SectionHead from './SectionHead.jsx';

const TYPING_MS = 900;

/**
 * The AI team as something to try: pick a colleague on the left (in the order
 * you meet them), then tap a question in their chat to see how they answer.
 */
export default function TeamSection() {
  const [activeId, setActiveId] = useState(TEAM[0].id);
  const tabRefs = useRef({});
  const active = TEAM.find((member) => member.id === activeId);
  const chat = useChat(active);

  function handleKeyDown(event, index) {
    const offset = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (!offset) return;
    event.preventDefault();
    const next = TEAM[(index + offset + TEAM.length) % TEAM.length];
    setActiveId(next.id);
    tabRefs.current[next.id]?.focus();
  }

  return (
    <section id="team" className="section">
      <div className="container">
        <SectionHead
          title={
            <>
              A manager, a teammate,
              <br />a reviewer.
            </>
          }
          note={SECTION_NOTES.team}
        />

        <div className="crew" data-reveal>
          <div className="crew__side">
            <div role="tablist" aria-label="Your AI colleagues" aria-orientation="vertical" className="crew__list">
              {TEAM.map((member, index) => (
                <button
                  key={member.id}
                  ref={(element) => (tabRefs.current[member.id] = element)}
                  type="button"
                  role="tab"
                  id={`crew-${member.id}`}
                  aria-selected={member.id === activeId}
                  aria-controls="crew-chat"
                  tabIndex={member.id === activeId ? 0 : -1}
                  className="crew__item"
                  onClick={() => setActiveId(member.id)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                >
                  <span className="avatar avatar--lg" aria-hidden="true">
                    {member.name[0]}
                  </span>
                  <span className="crew__text">
                    <span className="crew__when">{member.when}</span>
                    <span className="crew__name">{member.name}</span>
                  </span>
                </button>
              ))}
            </div>

            <div key={active.id} className="crew__card">
              <p className="crew__card-title">What the {active.name.toLowerCase()} does</p>
              <ul className="crew__does">
                {active.does.map((item, index) => (
                  <li key={item} style={{ '--k': index }}>
                    <Check aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="crew__blind">
                <EyeOff aria-hidden="true" />
                Can’t see {active.cantSee}.
              </p>
            </div>
          </div>

          <div id="crew-chat" role="tabpanel" aria-labelledby={`crew-${active.id}`} className="chatwin">
            <header className="chatwin__head">
              <span className="avatar" aria-hidden="true">
                {active.name[0]}
              </span>
              <span className="chatwin__who">
                <span className="chatwin__name">{active.name}</span>
                <span className="chatwin__role">{active.role}</span>
              </span>
              {active.id === 'teammate' && <HintMeter used={chat.hints} />}
            </header>

            <ol className="chatwin__body" ref={chat.bodyRef} aria-live="polite" data-lenis-prevent>
              {chat.messages.map((message, index) => (
                <li key={`${active.id}-${index}`} className="bubble" data-from={message.from}>
                  {message.text}
                </li>
              ))}
              {chat.typing && (
                <li className="bubble bubble--typing" aria-label={`${active.name} is typing`}>
                  <span />
                  <span />
                  <span />
                </li>
              )}
            </ol>

            <footer className="chatwin__foot">
              {chat.remaining.length > 0 ? (
                <>
                  <p className="chatwin__try">Tap a question.</p>
                  <div
                    className="chatwin__prompts"
                    role="group"
                    aria-label={`Questions to ask the ${active.name.toLowerCase()}`}
                  >
                    {chat.remaining.map((prompt) => (
                      <button
                        key={prompt.q}
                        type="button"
                        className="prompt"
                        disabled={chat.typing}
                        onClick={() => chat.ask(prompt)}
                      >
                        {prompt.q}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <button type="button" className="text-button" onClick={chat.reset}>
                  <RotateCcw aria-hidden="true" />
                  Start over
                </button>
              )}
            </footer>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * One colleague's conversation. It opens with their intro line; each question
 * you tap is added, followed by a short typing pause and their answer.
 * Switching colleagues starts a fresh conversation.
 */
function useChat(member) {
  const [messages, setMessages] = useState([{ from: 'them', text: member.intro }]);
  const [asked, setAsked] = useState([]);
  const [typing, setTyping] = useState(false);
  const timers = useRef([]);
  const bodyRef = useRef(null);
  const firstRender = useRef(true);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const reply = useCallback((text) => {
    if (prefersReducedMotion()) {
      setMessages((current) => [...current, { from: 'them', text }]);
      return;
    }
    setTyping(true);
    timers.current.push(
      setTimeout(() => {
        setTyping(false);
        setMessages((current) => [...current, { from: 'them', text }]);
      }, TYPING_MS),
    );
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setAsked([]);
    setMessages([]);
    reply(member.intro);
  }, [member, reply]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return undefined;
    }
    reset();
    return clearTimers;
  }, [member, reset]);

  useEffect(() => clearTimers, []);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [messages, typing]);

  function ask(prompt) {
    setAsked((current) => [...current, prompt.q]);
    setMessages((current) => [...current, { from: 'you', text: prompt.q }]);
    reply(prompt.a);
  }

  const hints = member.prompts.filter((prompt) => prompt.hint && asked.includes(prompt.q)).length;
  const remaining = member.prompts.filter((prompt) => !asked.includes(prompt.q));

  return { messages, typing, hints, remaining, ask, reset, bodyRef };
}

function HintMeter({ used }) {
  return (
    <p className="hints chatwin__hints">
      Hints
      <span className="hints__bar" aria-hidden="true">
        {Array.from({ length: HINT_LIMIT }, (_, index) => (
          <span key={index} data-used={index < used} />
        ))}
      </span>
      <span className="num">
        {used} / {HINT_LIMIT}
      </span>
    </p>
  );
}
