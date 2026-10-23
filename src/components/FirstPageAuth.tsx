import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Heart,
  Sparkles,
  PhoneCall,
  Check,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
  LogIn,
  UserPlus
} from 'lucide-react';
import { signUp, signIn, getAllUsers, UserProfile } from '../utils/authStorage';

interface FirstPageAuthProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export const FirstPageAuth: React.FC<FirstPageAuthProps> = ({ onAuthSuccess }) => {
  const existingUsers = getAllUsers();
  // If accounts already exist, default to signin for convenience, else signup
  const [mode, setMode] = useState<'signup' | 'signin'>(
    existingUsers.length > 0 ? 'signin' : 'signup'
  );

  // Simplified Sign Up fields (Only 3 essential fields required!)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Optional Guardian fields (expandable)
  const [showGuardianFields, setShowGuardianFields] = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  // Sign In fields
  const [signinIdentifier, setSigninIdentifier] = useState(
    existingUsers.length > 0 ? existingUsers[0].name : ''
  );
  const [signinPassword, setSigninPassword] = useState('');

  // UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1-Tap Fast Fill Helper
  const handleFastDemoFill = () => {
    if (mode === 'signup') {
      setName('Neha Keswani');
      setPhone('+91 98765 43210');
      setPassword('1234');
      setGuardianName('Mom');
      setGuardianPhone('+91 98111 22334');
      setShowGuardianFields(true);
    } else {
      setSigninIdentifier('Neha Keswani');
      setSigninPassword('1234');
    }
    setErrorMessage('');
  };

  const handleSelectExistingUser = (u: UserProfile) => {
    setSigninIdentifier(u.name || u.phone);
    setSigninPassword('');
    setErrorMessage('');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your name');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Please enter your mobile phone number');
      return;
    }

    if (!password || password.length < 3) {
      setErrorMessage('Please create a simple password (at least 3 characters)');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signUp(
        name.trim(),
        phone.trim(),
        '', // optional email
        password,
        password.length === 4 && /^\d{4}$/.test(password) ? password : '1234',
        guardianName.trim() || 'Mom (Guardian)',
        guardianPhone.trim() || '+91 98111 22334'
      );

      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Failed to create account.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(`Welcome, ${res.user.name}! Opening Safe Guard...`);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 150]);
      }

      setTimeout(() => {
        onAuthSuccess(res.user!);
      }, 500);
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!signinIdentifier.trim()) {
      setErrorMessage('Please enter your name or phone number');
      return;
    }

    if (!signinPassword.trim()) {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn(signinIdentifier, signinPassword);

      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Incorrect name or password.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(`Welcome back, ${res.user.name}!`);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      setTimeout(() => {
        onAuthSuccess(res.user!);
      }, 500);
    } catch {
      setErrorMessage('Error verifying password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 antialiased selection:bg-rose-500 selection:text-white relative">
      {/* Subtle background glow */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar: Safe Guard Logo & 112 Police Button */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none">
              Safe Guard
            </h1>
            <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">
              Women, Men &amp; Family Safety &bull; 100% Offline
            </span>
          </div>
        </div>

        {/* 112 Call for Acute Danger */}
        <a
          href="tel:112"
          className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/40 text-rose-300 rounded-full text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95"
        >
          <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>Call 112</span>
        </a>
      </div>

      {/* Main Form Container */}
      <div className="max-w-md w-full mx-auto my-auto py-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative">
          {/* Easy Tab Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage('');
              }}
              className={`py-3 px-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-100'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>New User (Sign Up)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage('');
              }}
              className={`py-3 px-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-100'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </div>

          {/* Quick Fast-Entry Helper Banner */}
          <div className="mb-4 p-3 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border border-rose-500/25 rounded-2xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-slate-200 font-medium">
                Want to test instantly?
              </span>
            </div>
            <button
              type="button"
              onClick={handleFastDemoFill}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-colors shrink-0 shadow-sm"
            >
              1-Tap Quick Fill
            </button>
          </div>

          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 mb-4 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 mb-4 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* EASY SIGN UP FORM */}
          {mode === 'signup' ? (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Field 1: Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  1. Your Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Neha Keswani"
                    className="w-full pl-10 pr-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              {/* Field 2: Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  2. Your Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              {/* Field 3: Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  3. Set a Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a simple password (e.g. 1234)"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Optional Guardian Contact Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowGuardianFields(!showGuardianFields)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-slate-300 font-semibold flex items-center justify-between hover:bg-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Add Emergency Guardian Phone (Optional)</span>
                  </div>
                  {showGuardianFields ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {showGuardianFields && (
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl mt-2 space-y-2.5 animate-fade-in">
                    <input
                      type="text"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="Guardian Name (e.g. Mom)"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    />
                    <input
                      type="tel"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="Guardian Mobile (+91 98111...)"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-2xl font-black text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Your Offline Account...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Create Account &amp; Start Safe Guard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* EASY SIGN IN FORM */
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Existing accounts quick select */}
              {existingUsers.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Saved Account on this Phone
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {existingUsers.map((u) => {
                      const isSelected = signinIdentifier === u.name || signinIdentifier === u.phone;
                      return (
                        <div
                          key={u.id}
                          onClick={() => handleSelectExistingUser(u)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-rose-600/15 border-rose-500/50 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-bold">{u.name}</div>
                              <div className="text-[10px] text-slate-400">{u.phone}</div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-rose-400" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Identifier */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Your Name or Phone
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={signinIdentifier}
                    onChange={(e) => setSigninIdentifier(e.target.value)}
                    placeholder="e.g. Neha Keswani or 9876543210"
                    className="w-full pl-10 pr-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Enter Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signinPassword}
                    onChange={(e) => setSigninPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-2xl font-black text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" />
                    <span>Sign In to Safe Guard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Switch Link */}
          <div className="mt-4 text-center">
            {mode === 'signup' ? (
              <p className="text-xs text-slate-400">
                Already created an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage('');
                  }}
                  className="text-rose-400 font-bold hover:underline"
                >
                  Sign In here
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage('');
                  }}
                  className="text-rose-400 font-bold hover:underline"
                >
                  Create new account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Guarantee Banner */}
      <div className="max-w-md w-full mx-auto text-center pb-2">
        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <span>🔒</span>
          <span>100% Offline Vault &bull; Data stays strictly on your phone &bull; Zero internet needed</span>
        </p>
      </div>
    </div>
  );
};
