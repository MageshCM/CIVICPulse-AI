import React, { useState, useMemo } from "react";
import { Issue, IssueCategory, IssueSeverity, IssueStatus, DEFAULT_LAT, DEFAULT_LNG } from "../types";
import { Search, SlidersHorizontal, MapPin, AlertTriangle, Users, Shield, Calendar, Building, ThumbsUp, ThumbsDown, CheckCircle } from "lucide-react";
import InteractiveMap from "./InteractiveMap";

interface IssuesDashboardProps {
  issues: Issue[];
  onVerifyIssue: (issueId: string, type: "confirm" | "reject" | "resolved") => void;
  onSelectIssueOnMap: (lat: number, lng: number) => void;
  currentUserUid: string;
}

export default function IssuesDashboard({
  issues,
  onVerifyIssue,
  onSelectIssueOnMap,
  currentUserUid,
}: IssuesDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  // Filter & sort categories
  const categories = ["All", "Pothole", "Garbage Pile", "Water Leakage", "Broken Streetlight", "Damaged Road", "Public Hazard"];
  const severities = ["All", "Low", "Medium", "High", "Critical"];
  const statuses = ["All", "Reported", "Verified", "Assigned", "In Progress", "Resolved"];

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch = 
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.landmark.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === "All" || issue.category === selectedCategory;
      const matchesSeverity = selectedSeverity === "All" || issue.severity === selectedSeverity;
      const matchesStatus = selectedStatus === "All" || issue.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
    });
  }, [issues, searchTerm, selectedCategory, selectedSeverity, selectedStatus]);

  const stats = useMemo(() => {
    const total = issues.length;
    const critical = issues.filter(i => i.severity === "Critical").length;
    const resolved = issues.filter(i => i.status === "Resolved").length;
    const avgTrust = total > 0 ? Math.round(issues.reduce((acc, current) => acc + current.trustScore, 0) / total) : 0;
    return { total, critical, resolved, avgTrust };
  }, [issues]);

  return (
    <div className="space-y-6">
      {/* Platform Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium font-sans">Active Incidents</p>
            <p className="text-xl font-bold font-display ml-1">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium font-sans">Critical Hazards</p>
            <p className="text-xl font-bold font-display text-red-600 ml-1">{stats.critical}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium font-sans">Resolved Issues</p>
            <p className="text-xl font-bold font-display text-green-600 ml-1">{stats.resolved}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium font-sans">Avg Trust Score</p>
            <p className="text-xl font-bold font-display text-indigo-650 ml-1">{stats.avgTrust}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Filter and Issue Lists */}
        <div className="lg:col-span-4 space-y-4 max-h-[85vh] lg:overflow-y-auto pr-1">
          {/* Search bar & Filter summary toggler */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search description, address, or landmark..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-650 font-sans">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                <span>Filters & Ward Classification</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Severity</label>
                  <select
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {severities.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Issues list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reports ({filteredIssues.length})</p>
              {filteredIssues.length === 0 && <span className="text-xs text-slate-400 font-medium">None match</span>}
            </div>

            {filteredIssues.map((issue) => {
              const severityStyles = {
                Critical: "bg-red-50 text-red-700 border-red-100",
                High: "bg-orange-50 text-orange-700 border-orange-100",
                Medium: "bg-amber-50 text-amber-700 border-amber-100",
                Low: "bg-slate-50 text-slate-700 border-slate-100",
              }[issue.severity];

              const isPicked = activeIssue?.id === issue.id;

              return (
                <div
                  key={issue.id}
                  onClick={() => {
                    setActiveIssue(issue);
                    onSelectIssueOnMap(issue.latitude, issue.longitude);
                  }}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isPicked 
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/15" 
                      : "bg-white border-slate-200 hover:border-slate-350 text-slate-800 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                      isPicked ? "bg-indigo-500 text-indigo-100 border-indigo-400" : severityStyles
                    }`}>
                      {issue.severity}
                    </span>
                    <span className={`text-[10px] font-mono ${isPicked ? "text-indigo-200" : "text-slate-500"}`}>
                      {issue.ward}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold font-display mt-2 line-clamp-1">{issue.title}</h4>
                  <p className={`text-xs mt-1 line-clamp-2 ${isPicked ? "text-indigo-100" : "text-slate-600"}`}>
                    {issue.description}
                  </p>

                  <div className={`mt-3 pt-3 border-t text-[10px] flex items-center justify-between ${
                    isPicked ? "border-indigo-500 text-indigo-200" : "border-slate-100 text-slate-400"
                  }`}>
                    <span>Trust Score: <strong className={isPicked ? "text-amber-300" : "text-indigo-600"}>{issue.trustScore}%</strong></span>
                    <span>{issue.confirmationCount} confirm • {issue.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Map & Selected Issue Expanded Details */}
        <div className="lg:col-span-8 space-y-4">
          {/* Map Display */}
          <InteractiveMap
            issues={filteredIssues}
            center={activeIssue ? { lat: activeIssue.latitude, lng: activeIssue.longitude } : { lat: DEFAULT_LAT, lng: DEFAULT_LNG }}
            onSelectLocation={(lat, lng) => console.log("Selected point on dashboard map", lat, lng)}
            selectedLocation={activeIssue ? { lat: activeIssue.latitude, lng: activeIssue.longitude } : null}
            interactive={false}
          />

          {/* Active Issue Details Panel */}
          {activeIssue ? (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-8 shadow-sm text-left grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full border border-indigo-100">
                      {activeIssue.category}
                    </span>
                    <span className="text-xs font-mono bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                      {activeIssue.ward} • {activeIssue.status}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      activeIssue.severity === "Critical" ? "bg-red-50 text-red-700 border-red-100" :
                      activeIssue.severity === "High" ? "bg-orange-50 text-orange-700 border-orange-100" :
                      activeIssue.severity === "Medium" ? "bg-amber-50 text-amber-700 border-amber-100" :
                      "bg-slate-50 text-slate-650 border-slate-200"
                    }`}>
                      {activeIssue.severity} Severity
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-display text-slate-900 mt-3">{activeIssue.title}</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{activeIssue.description}</p>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex items-start gap-2 text-xs text-slate-605">
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">Address Location</p>
                      <p className="text-slate-500">{activeIssue.address}</p>
                      {activeIssue.landmark && <p className="text-indigo-600 font-medium mt-0.5">Landmark: {activeIssue.landmark}</p>}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-slate-605">
                    <Building className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">Assigned Public Routing</p>
                      <p className="text-slate-550 font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded inline-block mt-0.5">
                        {activeIssue.routingDepartment}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-slate-550">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-400">Reported by {activeIssue.reporterName} on {new Date(activeIssue.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Gemini Recommendation Details */}
                <div className="bg-indigo-50 border border-indigo-100/60 p-5 rounded-2xl space-y-1.5 shadow-sm">
                  <p className="text-xs font-black text-indigo-850 uppercase tracking-widest font-sans flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-600 inline-block" />
                    Gemini AI Resolution Recommendation & Diagnosis
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed italic">"{activeIssue.suggestedActions}"</p>
                  <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] text-slate-500">
                    <div>Affected Target: <strong>~{activeIssue.impactPopulation} citizens</strong></div>
                    <div>Safety Risk: <strong className="text-indigo-600">{activeIssue.impactSafety}</strong></div>
                  </div>
                </div>

                {/* Community Verification Actions for Visitors (Excluding Author) */}
                {activeIssue.reporterId !== currentUserUid ? (
                  <div className="border-t border-slate-150 pt-4 space-y-2">
                    <p className="text-xs font-semibold text-slate-700">Citizen Verification: Confirm, reject, or mark as resolved</p>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => onVerifyIssue(activeIssue.id, "confirm")}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-850 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-indigo-100 cursor-pointer"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Confirm exists (+5 points)</span>
                      </button>

                      <button
                        onClick={() => onVerifyIssue(activeIssue.id, "reject")}
                        className="bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-red-100 cursor-pointer"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>Flag False Report (+5 points)</span>
                      </button>

                      <button
                        onClick={() => onVerifyIssue(activeIssue.id, "resolved")}
                        className="bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-green-100 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm resolved (+20 points)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-450 italic bg-slate-50 p-3.5 rounded-xl border border-slate-205">
                    This is your reported issue. Other nearby citizens can verify it on their feeds to raise the trust score!
                  </div>
                )}
              </div>

              {/* Photo Evidence visual column */}
              <div className="md:col-span-5 h-[240px] md:h-auto rounded-2xl overflow-hidden border border-slate-200 relative group shadow-sm">
                {activeIssue.imageUrl ? (
                  <img
                    src={activeIssue.imageUrl}
                    alt={activeIssue.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex flex-col justify-center items-center gap-2 p-5 text-center">
                    <AlertTriangle className="w-10 h-10 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">No Image Evidence</p>
                      <p className="text-[10px] text-slate-450 mt-0.5">This complaint was filed with voice/text description and exact coordinates.</p>
                    </div>
                  </div>
                )}
                {/* Overlay details */}
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-md text-[10px] text-white font-mono flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Trust Score: {activeIssue.trustScore}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-[2rem] p-10 text-center border-2 border-dashed border-slate-200">
              <MapPin className="w-12 h-12 text-slate-400 mx-auto select-none stroke-[1.5]" />
              <h3 className="text-sm font-semibold text-slate-800 mt-2.5 font-display">No Issue Selected</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-sans leading-relaxed">
                Click on any reported issue in the left panel list, or explore coordinates on our Ward Map to examine active repair statuses, AI recommendations, and diagnostics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
