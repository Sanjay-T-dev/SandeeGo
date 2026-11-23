import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search || ''}` : '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={redirectTo} replace />;

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="panel auth-card form" onSubmit={submit}>
        <h2>Welcome back 👋</h2>
        <p className="muted">
          {from ? 'Please log in before placing an order.' : 'Please log in to your account.'}
        </p>

        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={update} autoComplete="email" required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={update} autoComplete="current-password" required />
        </label>

        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={submitting}>{submitting ? 'Logging in...' : 'Login'}</button>

        <p className="auth-switch">
          Don't you have an account? <Link to="/signup" state={location.state}>Please sign up.</Link>
        </p>
      </form>
    </div>
  );
}
