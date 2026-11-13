import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  Briefcase,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const AuthPage: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('freelancer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setError('Please provide your name or company name.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName, role);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed. Please verify your credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password. Please double-check your credentials.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Try signing in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters long.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg =
          'Email/Password provider is currently not enabled in Firebase Console. Please click "Continue with Google" or use Quick Demo Sign-In.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoRole: UserRole) => {
    setIsSignUp(false);
    if (demoRole === 'freelancer') {
      setEmail('designer@clientvault.app');
      setPassword('DesignVault2026!');
    } else {
      setEmail('client@acmecorp.com');
      setPassword('ClientVault2026!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 selection:bg-[#4F46E5] selection:text-white">
      <div className="w-full max-w-md">
        {/* App Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] shadow-xl shadow-indigo-950/40 text-white mb-4">
            <Shield className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">CVault</h1>
          <p className="text-sm text-[#94A3B8] mt-1.5 font-medium">
            The secure client file portal for designers & freelancers
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-[#1E293B] rounded-2xl shadow-2xl border border-[#334155] overflow-hidden p-7 sm:p-8">
          {/* Tab Switcher */}
          <div className="flex bg-[#0F172A] p-1 rounded-xl mb-6 text-sm font-medium border border-[#334155]/60">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError(null);
              }}
              className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                !isSignUp
                  ? 'bg-[#1E293B] text-white shadow-sm font-semibold border border-[#334155]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError(null);
              }}
              className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                isSignUp
                  ? 'bg-[#1E293B] text-white shadow-sm font-semibold border border-[#334155]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Create an Account
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                    Your Name or Studio Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins or Nova Design Lab"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#334155] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] bg-[#1E293B] text-white placeholder-[#94A3B8]/60"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                    I am joining as:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setRole('freelancer')}
                      className={`p-2.5 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                        role === 'freelancer'
                          ? 'border-[#4F46E5] bg-[#4F46E5]/20 text-white ring-1 ring-[#4F46E5] font-semibold'
                          : 'border-[#334155] bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155]/40 hover:text-white'
                      }`}
                    >
                      Freelancer / Designer
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('client')}
                      className={`p-2.5 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                        role === 'client'
                          ? 'border-[#4F46E5] bg-[#4F46E5]/20 text-white ring-1 ring-[#4F46E5] font-semibold'
                          : 'border-[#334155] bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155]/40 hover:text-white'
                      }`}
                    >
                      Client / Organization
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#334155] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] bg-[#1E293B] text-white placeholder-[#94A3B8]/60"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#334155] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] bg-[#1E293B] text-white placeholder-[#94A3B8]/60"
                  minLength={6}
                  required
                />
              </div>
              {isSignUp && (
                <p className="text-[11px] text-[#94A3B8] mt-1">Must be at least 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm transition-all shadow-md shadow-indigo-950/50 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create an Account' : 'Sign In to CVault'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#334155]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-[#1E293B] px-3 text-[#94A3B8] font-semibold">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1E293B] hover:bg-[#334155]/50 border border-[#334155] text-white font-medium text-sm transition-all flex items-center justify-center gap-3 shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Quick Demo Credentials Footer */}
          <div className="mt-6 pt-5 border-t border-[#334155] text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-2 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-[#4F46E5]" /> Quick Demo Accounts
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('freelancer')}
                className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline px-2.5 py-1 rounded-lg bg-[#0F172A] border border-[#334155] cursor-pointer font-medium"
              >
                Freelancer Demo
              </button>
              <span className="text-[#334155]">•</span>
              <button
                type="button"
                onClick={() => fillDemoAccount('client')}
                className="text-xs text-[#94A3B8] hover:text-white hover:underline px-2.5 py-1 rounded-lg bg-[#0F172A] border border-[#334155] cursor-pointer font-medium"
              >
                Client Demo
              </button>
            </div>
          </div>
        </div>

        {/* Security Trust Badge */}
        <div className="text-center mt-6 text-xs text-[#94A3B8] flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#4F46E5]" />
          <span>AES-256 encrypted storage & private user data isolation</span>
        </div>
      </div>
    </div>
  );
};
