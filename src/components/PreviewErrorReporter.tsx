import React from 'react';
import { Platform } from 'react-native';

type ErrorPayload = { type: 'nova8:error'; message: string; stack?: string; source?: string; timestamp: number };

function isInNova8Preview(): boolean {
  if (Platform.OS !== 'web') return false;
  if (typeof window === 'undefined') return false;
  try {
    if (window.parent === window) return false;
    const host = window.location?.hostname || '';
    return /\.e2b\.app$/i.test(host) || host === 'localhost' || host === '127.0.0.1';
  } catch { return false; }
}

const lastSent: { key: string; at: number } = { key: '', at: 0 };

function sendError(msg: string, stack?: string, source?: string) {
  if (!isInNova8Preview()) return;
  const cleanMsg = String(msg || 'Unknown error').slice(0, 500);
  const key = `${cleanMsg}::${(stack || '').slice(0, 200)}`;
  const now = Date.now();
  if (lastSent.key === key && now - lastSent.at < 2000) return;
  lastSent.key = key; lastSent.at = now;
  const payload: ErrorPayload = { type: 'nova8:error', message: cleanMsg, stack: stack ? String(stack).slice(0, 4000) : undefined, source, timestamp: now };
  try { window.parent.postMessage(payload, '*'); } catch {}
}

let installed = false;
function installGlobalHandlers() {
  if (installed || !isInNova8Preview()) return;
  installed = true;
  const prevOnError = window.onerror;
  window.onerror = function (message, _src, _l, _c, error) {
    try {
      const msg = error?.message || (typeof message === 'string' ? message : 'Uncaught error');
      sendError(msg, error?.stack, 'window.onerror');
    } catch {}
    if (typeof prevOnError === 'function') return (prevOnError as any).apply(this, arguments as any);
    return false;
  };
  window.addEventListener('unhandledrejection', (evt: PromiseRejectionEvent) => {
    try {
      const reason: any = evt.reason;
      const msg = reason?.message || (typeof reason === 'string' ? reason : 'Unhandled rejection');
      sendError(msg, reason?.stack, 'unhandledrejection');
    } catch {}
  });
  try {
    const EU: any = (global as any).ErrorUtils;
    if (EU && typeof EU.setGlobalHandler === 'function') {
      const prev = EU.getGlobalHandler?.();
      EU.setGlobalHandler((error: Error, isFatal?: boolean) => {
        try { sendError(error?.message || 'RN error', error?.stack, isFatal ? 'rn:fatal' : 'rn:error'); } catch {}
        if (prev) prev(error, isFatal);
      });
    }
  } catch {}
  const prevConsoleError = console.error.bind(console);
  console.error = function (...args: any[]) {
    try {
      for (const arg of args) {
        if (arg instanceof Error) {
          const msg = arg.message || 'Render error';
          if (arg.stack?.includes('react') || /is not (a function|defined)/i.test(msg) || /cannot read (property|properties)/i.test(msg) || /undefined is not an object/i.test(msg)) {
            sendError(msg, arg.stack, 'console.error');
            break;
          }
        }
      }
    } catch {}
    return prevConsoleError(...args);
  };
}

let aliveSent = false;
function sendAlive() {
  if (aliveSent || !isInNova8Preview()) return;
  aliveSent = true;
  try { window.parent.postMessage({ type: 'nova8:alive', timestamp: Date.now() }, '*'); } catch {}
}

export function PreviewErrorReporter({ children }: { children: React.ReactNode }) {
  if (typeof window !== 'undefined' && !installed) {
    try { installGlobalHandlers(); } catch {}
  }
  React.useEffect(() => {
    installGlobalHandlers();
    const raf = requestAnimationFrame(() => {
      const t = setTimeout(() => { sendAlive(); }, 100);
      (raf as any)._t = t;
    });
    return () => { cancelAnimationFrame(raf); const t = (raf as any)?._t; if (t) clearTimeout(t); };
  }, []);
  return <>{children}</>;
}

export default PreviewErrorReporter;
