/**
 * A side column. On wide screens it is docked and collapses to nothing;
 * on narrow screens it slides over the editor with a backdrop.
 */
export default function SidePanel({ side, open, docked, width, label, onClose, children }) {
  const border = side === 'left' ? 'border-r' : 'border-l';

  if (docked) {
    return (
      <div
        className={`h-full shrink-0 overflow-hidden border-line transition-[width] duration-200 ease-out ${open ? border : ''}`}
        style={{ width: open ? width : 0 }}
        inert={!open}
      >
        <div className="h-full" style={{ width }}>
          {children}
        </div>
      </div>
    );
  }

  const hidden = side === 'left' ? '-translate-x-full' : 'translate-x-full';
  return (
    <>
      <div
        className={`absolute inset-0 z-30 bg-ink/30 transition-opacity duration-200 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label={label}
        aria-modal={open || undefined}
        inert={!open}
        className={`absolute inset-y-0 z-40 ${side === 'left' ? 'left-0' : 'right-0'} ${border} border-line bg-paper shadow-[0_0_40px_-12px_oklch(18%_0.006_60/0.4)] transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : hidden
        }`}
        style={{ width: `min(${width}px, 88vw)` }}
      >
        {children}
      </div>
    </>
  );
}
