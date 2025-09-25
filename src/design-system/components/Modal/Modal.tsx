import React from 'react';
import { getCSSVariable } from '../../styles';

export interface ModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether clicking the backdrop closes the modal */
  closeOnBackdropClick?: boolean;
  /** Whether pressing escape closes the modal */
  closeOnEscape?: boolean;
  /** Custom backdrop color */
  backdropColor?: string;
  /** Children content */
  children: React.ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
  /** Custom header content */
  header?: React.ReactNode;
  /** Custom footer content */
  footer?: React.ReactNode;
  /** Hide the default close button */
  hideCloseButton?: boolean;
  /** Z-index override */
  zIndex?: number;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  backdropColor,
  children,
  className = '',
  style = {},
  header,
  footer,
  hideCloseButton = false,
  zIndex = 50
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);

  // Handle escape key
  React.useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onClose]);

  // Focus management
  React.useEffect(() => {
    if (!open) return;

    const modal = modalRef.current;
    if (!modal) return;

    // Focus the modal when it opens
    modal.focus();

    // Trap focus within modal
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    return () => modal.removeEventListener('keydown', handleTab);
  }, [open]);

  // Body scroll lock
  React.useEffect(() => {
    if (open) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [open]);

  const getSizeStyles = (): React.CSSProperties => {
    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: {
        maxWidth: '400px',
        width: '90vw'
      },
      md: {
        maxWidth: '500px',
        width: '90vw'
      },
      lg: {
        maxWidth: '700px',
        width: '90vw'
      },
      xl: {
        maxWidth: '900px',
        width: '95vw'
      },
      full: {
        width: '95vw',
        height: '95vh',
        maxWidth: 'none',
        maxHeight: 'none'
      }
    };

    return sizeStyles[size];
  };

  const backdropStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: backdropColor || 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: getCSSVariable('--spacing-lg'),
    zIndex: zIndex,
    opacity: open ? 1 : 0,
    visibility: open ? 'visible' : 'hidden',
    transition: getCSSVariable('--transition-base')
  };

  const modalStyles: React.CSSProperties = {
    backgroundColor: getCSSVariable('--color-card'),
    borderRadius: getCSSVariable('--border-radius-lg'),
    boxShadow: getCSSVariable('--shadow-xl'),
    position: 'relative',
    maxHeight: size === 'full' ? '95vh' : '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    outline: 'none',
    transform: open ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-10px)',
    transition: getCSSVariable('--transition-base'),
    ...getSizeStyles(),
    ...style
  };

  const headerStyles: React.CSSProperties = {
    padding: getCSSVariable('--spacing-xl'),
    paddingBottom: header ? getCSSVariable('--spacing-xl') : getCSSVariable('--spacing-lg'),
    borderBottom: `1px solid ${getCSSVariable('--color-border')}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0
  };

  const contentStyles: React.CSSProperties = {
    padding: getCSSVariable('--spacing-xl'),
    overflow: 'auto',
    flex: 1
  };

  const footerStyles: React.CSSProperties = {
    padding: getCSSVariable('--spacing-xl'),
    paddingTop: getCSSVariable('--spacing-lg'),
    borderTop: `1px solid ${getCSSVariable('--color-border')}`,
    flexShrink: 0
  };

  const closeButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: getCSSVariable('--font-size-lg'),
    cursor: 'pointer',
    color: getCSSVariable('--color-muted'),
    padding: getCSSVariable('--spacing-sm'),
    borderRadius: getCSSVariable('--border-radius-md'),
    transition: getCSSVariable('--transition-base'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: getCSSVariable('--font-size-lg'),
    fontWeight: getCSSVariable('--font-weight-semibold'),
    color: getCSSVariable('--color-heading'),
    margin: 0
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === backdropRef.current) {
      onClose();
    }
  };

  const CloseIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      style={backdropStyles}
      onClick={handleBackdropClick}
      className="design-system-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={modalRef}
        style={modalStyles}
        className={`design-system-modal ${className}`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || header || !hideCloseButton) && (
          <div style={headerStyles} className="design-system-modal-header">
            <div style={{ flex: 1 }}>
              {header || (title && (
                <h2 id="modal-title" style={titleStyles}>
                  {title}
                </h2>
              ))}
            </div>
            {!hideCloseButton && (
              <button
                style={closeButtonStyles}
                onClick={onClose}
                aria-label="Close modal"
                className="design-system-modal-close"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = getCSSVariable('--color-gray-100');
                  e.currentTarget.style.color = getCSSVariable('--color-text');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = getCSSVariable('--color-muted');
                }}
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div style={contentStyles} className="design-system-modal-content">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={footerStyles} className="design-system-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;