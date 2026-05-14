import { useState } from 'react';

const CORRECT = import.meta.env.VITE_DASHBOARD_PASSWORD;
const STORAGE_KEY = 'lzb_auth';

export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () => !CORRECT || localStorage.getItem(STORAGE_KEY) === CORRECT
  );
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  if (unlocked) return children;

  const submit = e => {
    e.preventDefault();
    if (input === CORRECT) {
      localStorage.setItem(STORAGE_KEY, CORRECT);
      setUnlocked(true);
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        background: '#fff',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        padding: '40px 48px',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        width: '100%',
        maxWidth: 360,
      }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 15, letterSpacing: '0.08em', marginBottom: 8 }}>
          LIEBEZURBIBEL
        </div>
        <div style={{ color: '#888884', fontSize: 13, marginBottom: 28 }}>ROAS Dashboard</div>
        <form onSubmit={submit}>
          <input
            type="password"
            placeholder="Password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false); }}
            autoFocus
            style={{
              width: '100%',
              padding: '10px 14px',
              border: `1px solid ${error ? '#c0392b' : 'var(--color-border)'}`,
              borderRadius: 10,
              fontSize: 14,
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: error ? 8 : 16,
            }}
          />
          {error && (
            <div style={{ color: '#c0392b', fontSize: 12, marginBottom: 12 }}>
              Incorrect password
            </div>
          )}
          <button type="submit" style={{
            width: '100%',
            padding: '10px 0',
            background: 'var(--color-sage)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
