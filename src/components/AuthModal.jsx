import { useState } from 'react';
import toast from 'react-hot-toast';
import { login, setAuthToken, signup } from '../services/api';

export default function AuthModal({ onAuthed }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = mode === 'signup' ? { name, email, password } : { email, password };
      const response = mode === 'signup' ? await signup(payload) : await login(payload);

      localStorage.setItem('builder_token', response.token);
      localStorage.setItem('builder_user', JSON.stringify(response.user));
      setAuthToken(response.token);
      toast.success(`Welcome ${response.user.name}!`);
      onAuthed(response.user);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h1 className="text-xl font-bold text-slate-900">Website Builder</h1>
        <p className="mb-4 mt-1 text-sm text-slate-500">
          {mode === 'login' ? 'Login to continue' : 'Create your account'}
        </p>

        {mode === 'signup' && (
          <input
            className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign up'}
        </button>

        <button
          type="button"
          onClick={() => setMode((prev) => (prev === 'login' ? 'signup' : 'login'))}
          className="mt-3 w-full text-sm text-blue-600"
        >
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Login'}
        </button>
      </form>
    </div>
  );
}
