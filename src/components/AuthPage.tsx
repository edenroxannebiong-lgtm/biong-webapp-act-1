import React, { useState } from 'react';
import { BookHeart, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

export const AuthPage: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const { isDark } = useTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const switchMode = (signUpMode: boolean) => {
    setIsSignUp(signUpMode);
    setError(null);
  };

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

  const panelStyle: React.CSSProperties = isDark
    ? {
        background: 'linear-gradient(135deg, #5C0A0B 0%, #7A1C1E 100%)',
        color: '#F3E3E2',
      }
    : {
        background: 'linear-gradient(135deg, #E0A0B2 0%, #F0C9D3 100%)',
        color: '#3F2A32',
      };

  const outlinedButtonStyle: React.CSSProperties = isDark
    ? {
        borderColor: '#B67E7D',
        color: '#F3E3E2',
      }
    : {
        borderColor: '#7B5A66',
        color: '#7B5A66',
      };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-4 sm:p-6 relative selection:bg-[var(--accent)] selection:text-[var(--accent-text)] transition-colors">
      {/* Theme Toggle on Login Page */}
      <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Centered Split-Screen Card */}
      <div className="w-full max-w-[940px] bg-[var(--bg-card)] rounded-[32px] border border-[var(--border-primary)] shadow-sm overflow-hidden transition-colors">
        <div className="relative flex flex-col md:block md:min-h-[670px]">
          {/* Soft Pink Brand & Welcome Panel (Top banner on phones, sliding left/right half on desktop) */}
          <div
            style={panelStyle}
            className={`w-full md:w-1/2 md:absolute md:inset-y-0 md:left-0 md:z-10 rounded-b-[28px] md:rounded-[32px] px-6 py-7 sm:px-8 sm:py-8 md:p-10 flex flex-col items-center justify-center text-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              isSignUp ? 'md:translate-x-full' : 'md:translate-x-0'
            }`}
          >
            <div className="max-w-xs w-full flex flex-col items-center">
              {/* Brand Logo */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent)] text-[var(--accent-text)] shadow-sm mb-3.5 md:mb-4">
                <BookHeart className="w-7 h-7 stroke-[2]" />
              </div>

              <h1
                className="font-display text-3xl font-semibold tracking-tight"
                style={{ color: isDark ? '#F3E3E2' : '#3F2A32' }}
              >
                Keepsake
              </h1>

              <p
                className="text-sm mt-1.5 leading-relaxed"
                style={{ color: isDark ? '#EAD0CE' : '#3F2A32', opacity: 0.9 }}
              >
                A quiet daily diary for your thoughts and reflections
              </p>

              <div
                className="w-12 h-px my-4 md:my-6"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(243, 227, 226, 0.25)'
                    : 'rgba(63, 42, 50, 0.18)',
                }}
              />

              <p
                className="font-display text-xl md:text-2xl font-semibold tracking-tight"
                style={{ color: isDark ? '#F3E3E2' : '#3F2A32' }}
              >
                Hello, Welcome!
              </p>

              <button
                type="button"
                onClick={() => switchMode(!isSignUp)}
                style={outlinedButtonStyle}
                className="mt-4 md:mt-5 px-7 py-2.5 rounded-xl border-2 font-semibold text-sm bg-transparent hover:bg-black/5 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                {isSignUp ? 'Sign In' : 'Register'}
              </button>
            </div>
          </div>

          {/* Light Form Panel (Below banner on phones, sliding opposite half on desktop) */}
          <div
            className={`w-full md:w-1/2 md:absolute md:inset-y-0 md:left-0 bg-[var(--bg-card)] px-6 py-7 sm:px-8 sm:py-8 md:px-10 md:py-9 flex flex-col justify-center overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              isSignUp ? 'md:translate-x-0' : 'md:translate-x-full'
            }`}
          >
            <div className="w-full max-w-sm mx-auto">
              {/* Segmented Switcher */}
              <div className="flex bg-[var(--bg-subtle)] p-1 rounded-xl mb-6 text-sm font-medium border border-[var(--border-primary)]">
                <button
                  type="button"
                  onClick={() => switchMode(false)}
                  className={`flex-1 py-2 text-center rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    !isSignUp
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode(true)}
                  className={`flex-1 py-2 text-center rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    isSignUp
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Create an Account
                </button>
              </div>

              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-[var(--bg-error)] border border-[var(--border-error)] text-xs text-[var(--text-error)] flex items-start gap-2.5">
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
                      className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5"
                    >
                      Your Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="auth-name"
                        type="text"
                        placeholder="e.g. Clara Bennett"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        maxLength={100}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60"
                      minLength={6}
                      required
                    />
                  </div>
                  {isSignUp && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                      Must be at least 6 characters
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-text)] font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
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
                  <div className="w-full border-t border-[var(--border-primary)]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[var(--bg-card)] px-3 text-[var(--text-secondary)] font-medium">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] text-[var(--text-primary)] font-medium text-sm transition-colors flex items-center justify-center gap-3 cursor-pointer"
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

              {/* Quiet Footer Note */}
              <p className="text-center mt-6 text-xs text-[var(--text-secondary)]">
                Your reflections are private and saved securely to your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
