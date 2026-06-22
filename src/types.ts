export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  points: number;
  badge: "Community Helper" | "Neighborhood Guardian" | "Civic Hero" | "City Champion";
  ward?: string;
  createdAt: string;
}

export type IssueCategory = 
  | "Pothole" 
  | "Garbage Pile" 
  | "Water Leakage" 
  | "Broken Streetlight" 
  | "Damaged Road" 
  | "Public Hazard";

export type IssueSeverity = "Low" | "Medium" | "High" | "Critical";

export type IssueStatus = 
  | "Reported" 
  | "Verified" 
  | "Assigned" 
  | "In Progress" 
  | "Resolved";

export interface Issue {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  address: string;
  landmark: string;
  ward: string;
  category: IssueCategory;
  severity: IssueSeverity;
  impactPopulation: number;
  impactSafety: string;
  impactEnvironment: string;
  duplicateOf?: string;
  routingDepartment: string;
  suggestedActions: string;
  status: IssueStatus;
  reporterId: string;
  reporterName: string;
  trustScore: number;
  confirmationCount: number;
  rejectionCount: number;
  resolvedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationVote {
  id: string;
  userId: string;
  userName: string;
  type: "confirm" | "reject" | "resolved";
  createdAt: string;
}

export interface Hotspot {
  ward: string;
  riskPercentage: number;
  primaryIssueType: string;
  trend: "increasing" | "stable" | "decreasing";
  recommendation: string;
  lastAnalysedAt: string;
}

export interface LeaderboardUser {
  rank: number;
  uid: string;
  displayName: string;
  points: number;
  badge: string;
}

export const DEFAULT_LAT = 12.95568;
export const DEFAULT_LNG = 80.14231;
