import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Signup() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search || ''}` : '/';

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={redirectTo} replace />;

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    // Client-side quick checks (server-um same validation pannum)
    if (!/^\d{10}$/.test(form.phone)) return setError('Please enter a valid 10-digit phone number.');
    if (form.password.length < 8) return setError('The password must be at least 8 characters long.');
    if (form.password !== form.confirm) return setError('The passwords do not match.');

    setSubmitting(true);
    try {
      await signup({ name: form.name, email: form.email, phone: form.phone, password: form.password });
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
        <h2>Please create an account. 🍽️</h2>
        <p className="muted">Get ready in just one minute, then you can place your order.</p>

        <label>
          Name
          <input name="name" value={form.name} onChange={update} autoComplete="name" required minLength={2} maxLength={60} />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={update} autoComplete="email" required />
        </label>
        <label>
          Phone (10 digits)
          <input name="phone" value={form.phone} onChange={update} inputMode="numeric" maxLength={10} autoComplete="tel" required />
        </label>
        <label>
          Password (min 8 characters)
          <input name="password" type="password" value={form.password} onChange={update} autoComplete="new-password" required minLength={8} />
        </label>
        <label>
          Confirm password
          <input name="confirm" type="password" value={form.confirm} onChange={update} autoComplete="new-password" required />
        </label>

        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={submitting}>{submitting ? 'Creating...' : 'Sign up'}</button>

        <p className="auth-switch">
          Do you already have an account? <Link to="/login" state={location.state}>Please log in.</Link>
        </p>
      </form>
    </div>
  );
}
