/** A section's heading row: the title on the left, one light line on what the part is for. */
export default function SectionHead({ title, note }) {
  return (
    <header className="shead" data-reveal>
      <h2>{title}</h2>
      <p className="shead__note">{note}</p>
    </header>
  );
}
