/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { 
  User, 
  UserRole, 
  PatentCase, 
  Opposition, 
  Hearing, 
  Document, 
  SystemNotification, 
  AuditLog, 
  PomsSettings,
  PatentStatus,
  PriorityLevel
} from './types';

// Supported initial user accounts to switch between for evaluation
export const MOCK_USERS: User[] = [
  {
    id: 'U-01',
    name: 'Admin User',
    email: 'admin.poms@ipindia.gov.in',
    role: 'Admin',
    organization: 'Indian Patent Intellectual Property Office',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'U-02',
    name: 'Dr. Helena Vance',
    email: 'h.vance@ipindia.gov.in',
    role: 'Patent Officer',
    organization: 'Patent Examination Division',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'U-03',
    name: 'Sarah Miller',
    email: 's.miller@neuralq.com',
    role: 'Applicant',
    organization: 'Neural-Q Systems International Ltd.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'U-04',
    name: 'Robert Chen',
    email: 'r.chen@smartpharma.com',
    role: 'Opposition Party',
    organization: 'Omni-Pharma Quantum Res.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  }
];

export interface PomsState {
  currentUser: User;
  users: User[];
  cases: PatentCase[];
  oppositions: Opposition[];
  hearings: Hearing[];
  documents: Document[];
  notifications: SystemNotification[];
  auditLogs: AuditLog[];
  settings: PomsSettings;
  searchQuery: string;
  
  // Backend connection state
  isBackendConnected: boolean;
  token: string | null;

  // Actions
  initialize: () => Promise<void>;
  setCurrentUser: (userId: string) => Promise<void>;
  addUser: (user: User) => Promise<void>;
  setSearchQuery: (query: string) => void;
  
  // Case Actions
  addCase: (newCase: Omit<PatentCase, 'pendingDays' | 'updatedAt'>) => Promise<void>;
  updateCase: (caseId: string, updatedFields: Partial<PatentCase>) => Promise<void>;
  deleteCase: (caseId: string) => Promise<void>;

  // Opposition Actions
  addOpposition: (newOpposition: Omit<Opposition, 'id' | 'submissionDate'>) => Promise<void>;
  updateOpposition: (oppositionId: string, updatedFields: Partial<Opposition>) => Promise<void>;

  // Hearing Actions
  scheduleHearing: (hearing: Omit<Hearing, 'id'>) => Promise<void>;
  updateHearing: (hearingId: string, updatedFields: Partial<Hearing>) => Promise<void>;

  // Document Actions
  addDocument: (doc: Omit<Document, 'id' | 'uploadedAt' | 'uploadedBy'>) => Promise<void>;
  deleteDocument: (docId: string) => Promise<void>;

  // Notification Actions
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  addNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp' | 'isRead'>) => Promise<void>;

  // Settings Actions
  updateSettings: (settings: Partial<PomsSettings>) => Promise<void>;
}

const STORAGE_KEY = 'POMS_DATASYSTEM_STATE';
const API_URL = '/api'; // Handled via Vite proxy in development or relative path in Docker production

// Safe wrapper for API calls
async function apiRequest(endpoint: string, method: string = 'GET', body?: any, token?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

const getInitialState = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved POMS state', e);
      }
    }
  }

  // Baseline seeds
  const initialCases: PatentCase[] = [
    {
      id: 'PAT-2024-0892',
      title: 'Quantum Computing Logic Gate Optimization via Topological Entanglement',
      description: 'Method and apparatus for optimizing logic gate distribution within a quantum processing unit. Utilizing topological error correction and specific entanglement patterns to reduce decoherence rates during multi-qubit operations.',
      applicantName: 'Sarah Miller',
      applicantOrganization: 'Neural-Q Systems International Ltd.',
      filingDate: '2026-04-04',
      category: 'Quantum Processing',
      status: 'Opposition Filed',
      priority: 'High',
      assignedOfficer: 'Dr. Helena Vance',
      pendingDays: 65,
      ipcClassification: 'G06N 10/00; H03K 19/00',
      priorityDate: '2023-01-14',
      abstractSummary: 'Optimizes qubit gate mapping layout structures by constructing topographically sound braided circuits supporting fast fault-tolerant logic execution.',
      updatedAt: '2026-06-05'
    },
    {
      id: 'US-102948-B2',
      title: 'Adaptive Neural Network for Quantum Processing Units',
      description: 'A reinforcement learning network implemented on-chip to dynamically calibration superconducting qubits and balance cryo-controller workloads.',
      applicantName: 'DeepFlow Systems Inc.',
      applicantOrganization: 'DeepFlow Systems Inc.',
      filingDate: '2026-05-27',
      category: 'Software / AI',
      status: 'Opposition Filed',
      priority: 'High',
      assignedOfficer: 'Dr. Helena Vance',
      pendingDays: 12,
      ipcClassification: 'G06N 3/04; H03K 17/00',
      priorityDate: '2023-10-12',
      abstractSummary: 'Uses secondary calibration layers feedback loops to stabilize decoherence limits dynamically.',
      updatedAt: '2026-06-01'
    },
    {
      id: 'EP-485921-A1',
      title: 'Biodegradable Polymer Synthesis and Rapid Curing Method',
      description: 'Environmentally safe biocompatible polymer formulated from sustainable starch and lactic structures engineered for surgical implants.',
      applicantName: 'BioLab Europe Ltd.',
      applicantOrganization: 'BioLab Europe Ltd.',
      filingDate: '2026-04-24',
      category: 'Chemical Engineering',
      status: 'Under Examination',
      priority: 'Medium',
      assignedOfficer: 'Dr. Helena Vance',
      pendingDays: 45,
      ipcClassification: 'C08G 63/06; A61L 31/06',
      priorityDate: '2024-01-05',
      abstractSummary: 'A novel esterification cascade minimizing volatile auxiliary plasticizer byproducts while maintaining high mechanical structural load yield.',
      updatedAt: '2026-05-15'
    },
    {
      id: 'CN-930412-Z',
      title: 'Graphene-based Battery Architecture with Solid State Electrolyte',
      description: 'Super-dense battery anode configuration with silicon-graphene hybrid whiskers suspended in static lithium salt matrix.',
      applicantName: 'NxtGen Power Corp.',
      applicantOrganization: 'NxtGen Power Corp.',
      filingDate: '2026-01-15',
      category: 'Energy Storage',
      status: 'Submitted',
      priority: 'Low',
      assignedOfficer: 'Unassigned',
      pendingDays: 145,
      ipcClassification: 'H01M 10/0562; H01M 4/36',
      priorityDate: '2024-03-22',
      abstractSummary: 'A dynamic micro-bento composite layered mesh shielding dendritic breakthrough propagation during fast 10C charge states.',
      updatedAt: '2026-01-15'
    }
  ];

  const initialOppositions: Opposition[] = [
    {
      id: 'OP-2023-9842',
      caseId: 'US-102948-B2',
      opponentName: 'TechGlobal Dynamics Inc.',
      reason: 'Lack of Novelty',
      detailedStatement: 'The claim around Reinforcement Learning-based dynamic superconducting calibration is fully anticipated by TechGlobal patent portfolio 442-A published in 2022.',
      submissionDate: '2026-05-28',
      status: 'Pending',
      evidenceFiles: ['Prior_Art_Conflict_US442.pdf']
    }
  ];

  return {
    currentUser: MOCK_USERS[0],
    users: MOCK_USERS,
    cases: initialCases,
    oppositions: initialOppositions,
    hearings: [],
    documents: [],
    notifications: [],
    auditLogs: [],
    settings: {
      maxExaminationDays: 30,
      maxOppositionResponseDays: 30,
      enableEmailAlerts: true,
      enableAutoEscalation: true,
      strictHCDirectiveRules: true
    },
    searchQuery: '',
    isBackendConnected: false,
    token: null
  };
};

