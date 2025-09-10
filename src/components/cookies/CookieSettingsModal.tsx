import React, { useEffect, useRef } from 'react';

interface CookieSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const focusableSelector = [
  'a[href]',
  'area[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(',');

const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({ open, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastActiveRef.current = document.activeElement as HTMLElement;
    // focus first focusable within dialog
    const node = dialogRef.current;
    if (node) {
      const focusables = Array.from(node.querySelectorAll<HTMLElement>(focusableSelector));
      (focusables[0] || node).focus();
    }
    const onKey = (e: KeyboardEvent) => {
      if (!dialogRef.current) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector));
        if (focusables.length === 0) return;
        const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);
        let nextIndex = currentIndex;
        if (e.shiftKey) {
          nextIndex = currentIndex <= 0 ? focusables.length - 1 : currentIndex - 1;
        } else {
          nextIndex = currentIndex === focusables.length - 1 ? 0 : currentIndex + 1;
        }
        e.preventDefault();
        focusables[nextIndex].focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      // restore focus
      lastActiveRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-modal-title"
      aria-describedby="cookie-modal-desc"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
      />
      {/* Dialog */}
      <div
        ref={dialogRef}
        style={{
          position: 'relative',
          maxWidth: 560,
          margin: '10vh auto',
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          padding: 24,
          zIndex: 1001,
        }}
      >
        <h2 id="cookie-modal-title" style={{ marginTop: 0 }}>Cookie settings</h2>
        <p id="cookie-modal-desc" className="muted" style={{ marginTop: 4 }}>
          Control how we use cookies and similar technologies on Match Locator.
        </p>

        <div style={{ marginTop: 16 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            padding: '12px 0',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div>
              <div style={{ fontWeight: 600 }}>Necessary</div>
              <div className="muted" style={{ fontSize: 14 }}>Required for core functionality (routing, security). Always on.</div>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked disabled aria-disabled="true" aria-label="Necessary cookies always on" />
              <span className="muted" style={{ fontSize: 12 }}>ON</span>
            </label>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            padding: '12px 0',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div>
              <div style={{ fontWeight: 600 }}>Analytics</div>
              <div className="muted" style={{ fontSize: 14 }}>We use self‑hosted Plausible which is cookie‑less and anonymous.</div>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked readOnly aria-readonly="true" aria-label="Analytics is on and cookie‑less" />
              <span className="muted" style={{ fontSize: 12 }}>ON</span>
            </label>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            padding: '12px 0'
          }}>
            <div>
              <div style={{ fontWeight: 600 }}>Marketing</div>
              <div className="muted" style={{ fontSize: 14 }}>Not in use yet. We will request opt‑in consent if introduced.</div>
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

