import React, { useState, useEffect } from "react";
import { Issue, UserProfile } from "./types";
import { mockIssues } from "./data/mockData";
import { 
  Building, 
  MapPin, 
  ShieldCheck, 
  Flame, 
  Trophy, 
  PlusCircle, 
  LayoutDashboard, 
  Globe, 
  Settings, 
  Heart, 
  User, 
  ArrowRight,
  Info,
  LogOut
} from "lucide-react";
import IssuesDashboard from "./components/IssuesDashboard";
import ReportIssue from "./components/ReportIssue";
import HotspotsDashboard from "./components/HotspotsDashboard";
import VerificationFeed from "./components/VerificationFeed";
import Leaderboard from "./components/Leaderboard";
import AuthPage from "./components/AuthPage";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "report" | "hotspots" | "verify" | "leaderboard">("dashboard");
  const [issues, setIssues] = useState<Issue[]>(mockIssues);

  // Authenticated user profile setup loaded from local storage
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("civicpulse_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Calculate dynamic standing badge based on points balance
  useEffect(() => {
    if (!userProfile) return;
    let standingBadge: "Community Helper" | "Neighborhood Guardian" | "Civic Hero" | "City Champion" = "Community Helper";
    if (userProfile.points >= 400) {
      standingBadge = "City Champion";
    } else if (userProfile.points >= 250) {
      standingBadge = "Civic Hero";
    } else if (userProfile.points >= 100) {
      standingBadge = "Neighborhood Guardian";
    }

    if (userProfile.badge !== standingBadge) {
      setUserProfile(prev => {
        if (!prev) return null;
        const updated = { ...prev, badge: standingBadge };
        localStorage.setItem("civicpulse_current_user", JSON.stringify(updated));
        return updated;
      });
    }
  }, [userProfile?.points]);

  // Handler: citizen files a complete issue report
  const handleAddIssue = (newIssue: Omit<Issue, "id" | "confirmationCount" | "rejectionCount" | "resolvedCount" | "status" | "createdAt" | "updatedAt">) => {
    const freshClaims: Issue = {
      ...newIssue,
      id: `issue_${Date.now()}`,
      status: "Reported",
      confirmationCount: 0,
      rejectionCount: 0,
      resolvedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setIssues(prev => [freshClaims, ...prev]);
    
    // Add Sensor points for filings
    setUserProfile(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        points: prev.points + 10
      };
      localStorage.setItem("civicpulse_current_user", JSON.stringify(updated));
      return updated;
    });
  };

  // Handler: adjacent citizen validates reported claiming
  const handleVerifyIssue = (issueId: string, type: "confirm" | "reject" | "resolved") => {
    let earnedPoints = 5;
    if (type === "resolved") earnedPoints = 20;

    setIssues((prevIssues) =>
      prevIssues.map((issue) => {
        if (issue.id !== issueId) return issue;

        let confIncrement = 0;
        let rejectIncrement = 0;
        let resolvedIncrement = 0;
        let updatedStatus = issue.status;
        let updatedTrust = issue.trustScore;

        if (type === "confirm") {
          confIncrement = 1;
          updatedTrust = Math.min(99, issue.trustScore + 3);
          if (issue.confirmationCount >= 3 && issue.status === "Reported") {
            updatedStatus = "Verified";
          }
        } else if (type === "reject") {
          rejectIncrement = 1;
          updatedTrust = Math.max(10, issue.trustScore - 8);
        } else if (type === "resolved") {
          resolvedIncrement = 1;
          if (issue.resolvedCount + 1 >= 2) {
            updatedStatus = "Resolved";
          }
        }

        return {
          ...issue,
          confirmationCount: issue.confirmationCount + confIncrement,
          rejectionCount: issue.rejectionCount + rejectIncrement,
          resolvedCount: issue.resolvedCount + resolvedIncrement,
          status: updatedStatus,
          trustScore: updatedTrust,
          updatedAt: new Date().toISOString()
        };
      })
    );

    // Increment points
    setUserProfile((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        points: prev.points + earnedPoints
      };
      localStorage.setItem("civicpulse_current_user", JSON.stringify(updated));
      return updated;
    });
  };

  // Maps panning coordinates state
  const [mapPanningCenter, setMapPanningCenter] = useState({ lat: 12.95568, lng: 80.14231 });
  const handleSelectIssueOnMap = (lat: number, lng: number) => {
    setMapPanningCenter({ lat, lng });
  };

  const handleSignOut = () => {
    localStorage.removeItem("civicpulse_current_user");
    setUserProfile(null);
  };

  if (!userProfile) {
    return (
      <AuthPage
        onLoginSuccess={(user) => {
          localStorage.setItem("civicpulse_current_user", JSON.stringify(user));
          setUserProfile(user);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Platform Navigation Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-50 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-indigo-600 border border-indigo-500 text-white rounded-xl select-none font-black text-xs sm:text-sm font-display flex items-center justify-center gap-1">
            <Globe className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black font-display tracking-tight text-slate-800 flex items-center gap-1.5 leading-none">
              CivicPulse <span className="text-indigo-600 underline decoration-indigo-200">AI</span>
              <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 font-sans tracking-wide">
                Community Sensor V1
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium font-sans mt-0.5">AI-Powered Community Intelligence and Issue Resolution Platform</p>
          </div>
        </div>

        {/* Small current user status panel */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-indigo-50 px-3.5 py-2 rounded-2xl border border-indigo-100 font-sans">
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs text-indigo-700 font-bold select-none">
              {userProfile.displayName ? userProfile.displayName.charAt(0) : "U"}
            </div>
            <div className="text-left font-sans">
              <p className="text-[10px] uppercase font-bold text-indigo-400">Score & Rank</p>
              <p className="text-xs font-bold text-slate-800 leading-none mt-0.5">
                {userProfile.displayName} • <span className="text-indigo-650 font-black">{userProfile.points} pts</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="p-2 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-100 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-red-500"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body with Responsive Tab Drawer & Stage views */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1720px] mx-auto w-full">
        {/* Left Nav Menu Strip */}
        <aside className="lg:w-64 bg-white border-r border-slate-200 p-4 lg:py-6 flex flex-row lg:flex-col gap-1.5 sm:gap-2 overflow-x-auto lg:overflow-x-visible shrink-0 lg:max-h-[88vh]">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full text-left px-4 py-3 rounded-2xl font-bold font-display text-xs sm:text-sm flex items-center gap-2.5 transition-all shrink-0 cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Active Incidents</span>
          </button>

          <button
            onClick={() => setActiveTab("report")}
            className={`w-full text-left px-4 py-3 rounded-2xl font-bold font-display text-xs sm:text-sm flex items-center gap-2.5 transition-all shrink-0 cursor-pointer ${
              activeTab === "report"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Become community sensor</span>
          </button>

          <button
            onClick={() => setActiveTab("hotspots")}
            className={`w-full text-left px-4 py-3 rounded-2xl font-bold font-display text-xs sm:text-sm flex items-center gap-2.5 transition-all shrink-0 cursor-pointer ${
              activeTab === "hotspots"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <Flame className="w-4 h-4 shrink-0" />
            <span>Emerging Hotspots 🔥</span>
          </button>

          <button
            onClick={() => setActiveTab("verify")}
            className={`w-full text-left px-4 py-3 rounded-2xl font-bold font-display text-xs sm:text-sm flex items-center gap-2.5 transition-all shrink-0 cursor-pointer ${
              activeTab === "verify"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Verification Feed</span>
          </button>

          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`w-full text-left px-4 py-3 rounded-2xl font-bold font-display text-xs sm:text-sm flex items-center gap-2.5 transition-all shrink-0 cursor-pointer ${
              activeTab === "leaderboard"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <Trophy className="w-4 h-4 shrink-0" />
            <span>Sensor Champions</span>
          </button>
        </aside>

        {/* View Stage Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[92vh] sm:max-h-none">
          {activeTab === "dashboard" && (
            <IssuesDashboard
              issues={issues}
              onVerifyIssue={handleVerifyIssue}
              onSelectIssueOnMap={handleSelectIssueOnMap}
              currentUserUid={userProfile.uid}
            />
          )}

          {activeTab === "report" && (
            <ReportIssue
              issues={issues}
              onAddIssue={handleAddIssue}
              currentUserUid={userProfile.uid}
              currentUserName={userProfile.displayName}
            />
          )}

          {activeTab === "hotspots" && (
            <HotspotsDashboard issues={issues} />
          )}

          {activeTab === "verify" && (
            <VerificationFeed
              issues={issues}
              currentUserUid={userProfile.uid}
              onVerifyIssue={handleVerifyIssue}
            />
          )}

          {activeTab === "leaderboard" && (
            <Leaderboard
              userPoints={userProfile.points}
              userBadge={userProfile.badge}
              userDisplayName={userProfile.displayName}
            />
          )}
        </main>
      </div>

      {/* Humble, literal footer conforming to Architecture Honesty constraints (No log telemetry/credit clutter) */}
      <footer className="bg-white border-t border-slate-200 py-4.5 px-6 shrink-0 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2 font-display">
        <span>&copy; {new Date().getFullYear()} CivicPulse AI Platform. Developed for Local Infrastructure Resolution.</span>
        <span className="flex items-center gap-1">Empowering local wards of Chengalpattu with community sensing <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse inline" /></span>
      </footer>
    </div>
  );
}
