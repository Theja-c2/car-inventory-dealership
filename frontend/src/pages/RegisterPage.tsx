import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register(email, password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-amber flex items-center justify-center mx-auto mb-3">
            <span className="font-display font-bold text-charcoal text-2xl">D</span>
          </div>
          <h1 className="font-display text-3xl text-paper uppercase tracking-wide">Create Account</h1>
          <p className="text-paper/50 text-sm font-mono mt-1">Join the lot as a customer</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-paper rounded-lg shadow-xl p-6 flex flex-col gap-4">
          {error && (
            <p className="text-sm bg-signal-red/10 text-signal-red border border-signal-red/30 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-slate mb-1">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-charcoal/15 rounded text-sm focus:border-amber outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-slate mb-1">
              Password <span className="normal-case text-slate/70">(min 8 characters)</span>
            </label>
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-charcoal/15 rounded text-sm focus:border-amber outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded font-medium text-sm bg-amber text-charcoal hover:bg-amber-dark transition-colors disabled:opacity-60 mt-2"
          >
            {busy ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-center text-sm text-slate">
            Already registered?{' '}
            <Link to="/login" className="text-racing-green font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
