import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.jwt;

      if (token) {
        localStorage.setItem('jwt_token', token);
        navigate('/');
      } else {
        setError('Authentication succeeded, but no token was received.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-indigo-600/15 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-cyan-500/5 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        {/* Left Info Pane */}
        <div className="hidden lg:flex bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-10 xl:p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full border-[35px] border-white/5 translate-x-24 -translate-y-24"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full border-[28px] border-white/5 -translate-x-20 translate-y-20"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-[9px] uppercase tracking-widest font-bold text-blue-200">
              <Sparkles size={12} /> Enterprise ALM Platform
            </div>

            <div className="mt-10 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center shadow-lg">
                <ShieldCheck size={34} className="text-blue-300" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">NeuroForge</h1>
                <p className="text-sm text-slate-400 mt-1">Engineering Control Center</p>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
                Build.
                <span className="text-blue-400"> Manage.</span>
                <br />
                <span className="text-slate-300">Deliver.</span>
              </h2>
              <p className="text-sm text-slate-400 mt-5 max-w-md leading-relaxed">
                A unified workspace for project planning, task management, source control, testing, deployments, and engineering operations.
              </p>
            </div>

            <div className="mt-10 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-400/10 flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                </div>
                Agile project and sprint management
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-400/10 flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-blue-400" />
                </div>
                Integrated CI/CD and repository tracking
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-400/10 flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-purple-400" />
                </div>
                Centralized QA, defects, and activity monitoring
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-10">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">NeuroForge Workspace</p>
            <p className="text-xs text-slate-600 mt-1">Secure engineering operations platform</p>
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="p-7 sm:p-10 lg:p-12 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <div className="lg:hidden flex items-center justify-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <ShieldCheck className="text-blue-600" size={30} />
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
                  Secure Access
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome back</h2>
              <p className="text-sm text-slate-400 mt-2">Sign in to access your NeuroForge workspace.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="flex items-start gap-3 bg-red-50 text-red-600 text-sm p-3.5 rounded-xl border border-red-100">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-black">!</span>
                  </div>
                  <p className="font-medium leading-relaxed">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={17} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-800 placeholder:text-slate-400"
                    placeholder="admin@neuroforge.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-300">Protected</span>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={17} />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-800 placeholder:text-slate-400"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to Workspace
                    <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            

            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-400">
              <ShieldCheck size={13} className="text-emerald-500" />
              Secure enterprise authentication
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}