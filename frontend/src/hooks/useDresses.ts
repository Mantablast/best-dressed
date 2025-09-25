import { useEffect, useRef, useState } from "react";

type RetryOpts = { maxAttempts?: number; baseDelay?: number; };

async function fetchWithRetry(url: string, signal: AbortSignal, { maxAttempts = 7, baseDelay = 600 }: RetryOpts = {}) {
  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt++;
    try {
      const res = await fetch(url, { signal, headers: { accept: "application/json" } });
      if (!res.ok) {
        // retry on common transient statuses
        if ([500, 502, 503, 504, 522, 524, 429].includes(res.status)) throw new Error(`Retryable ${res.status}`);
        const text = await res.text().catch(() => "");
        const err: any = new Error(`HTTP ${res.status} ${res.statusText} ${text}`.trim());
        err.nonRetryable = true;
        throw err;
      }
      return { data: await res.json(), attempts: attempt };
    } catch (err: any) {
      if (signal.aborted || err?.nonRetryable) throw err;
      if (attempt >= maxAttempts) throw err;
      const jitter = Math.random() * 0.25 + 0.9; // 0.9–1.15x
      const delay = Math.floor(baseDelay * Math.pow(1.75, attempt - 1) * jitter);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  return { data: null, attempts: maxAttempts };
}

export function useDresses(queryString = "") {
  const [dresses, setDresses] = useState<any[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const url = `/api/dresses${queryString ? `?${queryString}` : ""}`;

  const load = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsRetrying(true);
    setError(null);

    try {
      const { data, attempts } = await fetchWithRetry(url, controller.signal, { maxAttempts: 7, baseDelay: 600 });
      setDresses(Array.isArray(data) ? data : []);
      setAttempts(attempts);
    } catch (e: any) {
      setError(e);
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  return { dresses, error, attempts, isRetrying, reload: load };
}
