import React, { useEffect, useRef, useState } from 'react';
import Header from '../../components/Header';
import { updateDocumentMeta } from '../../utils/seo';
import { sendPrivacyRequest, type PrivacyRequestType } from '../../api/privacy-request';

const TYPES: PrivacyRequestType[] = ['Access', 'Erasure', 'Rectification', 'Objection'];

const PrivacyRequestPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [type, setType] = useState<PrivacyRequestType>('Access');
  const [message, setMessage] = useState('');
  const [isDataSubject, setIsDataSubject] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    updateDocumentMeta({
      title: 'Privacy Request | Match Locator',
      description: 'Submit a GDPR/UK‑GDPR privacy request to Match Locator. We aim to respond within 30 days.',
      canonical: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }, []);

  const validate = (): string | null => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (!isDataSubject) return 'Please confirm you are the data subject.';
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) { setError(v); return; }

    const payload = { email, type, message, isDataSubject, timestamp: new Date().toISOString() };
    await sendPrivacyRequest(payload);

    // Open prefilled mailto as a simple MVP channel
    const subject = encodeURIComponent(`Privacy request: ${type}`);
    const body = encodeURIComponent(
      `Email: ${email}\nType: ${type}\nData subject: ${isDataSubject ? 'Yes' : 'No'}\n\nMessage:\n${message || '(none)'}\n\nRef: ${payload.timestamp}`
    );
    window.location.href = `mailto:privacy@matchlocator.com?subject=${subject}&body=${body}`;

    setSubmitted(true);
    formRef.current?.reset();
  };

  return (
    <div className="privacy-request-page">
      <Header title="Privacy request" subtitle="GDPR/UK‑GDPR rights request" />
      <main>
        <div className="wrap">
          {submitted ? (
            <div className="message success" role="status">
              Thank you. We’ve prepared an email to privacy@matchlocator.com. If your email client didn’t open, please
              email us directly. We aim to respond within 30 days.
            </div>
          ) : null}

          {error && (
            <div className="message error" role="alert">{error}</div>
          )}

          <form ref={formRef} onSubmit={onSubmit} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="email" style={{ display: 'block', fontWeight: 600 }}>Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label htmlFor="type" style={{ display: 'block', fontWeight: 600 }}>Request type</label>
              <select
                id="type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value as PrivacyRequestType)}
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }}
              >
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label htmlFor="message" style={{ display: 'block', fontWeight: 600 }}>Message (optional)</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={isDataSubject}
                  onChange={(e) => setIsDataSubject(e.target.checked)}
                  aria-describedby="datasubject-help"
                />
                I am the data subject
              </label>
              <div id="datasubject-help" className="muted" style={{ fontSize: 12 }}>
                If you are acting on behalf of someone else, please contact us first.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="save-btn">Send request</button>
              <a href="mailto:privacy@matchlocator.com" className="save-btn" style={{ background: '#111827' }}>Email us</a>
            </div>

            <p className="muted" style={{ marginTop: 12, fontSize: 12 }}>
              We aim to respond within 30 days of receipt of your request.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PrivacyRequestPage;

