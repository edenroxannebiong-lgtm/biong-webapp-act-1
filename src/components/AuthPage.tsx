import React, { useState } from 'react';
import { BookHeart, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setError('Please enter your name so we can personalize your journal.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Could not sign you in. Please check your details.';
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        msg = 'The email or password you entered does not match our records.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Try signing in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Please choose a password with at least 6 characters.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg =
          'Email/Password sign-in needs to be enabled in your Firebase Authentication console, or you can use Continue with Google below.';
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

  return (
    <div className="min-h-screen bg-[#F6E6EA] flex items-center justify-center p-6 selection:bg-[#7B5A66] selection:text-white">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7B5A66] text-white shadow-sm mb-4">
            <BookHeart className="w-7 h-7 stroke-[2]" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-[#3F2A32] tracking-tight">
            Keepsake
          </h1>
          <p className="text-sm text-[#7B5A66] mt-1.5">
            A quiet daily diary for your thoughts and reflections
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#FBF3F5] rounded-2xl border border-[#F0C9D3] p-7 sm:p-8 shadow-sm">
          {/* Segmented Switcher */}
          <div className="flex bg-[#F6E6EA] p-1 rounded-xl mb-6 text-sm font-medium border border-[#F0C9D3]">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError(null);
              }}
              className={`flex-1 py-2 text-center rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                !isSignUp
                  ? 'bg-[#FBF3F5] text-[#3F2A32] font-semibold shadow-xs'
                  : 'text-[#7B5A66] hover:text-[#3F2A32]'
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
              className={`flex-1 py-2 text-center rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                isSignUp
                  ? 'bg-[#FBF3F5] text-[#3F2A32] font-semibold shadow-xs'
                  : 'text-[#7B5A66] hover:text-[#3F2A32]'
              }`}
            >
              Create an Account
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#FCE8EC] border border-[#E0A0B2] text-xs text-[#7E2738] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-xs font-semibold text-[#3F2A32] mb-1.5"
                >
                  Your Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#7B5A66] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="e.g. Clara Bennett"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={100}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#F0C9D3] focus:outline-none focus:ring-2 focus:ring-[#7B5A66] focus:border-[#7B5A66] bg-white text-[#3F2A32] placeholder-[#7B5A66]/60"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-semibold text-[#3F2A32] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7B5A66] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#F0C9D3] focus:outline-none focus:ring-2 focus:ring-[#7B5A66] focus:border-[#7B5A66] bg-white text-[#3F2A32] placeholder-[#7B5A66]/60"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-semibold text-[#3F2A32] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7B5A66] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#F0C9D3] focus:outline-none focus:ring-2 focus:ring-[#7B5A66] focus:border-[#7B5A66] bg-white text-[#3F2A32] placeholder-[#7B5A66]/60"
                  minLength={6}
                  required
                />
              </div>
              {isSignUp && (
                <p className="text-xs text-[#7B5A66] mt-1.5">Must be at least 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#7B5A66] hover:bg-[#654752] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B5A66]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create an Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#F0C9D3]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#FBF3F5] px-3 text-[#7B5A66] font-medium">
                or continue with
              </span>
            </div>
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#F6E6EA]/60 border border-[#E0A0B2] text-[#3F2A32] font-medium text-sm transition-colors flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
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
        </div>

        {/* Quiet Footer Note */}
        <p className="text-center mt-6 text-xs text-[#7B5A66]">
          Your reflections are private and saved securely to your account.
        </p>
      </div>
    </div>
  );
};
