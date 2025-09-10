export type PrivacyRequestType = 'Access' | 'Erasure' | 'Rectification' | 'Objection';

export interface PrivacyRequestPayload {
  email: string;
  type: PrivacyRequestType;
  message?: string;
  isDataSubject: boolean;
  timestamp?: string;
}

// Stubbed API call: logs to console. Replace with real endpoint later.
export async function sendPrivacyRequest(payload: PrivacyRequestPayload): Promise<{ ok: true }>{
  // eslint-disable-next-line no-console
  console.log('[privacy-request] received', {
    ...payload,
    timestamp: payload.timestamp || new Date().toISOString(),
  });
  return { ok: true };
}

