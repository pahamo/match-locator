import React, { useEffect, useRef } from 'react';

interface CookieSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const focusable = [
  'a[href]',
  'area[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({ open, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastActiveRef.current = document.activeElement as HTMLElement;
    const node = dialogRef.current;
    if (node) {
      const f = node.querySelector<HTMLElement>(focusable);
      (f || node).focus();
    }
    const onKey = (e: KeyboardEvent) => {
      if (!dialogRef.current) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusable));
        if (!items.length) return;
        const idx = items.indexOf(document.activeElement as HTMLElement);
        let next = idx;
        if (e.shiftKey) next = idx <= 0 ? items.length - 1 : idx - 1;
        else next = idx === items.length - 1 ? 0 : idx + 1;
        e.preventDefault();
        items[next].focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      lastActiveRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="cookie-title" aria-describedby="cookie-desc" style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
      <div onClick={onClose} aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      <div ref={dialogRef} tabIndex={-1} style={{ position: 'relative', maxWidth: 560, margin: '10vh auto', background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', padding: 24 }}>
        <h2 id="cookie-title" style={{ marginTop: 0 }}>Cookie settings</h2>
        <p id="cookie-desc" className="muted" style={{ marginTop: 4 }}>Control how we use cookies and similar technologies.</p>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Necessary</div>
              <div className="muted" style={{ fontSize: 14 }}>Required for core functionality (routing, security). Always on.</div>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked disabled aria-disabled="true" aria-label="Necessary cookies always on" />
              <span className="muted" style={{ fontSize: 12 }}>ON</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Analytics</div>
              <div className="muted" style={{ fontSize: 14 }}>We use self‑hosted Plausible (cookie‑less, anonymous).</div>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked readOnly aria-readonly="true" aria-label="Analytics is on and cookie‑less" />
              <span className="muted" style={{ fontSize: 12 }}>ON</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', padding: '12px 0' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Marketing</div>
              <div className="muted" style={{ fontSize: 14 }}>Not in use yet. We will request opt‑in if introduced.</div>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" disabled aria-disabled="true" aria-label="Marketing cookies not in use" />
              <span className="muted" style={{ fontSize: 12 }}>OFF</span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          <button onClick={onClose} className="save-btn" style={{ background: '#111827' }}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default CookieSettingsModal;

