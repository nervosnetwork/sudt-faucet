import { useState } from 'react';

const CLAIM_SECRET_PARAM_KEY = 'claim_secret';

function getClaimSecretFromUrl(): string | undefined {
  const searchParams = new URLSearchParams(window.location.search.slice(1));
  const secret = searchParams.get(CLAIM_SECRET_PARAM_KEY);

  if (!secret) return undefined;

  searchParams.delete(CLAIM_SECRET_PARAM_KEY);

  const { pathname, host, protocol } = window.location;

  const qs = searchParams.toString();
  const newUrl = `${protocol}//${host}${pathname}${qs ? `?${qs}` : ''}`;

  setClaimSecret(secret);
  window.history.replaceState({ path: newUrl }, '', newUrl);
  return secret;
}

function getClaimSecret(): string | undefined {
  return getClaimSecretFromUrl() ?? localStorage.getItem(CLAIM_SECRET_PARAM_KEY) ?? undefined;
}

function setClaimSecret(secret: string) {
  localStorage.setItem(CLAIM_SECRET_PARAM_KEY, secret);
}

function clearClaimSecret() {
  localStorage.removeItem(CLAIM_SECRET_PARAM_KEY);
}

export function useClaimSecret(): [string | undefined, () => void] {
  const [secret, setSecret] = useState(getClaimSecret);

  function internalClearClaimSecret() {
    clearClaimSecret();
    setSecret(undefined);
  }

  return [secret, internalClearClaimSecret];
}
