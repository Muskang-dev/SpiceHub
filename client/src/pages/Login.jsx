import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Show friendly toast if redirected from a protected route
  useEffect(() => {
    const msg = localStorage.getItem('spicehub_redirect_msg');
    if (msg) {
      // small delay so the page renders before the toast fires
      setTimeout(() => {
        toast('🔒 Please log in to continue', {
          style: {
            background: '#1a1a2e',
            color: '#fff',
            fontWeight: '500',
            borderRadius: '12px',
            fontSize: '0.9rem',
          },
          duration: 4000,
        });
      }, 200);
      localStorage.removeItem('spicehub_redirect_msg');
    }
  }, []);

  const quickFill = (email, password) => {
    setForm({ email, password });
    toast('Credentials filled — click Sign In!', {
      icon: '✏️',
      style: { borderRadius: '12px', fontSize: '0.85rem' },
      duration: 2000,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 🌶`, {
        style: { borderRadius: '12px', fontWeight: '500' },
      });
      // Go to the page they tried to visit, or default
      const from = location.state?.from || (user.role === 'admin' ? '/admin' : '/');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password.', {
        style: { borderRadius: '12px' },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center bg-gradient-to-br from-[#fdf8f5] to-orange-50 px-4 py-10">
      <div
        className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 w-full max-w-md"
        style={{ animation: 'fadeUp 0.35s ease forwards' }}
      >
        {/* Header */}
        <div className="text-center mb-7">
          <div
            className="font-head text-3xl text-[#e05c2a] mb-2"
            style={{ letterSpacing: '-0.5px' }}
          >
            🌶 SpiceHub
          </div>
          <h1 className="font-head text-2xl font-bold text-[#1a1a2e]">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to continue ordering</p>
        </div>

        {/* Demo quick-fill buttons */}
        <div className="bg-[#fdf8f5] border border-orange-100 rounded-2xl p-4 mb-6">
          <p className="text-xs font-semibold text-[#e05c2a] mb-2.5 flex items-center gap-1.5">
            <i className="fas fa-bolt"></i> Quick demo login
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => quickFill('admin@spicehub.in', 'admin123')}
              className="flex-1 flex flex-col items-center gap-0.5 bg-white border border-gray-200 hover:border-[#e05c2a] hover:bg-orange-50 transition-all rounded-xl py-2.5 px-2 group"
            >
              <span className="text-base">🛠</span>
              <span className="text-xs font-bold text-gray-700 group-hover:text-[#e05c2a]">Admin</span>
              <span className="text-[10px] text-gray-400 font-mono">admin@spicehub.in</span>
            </button>
            <button
              type="button"
              onClick={() => quickFill('priya@example.com', 'password123')}
              className="flex-1 flex flex-col items-center gap-0.5 bg-white border border-gray-200 hover:border-[#e05c2a] hover:bg-orange-50 transition-all rounded-xl py-2.5 px-2 group"
            >
              <span className="text-base">👩</span>
              <span className="text-xs font-bold text-gray-700 group-hover:text-[#e05c2a]">User</span>
              <span className="text-[10px] text-gray-400 font-mono">priya@example.com</span>
            </button>
            <button
              type="button"
              onClick={() => quickFill('rahul@example.com', 'password123')}
              className="flex-1 flex flex-col items-center gap-0.5 bg-white border border-gray-200 hover:border-[#e05c2a] hover:bg-orange-50 transition-all rounded-xl py-2.5 px-2 group"
            >
              <span className="text-base">👨</span>
              <span className="text-xs font-bold text-gray-700 group-hover:text-[#e05c2a]">User 2</span>
              <span className="text-[10px] text-gray-400 font-mono">rahul@example.com</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">
                <i className="fas fa-envelope text-sm"></i>
              </span>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoFocus
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#e05c2a] focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">
                <i className="fas fa-lock text-sm"></i>
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-11 py-3 text-sm focus:outline-none focus:border-[#e05c2a] focus:ring-2 focus:ring-orange-100 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e05c2a] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#c04820] active:scale-[0.98] transition-all shadow-lg shadow-orange-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spinner"></div>
                Signing in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-5 pt-5 border-t border-gray-100 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-[#e05c2a] font-semibold hover:underline"
          >
            Sign Up free
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────
export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [strength, setStrength] = useState(0);

  const calcStrength = (p) => {
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    setStrength(s);
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-600'];

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters', {
        style: { borderRadius: '12px' },
      });
      return;
    }
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.phone);
      toast.success(`Welcome to SpiceHub, ${user.name.split(' ')[0]}! 🎉`, {
        style: { borderRadius: '12px', fontWeight: '500' },
      });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.', {
        style: { borderRadius: '12px' },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center bg-gradient-to-br from-[#fdf8f5] to-orange-50 px-4 py-10">
      <div
        className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 w-full max-w-md"
        style={{ animation: 'fadeUp 0.35s ease forwards' }}
      >
        {/* Header */}
        <div className="text-center mb-7">
          <div className="font-head text-3xl text-[#e05c2a] mb-2">🌶 SpiceHub</div>
          <h1 className="font-head text-2xl font-bold text-[#1a1a2e]">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Join SpiceHub and start ordering</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">
                <i className="fas fa-user text-sm"></i>
              </span>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                autoFocus
                placeholder="Priya Sharma"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#e05c2a] focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">
                <i className="fas fa-envelope text-sm"></i>
              </span>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#e05c2a] focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone Number <span className="text-gray-300 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">
                <i className="fas fa-phone text-sm"></i>
              </span>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 XXXXX XXXXX"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#e05c2a] focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">
                <i className="fas fa-lock text-sm"></i>
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); calcStrength(e.target.value); }}
                required
                placeholder="Min. 6 characters"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-11 py-3 text-sm focus:outline-none focus:border-[#e05c2a] focus:ring-2 focus:ring-orange-100 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
              </button>
            </div>

            {/* Password strength bar */}
            {form.password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : 'bg-gray-100'}`}
                    ></div>
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  Strength: <span className={`font-semibold ${strength >= 4 ? 'text-green-500' : strength >= 3 ? 'text-yellow-500' : 'text-red-400'}`}>{strengthLabel[strength]}</span>
                </p>
              </div>
            )}
          </div>

          {/* Terms note */}
          <p className="text-xs text-gray-400 text-center">
            By signing up, you agree to our{' '}
            <span className="text-[#e05c2a] cursor-pointer hover:underline">Terms of Service</span>
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e05c2a] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#c04820] active:scale-[0.98] transition-all shadow-lg shadow-orange-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spinner"></div>
                Creating Account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i>
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-5 pt-5 border-t border-gray-100 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-[#e05c2a] font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
