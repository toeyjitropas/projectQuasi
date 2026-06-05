import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Btn, Field } from '../components/ui';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/calendar';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 380, padding: '0 20px' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--amber)', letterSpacing: '-0.02em' }}>EVENT</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>STUDIO</div>
          <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 4, letterSpacing: '0.1em' }}>MANAGEMENT PLATFORM</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 28 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 20 }}>Sign in</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Email" value={email} type="email" onChange={e => setEmail(e.target.value)} />
            <Field label="Password" value={password} type="password" onChange={e => setPassword(e.target.value)} />
            {error && (
              <div style={{ fontSize: 11, color: 'var(--danger)', padding: '8px 12px', background: 'var(--danger)11', borderRadius: 6, border: '1px solid var(--danger)33' }}>
                {error}
              </div>
            )}
            <Btn type="submit" full>{loading ? 'Signing in…' : 'Sign in'}</Btn>
          </form>
        </div>
      </div>
    </div>
  );
}
