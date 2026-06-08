/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Admin' | 'Patent Officer' | 'Applicant' | 'Opposition Party';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  avatarUrl?: string;
}

export type PatentStatus = 
  | 'Submitted' 
  | 'Under Examination' 
  | 'Opposition Filed' 
  | 'Hearing Scheduled' 
  | 'Decision Pending' 
  | 'Approved' 
  | 'Rejected';

export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface PatentCase {
  id: string; // e.g. PAT-2024-0892
  title: string;
  description: string;
  applicantName: string;
  applicantOrganization: string;
  filingDate: string; // YYYY-MM-DD
  category: string; // e.g., Biotechnology, Software/AI, Quantum Processing, Chemical, Medical Device
  status: PatentStatus;
  priority: PriorityLevel;
  assignedOfficer: string; // Patent officer name
  pendingDays: number; // calculated days since filing or state change
  ipcClassification: string; // e.g. G06N 10/00
  priorityDate: string;
  abstractSummary: string;
  updatedAt: string;
}

export type OppositionStatus = 'Pending' | 'Under Review' | 'Hearing Scheduled' | 'Resolved';

export interface Opposition {
  id: string; // e.g. OP-2023-9842
  caseId: string; // target patent case ID
  opponentName: string;
  reason: string;
  detailedStatement: string;
  submissionDate: string;
  status: OppositionStatus;
  evidenceFiles: string[]; // Mock file names
}

export interface Hearing {
  id: string;
  caseId: string;
  date: string;
  time: string;
  location: string; // e.g., Courter room 3B / Virtual VC
  presidingOfficer: string;
  status: 'Scheduled' | 'Completed' | 'Adjourned';
}

export interface Document {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  category: 'Patent Application' | 'Prior Art' | 'Opposition Notice' | 'Counter Statement' | 'Hearing Notice' | 'Decision';
  caseId: string;
  status?: string; // e.g. 'Approved', 'Pending Approval'
}

export interface SystemNotification {
  id: string;
  type: 'New Opposition' | 'Hearing Scheduled' | 'Deadline Approaching' | 'Delay Alert' | 'Decision Published';
  title: string;
  description: string;
  timestamp: string;
  caseId: string;
  isRead: boolean;
  severity: 'info' | 'warning' | 'error';
}

export interface DelayAlert {
  id: string;
  caseId: string;
  patentId: string;
  title: string;
  pendingDays: number;
  severity: 'Green' | 'Yellow' | 'Orange' | 'Red';
  message: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface PomsSettings {
  maxExaminationDays: number;
  maxOppositionResponseDays: number;
  enableEmailAlerts: boolean;
  enableAutoEscalation: boolean;
  strictHCDirectiveRules: boolean;
}