const saveStateToLocalStorage = (state: Partial<PomsState>) => {
  if (typeof window !== 'undefined') {
    const dataToSave = {
      currentUser: state.currentUser,
      users: state.users,
      cases: state.cases,
      oppositions: state.oppositions,
      hearings: state.hearings,
      documents: state.documents,
      notifications: state.notifications,
      auditLogs: state.auditLogs,
      settings: state.settings,
      searchQuery: state.searchQuery
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }
};

export const usePomsStore = create<PomsState>((set, get) => {
  const initial = getInitialState();

  return {
    ...initial,

    initialize: async () => {
      try {
        const token = localStorage.getItem('POMS_JWT_TOKEN');
        
        // Fetch dashboard analytics
        const dashboardData = await apiRequest('/analytics/dashboard', 'GET', undefined, token);
        const notifications = await apiRequest('/notifications', 'GET', undefined, token).catch(() => []);

        set({
          isBackendConnected: true,
          token,
          cases: dashboardData.cases || [],
          oppositions: dashboardData.oppositions || [],
          hearings: dashboardData.upcomingHearings || [],
          notifications: notifications || [],
          auditLogs: dashboardData.auditLogs || []
        });

        // Set matching backend user context
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const matchedUser = get().users.find(u => u.email === payload.email);
          if (matchedUser) {
            set({ currentUser: matchedUser });
          }
        }
      } catch (e) {
        console.warn('POMS: Backend not running or unreachable. Standard localStorage mode active.');
        set({ isBackendConnected: false });
      }
    },

    setCurrentUser: async (userId: string) => {
      const targetUser = get().users.find(u => u.id === userId);
      if (!targetUser) return;

      if (get().isBackendConnected) {
        try {
          const authData = await apiRequest('/auth/login', 'POST', {
            email: targetUser.email,
            password: 'password123'
          });

          localStorage.setItem('POMS_JWT_TOKEN', authData.token);
          set({
            currentUser: targetUser,
            token: authData.token
          });

          // Fetch fresh data for the authenticated role
          await get().initialize();
          return;
        } catch (error) {
          console.error('Failed role authentication sync on backend:', error);
        }
      }

      // Local mock switcher fallback
      const log: AuditLog = {
        id: `AL-${Date.now()}`,
        userId: targetUser.id,
        userName: targetUser.name,
        userRole: targetUser.role,
        action: 'User Authenticated',
        details: `Role switched to ${targetUser.role} (${targetUser.name}) [Offline Mode]`,
        timestamp: new Date().toISOString()
      };

      set(state => {
        const updated = { 
          currentUser: targetUser, 
          auditLogs: [log, ...state.auditLogs] 
        };
        saveStateToLocalStorage({ ...state, ...updated });
        return updated;
      });
    },

    addUser: async (user: User) => {
      set(state => {
        const updated = { users: [...state.users, user] };
        saveStateToLocalStorage({ ...state, ...updated });
        return updated;
      });
    },

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
    },

    addCase: async (newCase) => {
      if (get().isBackendConnected) {
        try {
          await apiRequest('/cases', 'POST', newCase, get().token);
          await get().initialize();
          return;
        } catch (e) {
          console.error('Failed to create case on backend:', e);
        }
      }

      // Local fallback
      const added: PatentCase = {
        ...newCase,
        pendingDays: 1,
        updatedAt: new Date().toISOString().split('T')[0]
      };

      const log: AuditLog = {
        id: `AL-${Date.now()}`,
        userId: get().currentUser.id,
        userName: get().currentUser.name,
        userRole: get().currentUser.role,
        action: 'Case Created',
        details: `Created new Patent ID: ${added.id} - ${added.title} [Offline Mode]`,
        timestamp: new Date().toISOString()
      };

      const notification: SystemNotification = {
        id: `N-${Date.now()}`,
        type: 'Deadline Approaching',
        title: 'New Case Filing Registered',
        description: `Case ${added.id} has been registered securely near the pre-grant compliance logs.`,
        timestamp: 'Just now',
        caseId: added.id,
        isRead: false,
        severity: 'info'
      };

      set(state => {
        const updated = {
          cases: [added, ...state.cases],
          auditLogs: [log, ...state.auditLogs],
          notifications: [notification, ...state.notifications]
        };
        saveStateToLocalStorage({ ...state, ...updated });
        return updated;
      });
    },

    updateCase: async (caseId, updatedFields) => {
      if (get().isBackendConnected) {
        try {
          await apiRequest(`/cases/${caseId}`, 'PUT', updatedFields, get().token);
          await get().initialize();
          return;
        } catch (e) {
          console.error('Failed to update case on backend:', e);
        }
      }

      // Local fallback
      const logDetails = Object.keys(updatedFields).map(key => `${key} changed`).join(', ');
      const audit: AuditLog = {
        id: `AL-${Date.now()}`,
        userId: get().currentUser.id,
        userName: get().currentUser.name,
        userRole: get().currentUser.role,
        action: 'Case Updated',
        details: `Updated ${caseId}: ${logDetails} [Offline Mode]`,
        timestamp: new Date().toISOString()
      };

      set(state => {
        const updatedCases = state.cases.map(c => 
          c.id === caseId 
            ? { ...c, ...updatedFields, updatedAt: new Date().toISOString().split('T')[0] } 
            : c
        );

        const updated = {
          cases: updatedCases,
          auditLogs: [audit, ...state.auditLogs]
        };
        saveStateToLocalStorage({ ...state, ...updated });
        return updated;
      });
    },

    deleteCase: async (caseId) => {
      if (get().isBackendConnected) {
        try {
          await apiRequest(`/cases/${caseId}`, 'DELETE', undefined, get().token);
          await get().initialize();
          return;
        } catch (e) {
          console.error('Failed to delete case on backend:', e);
        }
      }

      // Local fallback
      const audit: AuditLog = {
        id: `AL-${Date.now()}`,
        userId: get().currentUser.id,
        userName: get().currentUser.name,
        userRole: get().currentUser.role,
        action: 'Case Removed',
        details: `Deleted Patent ID: ${caseId} [Offline Mode]`,
        timestamp: new Date().toISOString()
      };

      set(state => {
        const updated = {
          cases: state.cases.filter(c => c.id !== caseId),
          auditLogs: [audit, ...state.auditLogs]
        };
        saveStateToLocalStorage({ ...state, ...updated });
        return updated;
      });
    },

    addOpposition: async (newOpposition) => {
      if (get().isBackendConnected) {
        try {
          await apiRequest('/oppositions', 'POST', newOpposition, get().token);
          await get().initialize();
          return;
        } catch (e) {
          console.error('Failed to file opposition on backend:', e);
        }
      }

      // Local fallback
      const added: Opposition = {
        ...newOpposition,
        id: `OP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        submissionDate: new Date().toISOString().split('T')[0]
      };

      const audit: AuditLog = {
        id: `AL-${Date.now()}`,
        userId: get().currentUser.id,
        userName: get().currentUser.name,
        userRole: get().currentUser.role,
        action: 'Opposition Filed',
        details: `Opposition ${added.id} registered on case ${added.caseId} by ${added.opponentName} [Offline Mode]`,
        timestamp: new Date().toISOString()
      };

      const notification: SystemNotification = {
        id: `N-${Date.now()}`,
        type: 'New Opposition',
        title: 'New pre-grant opposition filed',
        description: `${added.opponentName} submitted a pre-grant opposition for case ${added.caseId} citing: ${added.reason}.`,
        timestamp: 'Just now',
        caseId: added.caseId,
        isRead: false,
        severity: 'warning'
      };

      set(state => {
        const updatedCases = state.cases.map(c => 
          c.id === added.caseId ? { ...c, status: 'Opposition Filed' as PatentStatus } : c
        );

        const updated = {
          oppositions: [added, ...state.oppositions],
          cases: updatedCases,
          auditLogs: [audit, ...state.auditLogs],
          notifications: [notification, ...state.notifications]
        };
        saveStateToLocalStorage({ ...state, ...updated });
        return updated;
      });
    },

    updateOpposition: async (oppositionId, updatedFields) => {
      if (get().isBackendConnected) {
        try {
          await apiRequest(`/oppositions/${oppositionId}`, 'PUT', updatedFields, get().token);
          await get().initialize();
          return;
        } catch (e) {
          console.error('Failed to update opposition on backend:', e);
        }
      }

      set(state => {
        const updated = {
          oppositions: state.oppositions.map(ops => 
            ops.id === oppositionId ? { ...ops, ...updatedFields } : ops
          )
        };
        saveStateToLocalStorage({ ...state, ...updated });
        return updated;
      });
    },

    scheduleHearing: async (hearing) => {
      if (get().isBackendConnected) {
        try {
          // We can use the standard updateCase API endpoint on backend to update the status to hearing scheduled
          const freshHearing = await apiRequest(`/cases/${hearing.caseId}`, 'PUT', { status: 'Hearing Scheduled' }, get().token);
          await get().initialize();
          return;
        } catch (e) {
          console.error('Failed to schedule hearing on backend:', e);
        }
      }

      // Local fallback
      const added: Hearing = {
        ...hearing,
        id: `H-026-${Math.floor(100 + Math.random() * 900)}`
      };

      const audit: AuditLog = {
        id: `AL-${Date.now()}`,
        userId: get().currentUser.id,
        userName: get().currentUser.name,
        userRole: get().currentUser.role,
        action: 'Hearing Scheduled',
        details: `Scheduled opposition hearing for case ${added.caseId} on ${added.date} at ${added.time} [Offline Mode]`,
        timestamp: new Date().toISOString()
      };

      const notification: SystemNotification = {
        id: `N-${Date.now()}`,
        type: 'Hearing Scheduled',
        title: 'Opposition dispute hearing scheduled',
        description: `Hearing set for case ${added.caseId} on ${added.date} at ${added.time} room: ${added.location}`,
        timestamp: 'Just now',
        caseId: added.caseId,
        isRead: false,
        severity: 'info'
      };

      set(state => {
        const updatedCases = state.cases.map(c => 
          c.id === added.caseId ? { ...c, status: 'Hearing Scheduled' as PatentStatus } : c
        );

        const updated = {
          hearings: [added, ...state.hearings],
          cases: updatedCases,
          auditLogs: [audit, ...state.auditLogs],
          notifications: [notification, ...state.notifications]
        };
        saveStateToLocalStorage({ ...state, ...updated });
        return updated;
      });
    },

    updateHearing: async (hearingId, updatedFields) => {
      set(state => {
        const updated = {
          hearings: state.hearings.map(h => 
            h.id === hearingId ? { ...h, ...updatedFields } : h
          )
        };
        saveStateToLocalStorage({ ...state, ...updated });
        return updated;
      });
    },

    addDocument: async (doc) => {
      const added: Document = {
        ...doc,
        id: `D-${Date.now()}`,
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: get().currentUser.name
      };

      const audit: AuditLog = {
        id: `AL-${Date.now()}`,
        userId: get().currentUser.id,
        userName: get().currentUser.name,
        userRole: get().currentUser.role,
        action: 'Document Uploaded',
        details: `Uploaded ${added.name} under category ${added.category} [Offline Mode]`,
        timestamp: new Date().toISOString()
      };

      set(state => {
        const updated = {
          documents: [added, ...state.documents],
          auditLogs: [audit, ...state.auditLogs]
        };
        saveStateToLocalStorage({ ...state, ...updated });
        return updated;
      });
    },

    deleteDocument: async (docId) => {
      set(state => {
        const updated = {
          documents: state.documents.filter(d => d.id !== docId)
        };
        saveStateToLocalStorage({ ...state, ...updated });
        return updated;
      });
    },

    markNotificationAsRead: async (notificationId) => {
      if (get().isBackendConnected) {
        try {
          await apiRequest(`/notifications/${notificationId}/read`, 'POST', undefined, get().token);
          await get().initialize();
          return;
        } catch (e) {
          console.error('Failed to mark notification as read on backend:', e);
        }
      }

      set(state => {
        const updated = {
          notifications: state.notifications.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        };
        saveStateToLocalStorage({ ...state, ...updated });
        return updated;
      });
    },

    markAllNotificationsAsRead: async () => {
      if (get().isBackendConnected) {
        try {
          await apiRequest('/notifications/read', 'POST', undefined, get().token);
          await get().initialize();
          return;
        } catch (e) {
          console.error('Failed to mark all notifications as read on backend:', e);
        }
      }

      set(state => {
        const updated = {
          notifications: state.notifications.map(n => ({ ...n, isRead: true }))
        };
        saveStateToLocalStorage({ ...state, ...updated });
        return updated;
      });
    },

    addNotification: async (noti) => {
      const added: SystemNotification = {
        ...noti,
        id: `N-${Date.now()}`,
        timestamp: 'Just now',
        isRead: false
      };

      set(state => {
        const updated = {
          notifications: [added, ...state.notifications]
        };
        saveStateToLocalStorage({ ...state, ...updated });
        return updated;
      });
    },

    updateSettings: async (newSettings) => {
      set(state => {
        const updated = { settings: { ...state.settings, ...newSettings } };
        saveStateToLocalStorage({ ...state, ...updated });
        return updated;
      });
    }
  };
});
