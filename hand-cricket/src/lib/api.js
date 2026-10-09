const ENDPOINT = `${import.meta.env.BASE_URL}api/index.php`;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function call(action, body = {}) {
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...body }),
    });
  } catch {
    throw new ApiError('No connection', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || 'Something went wrong', res.status);
  return data;
}

export const api = {
  create: (name) => call('create', { name }),
  join: (code, name) => call('join', { code, name }),
  state: (session) => call('state', { code: session.code, token: session.token }),
  act: (session, expect, value) =>
    call('act', { code: session.code, token: session.token, key: expect.key, mode: expect.mode, value }),
};
