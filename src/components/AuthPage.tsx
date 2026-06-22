import React, { useState } from "react";
import { Globe, ArrowRight, ShieldCheck, User, Mail, Lock, Sparkles, CheckCircle, Eye, EyeOff } from "lucide-react";
import { UserProfile } from "../types";

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const DEMO_USER: UserProfile = {
    uid: "demo_user_magesh",
    displayName: "Magesh Sangeethavg",
    email: "demo@civicpulse.org",
    points: 410,
    badge: "City Champion",
    createdAt: new Date().toISOString()
  };

  const handleAutofillDemo = () => {
    setEmail("demo@civicpulse.org");
    setPassword("demo123");
    setIsLogin(true);
    setError("");
    setSuccess("Autofilled Demo Profile! Click standard sign in below.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill out all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Checking for Demo Account Login
    if (isLogin) {
      if (email.toLowerCase() === "demo@civicpulse.org" && password === "demo123") {
        setSuccess("Demo Session Activated!");
        setTimeout(() => {
          onLoginSuccess(DEMO_USER);
        }, 800);
        return;
      }

      // Check registered users in localStorage
      const registeredUsersRaw = localStorage.getItem("civicpulse_users");
      const users: Array<UserProfile & { password?: string }> = registeredUsersRaw 
        ? JSON.parse(registeredUsersRaw) 
        : [];

      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (foundUser) {
        if (foundUser.password === password) {
          setSuccess("Welcome back, " + foundUser.displayName + "!");
          setTimeout(() => {
            onLoginSuccess({
              uid: foundUser.uid,
              displayName: foundUser.displayName,
              email: foundUser.email,
              points: foundUser.points,
              badge: foundUser.badge,
              createdAt: foundUser.createdAt
            });
          }, 800);
          return;
        } else {
          setError("Incorrect password. Please try again.");
          return;
        }
      } else {
        setError("Account not found. Feel free to register or use the quick demo login!");
        return;
      }
    } else {
      // Register logic
      const registeredUsersRaw = localStorage.getItem("civicpulse_users");
      const users: Array<UserProfile & { password?: string }> = registeredUsersRaw 
        ? JSON.parse(registeredUsersRaw) 
        : [];

      if (email.toLowerCase() === "demo@civicpulse.org") {
        setError("This email address is reserved for the pre-loaded demo account.");
        return;
      }

      const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        setError("An account with this email already exists. Please log in instead.");
        return;
      }

      // Create new user with 50 points sign-up bonus!
      const newUser = {
        uid: `user_${Date.now()}`,
        displayName: name,
        email: email,
        points: 50,
        badge: "Community Helper",
        createdAt: new Date().toISOString(),
        password: password
      };

      users.push(newUser);
      localStorage.setItem("civicpulse_users", JSON.stringify(users));

      setSuccess("Account Registered successfully! +50 Civic Starter Points Awarded.");
      setTimeout(() => {
        onLoginSuccess({
          uid: newUser.uid,
          displayName: newUser.displayName,
          email: newUser.email,
          points: newUser.points,
          badge: newUser.badge,
          createdAt: newUser.createdAt
        });
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background radial soft lights */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-950/10 blur-[120px] pointer-events-none" />

      {/* Main card panel */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-indigo-600 border border-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-3.5 select-none hover:scale-105 transition-transform">
            <Globe className="w-6 h-6 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-black font-display text-white tracking-tight flex items-center justify-center gap-1.5 leading-none">
            CivicPulse <span className="text-indigo-500 text-sm font-semibold tracking-normal border border-indigo-500/30 px-2 py-0.5 rounded-full">AI</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium font-sans mt-2">Chengalpattu Citizen Monitoring & Resolution</p>
        </div>

        {/* Dynamic switcher tabs */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold font-display transition-all cursor-pointer ${
              isLogin ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold font-display transition-all cursor-pointer ${
              !isLogin ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Join Registry
          </button>
        </div>

        {/* Demo Account quick-access panel */}
        <div className="mb-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-bounce" />
              <span className="text-xs font-bold font-display text-slate-200">Interactive Demo Profile</span>
            </div>
            <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded-full font-bold">
              410 PTS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 text-left leading-relaxed">
            Skip registration! Access preloaded sensor reports, leaderboard status, and neighborhood statistics immediately.
          </p>
          <button
            onClick={handleAutofillDemo}
            type="button"
            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-white hover:text-indigo-300 py-2.5 rounded-xl text-xs font-bold font-display cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>One-Click Autofill Demo credentials</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Input Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-950/80 border border-red-900/50 text-red-300 text-left rounded-xl p-3 text-xs leading-snug">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-950/80 border border-emerald-950 text-emerald-300 text-left rounded-xl p-3 text-xs leading-snug flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider pl-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Magesh Sangeethavg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm focus:outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>
          )}

          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="mageshsangeethavg@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm focus:outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 pl-10 pr-10 py-3 rounded-xl text-xs sm:text-sm focus:outline-none transition-all placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-slate-100 border border-indigo-600 hover:border-slate-100 text-white hover:text-indigo-950 py-3 rounded-2xl text-xs sm:text-sm font-bold font-display cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-650/20 mt-4"
          >
            <span>{isLogin ? "Continue to Platform" : "Create My Account"}</span>
            <ArrowRight className="w-4 h-4 animate-bounce" />
          </button>
        </form>
      </div>

      {/* Footer info card */}
      <div className="mt-8 text-[11px] text-slate-500 max-w-sm text-center">
        <span>By signing in, you are registering as an official neighborhood civic sensor under the Local Chengalpattu Ward Administration guidelines.</span>
      </div>
    </div>
  );
}
