import React, { useState } from "react";
import { LeaderboardUser } from "../types";
import { Award, Trophy, Users, Star, Calendar, Zap, Shield, ArrowUp } from "lucide-react";
import { mockLeaderboard } from "../data/mockData";

interface LeaderboardProps {
  userPoints: number;
  userBadge: string;
  userDisplayName: string;
}

export default function Leaderboard({
  userPoints,
  userBadge,
  userDisplayName,
}: LeaderboardProps) {
  const [boardType, setBoardType] = useState<"weekly" | "monthly">("monthly");

  // Dynamically inject active user stats into leaderboard rendering
  const activeLeaderboard: LeaderboardUser[] = React.useMemo(() => {
    const list = [...mockLeaderboard];
    const userIndex = list.findIndex(u => u.displayName === userDisplayName || u.uid === "user1");

    if (userIndex !== -1) {
      list[userIndex] = {
        ...list[userIndex],
        points: userPoints,
        badge: userBadge
      };
    } else {
      // Create user profile in list
      list.push({
        rank: list.length + 1,
        uid: "user_active",
        displayName: userDisplayName,
        points: userPoints,
        badge: userBadge
      });
    }

    // Recalculate sorted rankings
    return list
      .sort((a, b) => b.points - a.points)
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));
  }, [userPoints, userBadge, userDisplayName]);

  // Points mapping for next badge milestone
  const milestoneConfig = React.useMemo(() => {
    if (userPoints < 100) {
      return { next: "Neighborhood Guardian", target: 100, remaining: 100 - userPoints, icon: "🥈" };
    } else if (userPoints < 250) {
      return { next: "Civic Hero", target: 250, remaining: 250 - userPoints, icon: "🥇" };
    } else if (userPoints < 400) {
      return { next: "City Champion", target: 400, remaining: 400 - userPoints, icon: "🏆" };
    } else {
      return { next: "Ultimate Legend", target: 1000, remaining: 1000 - userPoints, icon: "👑" };
    }
  }, [userPoints]);

  const percentageToNextMilestone = Math.min(
    100,
    Math.round((userPoints / milestoneConfig.target) * 100)
  );

  return (
    <div className="space-y-6 text-left">
      {/* Gamification Profile Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 text-white p-6 sm:p-8 rounded-[2rem] border border-indigo-800 shadow-xl">
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded-2xl select-none text-2xl">
              {userBadge === "Community Helper" ? "🥉" :
               userBadge === "Neighborhood Guardian" ? "🥈" :
               userBadge === "Civic Hero" ? "🥇" : "🏆"}
            </div>
            
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest font-mono">My Standing Tier</span>
              <h4 className="text-base font-bold font-display uppercase tracking-wide">{userBadge}</h4>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wider font-sans">Accumulated Sensor Score</span>
            <p className="text-3xl font-black font-mono text-indigo-300 mt-1">{userPoints} <span className="text-xs font-sans text-slate-400 font-medium">Earned Points</span></p>
          </div>

          <div className="border-t border-indigo-800/80 pt-3 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-amber-500 shrink-0" /> Weekly Streaks: 5 Days</span>
            <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-indigo-400 shrink-0" /> Verifications: Done</span>
          </div>
        </div>

        {/* Badge Progress section */}
        <div className="md:col-span-7 flex flex-col justify-center border-t md:border-t-0 md:border-l border-indigo-800/80 pt-6 md:pt-0 md:pl-6 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 font-sans">Badge Progress to {milestoneConfig.icon} {milestoneConfig.next}</span>
              <span className="font-mono text-indigo-300 font-bold">{userPoints}/{milestoneConfig.target} pts</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-indigo-950/20">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                style={{ width: `${percentageToNextMilestone}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            Report local pothole issues, water pipeline leakage bursts (+10 points), verify existing active reports (+5 points), or confirm municipal solutions (+20 points) to unlock high-ranking badges. Earn <strong>{milestoneConfig.remaining} more points</strong> to reach <strong className="text-white">{milestoneConfig.next}</strong> status!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Badge Showcase */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Award className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
            <span className="text-xs font-bold text-slate-650 uppercase tracking-widest font-sans">Badge Achievements</span>
          </div>

          <div className="space-y-3">
            <div className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-opacity ${
              userPoints >= 0 ? "bg-slate-50 border-slate-150 opacity-100" : "bg-slate-50 border-slate-100 opacity-40 select-none"
            }`}>
              <div className="text-xl">🥉</div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 font-display">Community Helper</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">Unlocked instantly at 0 registered points.</p>
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-opacity ${
              userPoints >= 100 ? "bg-slate-50 border-slate-150 opacity-100" : "bg-slate-50 border-slate-100 opacity-40 select-none"
            }`}>
              <div className="text-xl">🥈</div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 font-display">Neighborhood Guardian</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">Unlocked at 100 accumulated points.</p>
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-opacity ${
              userPoints >= 250 ? "bg-slate-50 border-slate-150 opacity-100" : "bg-slate-50 border-slate-100 opacity-40 select-none"
            }`}>
              <div className="text-xl">🥇</div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 font-display">Civic Hero</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">Unlocked at 250 accumulated points.</p>
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-opacity ${
              userPoints >= 400 ? "bg-slate-50 border-slate-155 opacity-100" : "bg-slate-50 border-slate-100 opacity-40 select-none"
            }`}>
              <div className="text-xl">🏆</div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 font-display">City Champion</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">Unlocked at 400 accumulated points.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Leaderboard list */}
        <div className="lg:col-span-8 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3.5 gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4.5 h-4.5 text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-slate-655 uppercase tracking-widest font-sans">Chennai Civic Leaderboard</span>
            </div>
            
            {/* Switcheable toggles */}
            <div className="bg-slate-50 p-1 rounded-xl border border-slate-200 flex self-start sm:self-auto">
              <button
                onClick={() => setBoardType("weekly")}
                className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer ${
                  boardType === "weekly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-605"
                }`}
              >
                Weekly Frame
              </button>
              <button
                onClick={() => setBoardType("monthly")}
                className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer ${
                  boardType === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-605"
                }`}
              >
                Monthly Frame
              </button>
            </div>
          </div>

          {/* List display */}
          <div className="divide-y divide-slate-100">
            {activeLeaderboard.map((champ, index) => {
              const isCurrentUser = champ.uid === "user1" || champ.displayName === userDisplayName;
              const placeHighlight = index === 0 ? "text-amber-500 text-lg" : index === 1 ? "text-slate-400" : index === 2 ? "text-amber-700" : "text-slate-400";

              return (
                <div 
                  key={champ.uid} 
                  className={`py-3 flex items-center justify-between gap-2 text-xs ${
                    isCurrentUser ? "bg-indigo-50/40 -mx-6 px-6" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 font-mono font-bold text-center ${placeHighlight}`}>
                      {index + 1}
                    </span>
                    <div>
                      <h6 className={`font-semibold font-sans flex items-center gap-1.5 ${isCurrentUser ? "text-indigo-800 font-bold" : "text-slate-800"}`}>
                        {champ.displayName}
                        {isCurrentUser && <span className="text-[9px] bg-indigo-120 bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-sans tracking-wide">Me</span>}
                      </h6>
                      <p className="text-[10px] text-slate-400 font-sans mt-0.5">{champ.badge}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-850 block">{champ.points} pts</span>
                    <span className="text-[9px] text-slate-400">Total verifications</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
