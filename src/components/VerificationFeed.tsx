import React, { useState } from "react";
import { Issue } from "../types";
import { Check, CheckCircle, Flame, ShieldAlert, ArrowRight, UserCheck, Trash2, Award } from "lucide-react";

interface VerificationFeedProps {
  issues: Issue[];
  currentUserUid: string;
  onVerifyIssue: (issueId: string, type: "confirm" | "reject" | "resolved") => void;
}

export default function VerificationFeed({
  issues,
  currentUserUid,
  onVerifyIssue,
}: VerificationFeedProps) {
  // Select issues that are not reported by current user and not yet fully resolved
  const verificationQueue = issues.filter(
    (issue) => issue.reporterId !== currentUserUid && issue.status !== "Resolved"
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const activeIssue = currentIndex < verificationQueue.length ? verificationQueue[currentIndex] : null;

  const handleAction = (type: "confirm" | "reject" | "resolved") => {
    if (!activeIssue) return;
    onVerifyIssue(activeIssue.id, type);
    // Proceed to next item in the stack
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 text-left">
      <div className="text-center space-y-1.5 pb-2">
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-full uppercase tracking-wider font-sans">
          Community Validation Ledger ✅
        </span>
        <h3 className="text-xl font-bold font-display text-slate-900 mt-2">Verify Nearby Incidents</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans leading-relaxed">
          Help filter false alarms and confirm active issues. Your local verifications increase trust accuracy and award you points towards your tier badge!
        </p>
      </div>

      {activeIssue ? (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col transition-all">
          {/* Header */}
          <div className="p-5 bg-indigo-950 text-white flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-indigo-200 uppercase tracking-widest">{activeIssue.ward}</span>
              <h4 className="text-xs font-bold font-sans text-indigo-300 truncate max-w-[200px] sm:max-w-[280px]">
                {activeIssue.category} • reported by {activeIssue.reporterName}
              </h4>
            </div>
            
            <div className="bg-indigo-900 border border-indigo-800 px-2.5 rounded-md font-mono text-[10px] py-1.5 shrink-0 text-amber-400 font-semibold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
              <span>Queue: {currentIndex + 1}/{verificationQueue.length}</span>
            </div>
          </div>

          {/* Photo if exists / Description */}
          <div className="h-[220px] bg-slate-950 relative overflow-hidden shrink-0">
            {activeIssue.imageUrl ? (
              <img
                src={activeIssue.imageUrl}
                alt={activeIssue.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex flex-col justify-center items-center text-center p-6 gap-2">
                <ShieldAlert className="w-10 h-10 text-orange-500 select-none stroke-[1.5]" />
                <span className="text-xs text-slate-400 font-sans">No physical photo provided. Verify based on landmark descriptions.</span>
              </div>
            )}
            
            <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur border border-slate-800 text-[10px] text-white py-0.5 px-3 rounded-full font-mono font-semibold">
              Current Trust: {activeIssue.trustScore}%
            </div>
          </div>

          {/* Content info */}
          <div className="p-6 flex-1 space-y-4">
            <div className="space-y-1 text-slate-800">
              <h4 className="text-sm font-bold font-display uppercase tracking-wide">{activeIssue.title}</h4>
              <p className="text-xs text-slate-650 leading-relaxed font-sans">{activeIssue.description}</p>
            </div>

            <div className="bg-indigo-50/20 p-3.5 rounded-2xl border border-indigo-150/10 text-xs text-slate-600 space-y-1">
              <div>Landmark: <strong className="text-slate-800">{activeIssue.landmark}</strong></div>
              <div>Address: <span className="text-slate-505">{activeIssue.address}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-500 font-medium pb-2">
              <div>Reported: <strong className="text-slate-700">{new Date(activeIssue.createdAt).toLocaleDateString()}</strong></div>
              <div>Estimated Impact: <strong className="text-indigo-600">~{activeIssue.impactPopulation} citizens</strong></div>
            </div>

            {/* Verification buttons */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <span className="text-xs font-bold text-slate-750 uppercase tracking-wider font-sans block text-center">Verify Status</span>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <button
                  onClick={() => handleAction("confirm")}
                  className="bg-indigo-50 hover:bg-indigo-105 hover:border-indigo-200 text-indigo-750 p-3.5 rounded-2xl flex flex-col justify-center items-center gap-1 transition-colors border border-indigo-100/50 cursor-pointer"
                >
                  <Check className="w-5 h-5 text-indigo-600" />
                  <span className="text-[10px] font-bold">Still Active</span>
                  <span className="text-[9px] text-indigo-600/80 font-mono">+5 pts</span>
                </button>

                <button
                  onClick={() => handleAction("reject")}
                  className="bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 p-3.5 rounded-2xl flex flex-col justify-center items-center gap-1 transition-colors border border-red-100/50 cursor-pointer"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <span className="text-[10px] font-bold">Unrelated / False</span>
                  <span className="text-[9px] text-red-650/80 font-mono">+5 pts</span>
                </button>

                <button
                  onClick={() => handleAction("resolved")}
                  className="bg-green-50 hover:bg-green-105 text-green-700 hover:text-green-800 p-3.5 rounded-2xl flex flex-col justify-center items-center gap-1 transition-colors border border-green-100/50 cursor-pointer"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-[10px] font-bold">Already Fixed</span>
                  <span className="text-[9px] text-green-650/80 font-mono">+20 pts</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-10 text-center shadow-sm space-y-4">
          <Award className="w-14 h-14 text-indigo-600 mx-auto select-none stroke-[1.5]" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-800 font-display">Verification Queue Cleared! 🎉</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans leading-relaxed">
              Wonderful job! You have verified all pending citizen issues reported in nearby wards of your community. Feel free check back later when new sensor reports are compiled.
            </p>
          </div>
          <button
            onClick={() => setCurrentIndex(0)}
            className="inline-block text-xs font-bold text-indigo-700 hover:text-indigo-800 hover:bg-indigo-100 bg-indigo-50 px-5 py-3 rounded-2xl border border-indigo-100 cursor-pointer transition-colors"
          >
            Refresh Queue Feed &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
