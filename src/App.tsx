/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { usePomsStore } from './store';
import { PatentStatus, OppositionStatus, Document } from './types';

// Import our modular pages
import DashboardTab from './components/DashboardTab';
import CaseManagementTab from './components/CaseManagementTab';
import OppositionTab from './components/OppositionTab';
import CaseTrackingTab from './components/CaseTrackingTab';
import ReportsTab from './components/ReportsTab';
import AdminPanelTab from './components/AdminPanelTab';
import LandingPage from './components/LandingPage';

// Import Lucide icons
import { 
  Building, 
  UserCheck, 
  Bell, 
  Layers, 
  FolderLock, 
  Gavel, 
  FileText, 
  BarChart3, 
  ShieldAlert, 
  Cog, 
  Plus, 
  X, 
  Upload,
  User,
  ExternalLink,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function App() {
  const { 
    currentUser, 
    users, 
    setCurrentUser, 
    notifications, 
    markAllNotificationsAsRead, 
    cases, 
    oppositions, 
    addCase, 
    addOpposition,
    addNotification,
    addDocument,
    isBackendConnected,
    initialize
  } = usePomsStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('PAT-2024-0892');
  const [showLanding, setShowLanding] = useState<boolean>(true);

  // Modals Visibility
  const [isFilingModalOpen, setIsFilingModalOpen] = useState(false);
  const [isOppositionModalOpen, setIsOppositionModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Form states: New Case Register
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseApplicant, setNewCaseApplicant] = useState('');
  const [newCaseOrg, setNewCaseOrg] = useState('');
  const [newCaseIpc, setNewCaseIpc] = useState('');
  const [newCaseDescription, setNewCaseDescription] = useState('');

  // Form states: New Opposition Dispute
  const [newOppPatentId, setNewOppPatentId] = useState('PAT-2024-0892');
  const [newOppName, setNewOppName] = useState('');
  const [newOppReason, setNewOppReason] = useState('Anticipation by Prior Art');
  const [newOppStatement, setNewOppStatement] = useState('');
  const [newOppFiles, setNewOppFiles] = useState<string[]>([]);
  const [mockFileName, setMockFileName] = useState('');

  // Computed notifications indicator
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Handle Registering a new Patent
  const submitNewCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseTitle || !newCaseApplicant || !newCaseOrg) return;

    const randomizedId = `PAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Injecting into state store
    addCase({
      id: randomizedId,
      title: newCaseTitle,
      applicantName: newCaseApplicant,
      applicantOrganization: newCaseOrg,
      ipcClassification: newCaseIpc || 'G06N 10/00',
      description: newCaseDescription || 'Specification outlining advanced mechanical claim parameters and computational structures.',
      filingDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
      status: 'Submitted',
      assignedOfficer: 'Unassigned',
      category: 'Software / AI',
      priority: 'Medium',
      priorityDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
      abstractSummary: newCaseDescription || 'Specification outlining advanced mechanical claim parameters and computational structures.'
    });

    // Logging notification and logs automatic audits
    addNotification({
      type: 'Deadline Approaching',
      title: 'New Register Submitted',
      description: `Patent entry '${newCaseTitle}' has been successfully logged into the docket archive under temporary ID ${randomizedId}.`,
      caseId: randomizedId,
      severity: 'info'
    });

    // Resetting states
    setNewCaseTitle('');
    setNewCaseApplicant('');
    setNewCaseOrg('');
    setNewCaseIpc('');
    setNewCaseDescription('');
    setIsFilingModalOpen(false);

    // Auto redirection to Case List to review
    setActiveTab('Case Management');
  };

  // Handle Filing a Pre-Grant Opposition Dispute
  const submitNewOpposition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOppName || !newOppStatement) return;

    const opId = `OP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Add Opposition record to store
    addOpposition({
      caseId: newOppPatentId,
      opponentName: newOppName,
      status: 'Pending',
      reason: newOppReason,
      detailedStatement: newOppStatement,
      evidenceFiles: mockFileName ? [mockFileName] : ['Prior_Art_Anticipation_Exhibit_A.pdf']
    });

    // Change status of target patent case to 'Opposition Filed' to replicate real-world workflow
    const targetCase = cases.find(c => c.id === newOppPatentId);
    if (targetCase) {
      targetCase.status = 'Opposition Filed';
      targetCase.pendingDays = Math.max(31, targetCase.pendingDays); // Accelerate metric indicator to trigger yellow alert
    }

    // Auto-create document upload placeholder in cases docket repository
    addDocument({
      name: mockFileName || 'Prior_Art_Anticipation_Exhibit_A.pdf',
      size: '2.4 MB',
      category: 'Opposition Notice',
      caseId: newOppPatentId,
      status: 'Pending Approval'
    });

    // Trigger Notification escalation warning
    addNotification({
      type: 'Delay Alert',
      title: 'Opposition logged against patent',
      description: `Dispute ${opId} filed by ${newOppName} raises crucial ${newOppReason} claims on application ${newOppPatentId}. File flagged for review.`,
      caseId: newOppPatentId,
      severity: 'warning'
    });

    // Reset forms
    setNewOppName('');
    setNewOppStatement('');
    setMockFileName('');
    setIsOppositionModalOpen(false);

    // Redirect to Oppositions List to review
    setSelectedCaseId(newOppPatentId);
    setActiveTab('Opposition Management');
  };

  if (showLanding) {
    return <LandingPage onEnterPortal={(startingTab) => { if (startingTab) setActiveTab(startingTab); setShowLanding(false); }} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-[#0F172A] selection:text-white">
      
      {/* Visual top indicator trim matching national Indian/Delhi regulatory palette (Saffron, White, Green) */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-white to-emerald-500 shrink-0" />

      {/* Official Government Header Row */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Mock Emblem insignia seal */}
          <div className="w-10 h-10 bg-[#0F172A] rounded flex items-center justify-center font-bold text-white tracking-widest text-[#FFFDF4] text-xs">
            PMO
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider font-mono flex items-center gap-2">
                Ministry of Commerce & Industry
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-sans tracking-normal font-semibold ${isBackendConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                  {isBackendConnected ? 'DB Connected' : 'Offline/Mock'}
                </span>
              </h1>
            </div>
            <p className="text-xs font-bold text-[#64748B]">Patent Office India • Pre-Grant Opposition Compliance Monitor</p>
          </div>
        </div>

        {/* Global Toolbar Header actions (Dynamic role switches, notifications bell) */}
        <div className="flex items-center gap-4 flex-wrap w-full sm:w-auto justify-end">
          
          {/* User selector mock dropdown (System-wide Impersonator Selector) */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded text-xs">
            <span className="text-[#64748B] font-medium">Viewing as:</span>
            <select
              value={currentUser.id}
              onChange={(e) => setCurrentUser(e.target.value)}
              className="font-bold text-[#0F172A] bg-transparent outline-none cursor-pointer"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          {/* Secure Notifications Bell Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded text-slate-700 hover:text-[#0F172A] transition-all cursor-pointer"
              title="View warnings feed"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black text-white font-mono animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden divide-y divide-slate-100">
                <div className="p-3 bg-slate-50 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900 uppercase font-mono">Alert Warnings</span>
                  <button 
                    onClick={() => {
                      markAllNotificationsAsRead();
                      setIsNotificationsOpen(false);
                    }}
                    className="text-[10px] text-red-600 hover:underline font-bold"
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                  {notifications.map((noti) => (
                    <div 
                      key={noti.id} 
                      onClick={() => {
                        setSelectedCaseId(noti.caseId);
                        setActiveTab('Case Tracking');
                        setIsNotificationsOpen(false);
                      }}
                      className="p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className={`font-bold ${noti.severity === 'error' ? 'text-red-600' : 'text-slate-800'}`}>
                          {noti.title}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">{noti.timestamp}</span>
                      </div>
                      <p className="text-slate-500 mt-1 leading-normal text-[11px] font-medium">{noti.description}</p>
                      <span className="inline-block bg-slate-150 text-[#0F172A] py-0.5 px-2 rounded-full font-mono text-[9px] font-bold tracking-wider mt-2">
                        Case: #{noti.caseId}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-2 text-center bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Delhi HC Compliance Rule Engine</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Structural Layout and Content Pane */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Navigation Rail Side Pane */}
        <aside className="w-full md:w-56 shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4 select-none">
          
          {/* Dashboard Icon */}
          <button
            onClick={() => setActiveTab('Dashboard')}
            className={`w-full text-left py-2.5 px-3.5 rounded flex items-center gap-2.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'Dashboard' 
                ? 'bg-[#0F172A] text-white shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]'
            }`}
          >
            <Layers size={15} />
            Overview Dashboard
          </button>

          {/* Cases List */}
          <button
            onClick={() => setActiveTab('Case Management')}
            className={`w-full text-left py-2.5 px-3.5 rounded flex items-center gap-2.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'Case Management' 
                ? 'bg-[#0F172A] text-white shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]'
            }`}
          >
            <FolderLock size={15} />
            Case Management
          </button>

          {/* Opposition Proceedings */}
          <button
            onClick={() => setActiveTab('Opposition Management')}
            className={`w-full text-left py-2.5 px-3.5 rounded flex items-center gap-2.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'Opposition Management' 
                ? 'bg-[#0F172A] text-white shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]'
            }`}
          >
            <Gavel size={15} />
            Opposition proceedings
          </button>

          {/* Case Tracking step */}
          <button
            onClick={() => setActiveTab('Case Tracking')}
            className={`w-full text-left py-2.5 px-3.5 rounded flex items-center gap-2.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'Case Tracking' 
                ? 'bg-[#0F172A] text-white shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]'
            }`}
          >
            <BookOpen size={15} />
            Dossier Tracker
          </button>

          {/* Reports Analytics */}
          <button
            onClick={() => setActiveTab('Reports')}
            className={`w-full text-left py-2.5 px-3.5 rounded flex items-center gap-2.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'Reports' 
                ? 'bg-[#0F172A] text-white shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]'
            }`}
          >
            <BarChart3 size={15} />
            SLA Ledger & Reports
          </button>

          {/* Administration panel setting */}
          <button
            onClick={() => setActiveTab('Admin Panel')}
            className={`w-full text-left py-2.5 px-3.5 rounded flex items-center gap-2.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'Admin Panel' 
                ? 'bg-[#0F172A] text-white shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]'
            }`}
          >
            <Cog size={15} />
            Sovereign Admin
          </button>

          {/* Golden regulatory information landing page link */}
          <button
            onClick={() => setShowLanding(true)}
            className="w-full text-left py-2.5 px-3.5 rounded flex items-center gap-2.5 text-xs font-extrabold transition-all shrink-0 cursor-pointer text-amber-700 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20"
            title="Read statutory guidelines and analytics info"
          >
            <Building size={15} />
            Portal Front & Info
          </button>

        </aside>

        {/* Content Pane Area */}
        <main className="flex-1 bg-transparent min-w-0">
          
          {activeTab === 'Dashboard' && (
            <DashboardTab 
              onNavigateToTab={setActiveTab}
              onSelectCaseId={setSelectedCaseId}
              openFilingModal={() => setIsFilingModalOpen(true)}
            />
          )}

          {activeTab === 'Case Management' && (
            <CaseManagementTab 
              onSelectCaseId={setSelectedCaseId}
              onNavigateToTab={setActiveTab}
              openFilingModal={() => setIsFilingModalOpen(true)}
            />
          )}

          {activeTab === 'Opposition Management' && (
            <OppositionTab 
              onSelectCaseId={setSelectedCaseId}
              onNavigateToTab={setActiveTab}
              openOppositionModal={() => setIsOppositionModalOpen(true)}
            />
          )}

          {activeTab === 'Case Tracking' && (
            <CaseTrackingTab 
              selectedCaseId={selectedCaseId}
              onBackToCases={() => setActiveTab('Case Management')}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'Reports' && (
            <ReportsTab />
          )}

          {activeTab === 'Admin Panel' && (
            <AdminPanelTab />
          )}

        </main>

      </div>

      {/* Official Government Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 shrink-0 text-center text-xs text-[#64748B] font-medium leading-relaxed shadow-sm">
        <p>© {new Date().getFullYear()} Intellectual Property Office, Government of India. Delhi High Court Case Management Directive Compliant.</p>
        <p className="mt-1 font-mono text-[10px] text-slate-400">POMS Cryptographic audit stream: ECDSA SECP256K1 Verified • SSL Secure</p>
      </footer>

      {/* MODAL: Register New Patent Case Form */}
      {isFilingModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/70 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg border border-slate-250 w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="bg-[#0F172A] p-4 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#FFFDF4] uppercase">PRE-GRANT REGISTRATION FORM</span>
                <h3 className="text-base font-bold font-sans tracking-tight">Register New Patent Asset File</h3>
              </div>
              <button 
                onClick={() => setIsFilingModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitNewCase} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Patent Title Definition</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Quantum Computing Logic Gate Matrix Optimization Array"
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium focus:ring-1 focus:ring-[#0F172A] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Applicant Claimant Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., Liam Sterling"
                    value={newCaseApplicant}
                    onChange={(e) => setNewCaseApplicant(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium focus:ring-1 focus:ring-[#0F172A] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Claiming Organization Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., Quantum Synergy Labs Inc."
                    value={newCaseOrg}
                    onChange={(e) => setNewCaseOrg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium focus:ring-1 focus:ring-[#0F172A] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">International Patent Classification (IPC Code)</label>
                <input 
                  type="text" 
                  placeholder="e.g., G06N 10/00 (Quantum Computation)"
                  value={newCaseIpc}
                  onChange={(e) => setNewCaseIpc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono focus:ring-1 focus:ring-[#0F172A] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Technological Abstract & Claim Space Bounds</label>
                <textarea 
                  placeholder="Introduce structural boundaries, chemical bounds, or mechanical formulas pertaining to the novel invention..."
                  rows={4}
                  value={newCaseDescription}
                  onChange={(e) => setNewCaseDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#0F172A] outline-none leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs font-bold">
                <button 
                  type="button"
                  onClick={() => setIsFilingModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded transition-colors text-[#64748B]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-[#0F172A] hover:bg-slate-900 text-white rounded transition-colors shadow-sm"
                >
                  Register Patent File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: File Pre-Grant Opposition Notice Form */}
      {isOppositionModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/70 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg border border-slate-250 w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="bg-[#0F172A] p-4 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#FFFDF4] uppercase">FORM-7 COMPLIANCE WRIT</span>
                <h3 className="text-base font-bold font-sans tracking-tight">File Pre-Grant Opposition Notice</h3>
              </div>
              <button 
                onClick={() => setIsOppositionModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitNewOpposition} className="p-5 space-y-4 text-xs font-medium text-slate-700">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Select Patent Target ID</label>
                  <select 
                    value={newOppPatentId}
                    onChange={(e) => setNewOppPatentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono font-bold focus:ring-1 focus:ring-[#0F172A] outline-none"
                  >
                    {cases.filter(c => c.status !== 'Approved' && c.status !== 'Rejected').map(c => (
                      <option key={c.id} value={c.id}>{c.id} — {c.title.substring(0, 30)}...</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Opponent Contester Entity</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., Omni-Pharma Quantum Laboratories"
                    value={newOppName}
                    onChange={(e) => setNewOppName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#0F172A] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Primary Statutory Grounds for Opposition</label>
                <select 
                  value={newOppReason}
                  onChange={(e) => setNewOppReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-semibold focus:ring-1 focus:ring-[#0F172A] outline-none"
                >
                  <option value="Anticipation by Prior Art">Lack of Novelty (Anticipation by Prior Art)</option>
                  <option value="Lack of Inventive Step">Lack of Inventive Step (Obviousness to Skilled Person)</option>
                  <option value="Insufficient/Unclear Specification">Insufficient of Description Disclosure</option>
                  <option value="Non-Patentable Subject Matter">Non-Patentable Subject Matter (Statutory Exclusion)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Detailed Statement of Claim Boundaries</label>
                <textarea 
                  required
                  placeholder="Outline prior art patent citations, publication dates, and scientific equations disputing the claimed boundaries..."
                  rows={4}
                  value={newOppStatement}
                  onChange={(e) => setNewOppStatement(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#0F172A] outline-none leading-relaxed"
                />
              </div>

              {/* Upload evidence PDF mock */}
              <div className="space-y-1">
                <label className="text-xs font-bold block">Attach Supporting Scientific Prior Art (PDF)</label>
                <div className="border border-dashed border-slate-200 rounded p-4 text-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
                  <Upload size={18} className="text-slate-400 mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-[#0F172A]">Drag & drop or select PDF exhibit</p>
                  
                  <input 
                    type="file" 
                    className="hidden" 
                    id="modal-pdf-chooser" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setMockFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <label 
                    htmlFor="modal-pdf-chooser"
                    className="mt-2 inline-block bg-white hover:bg-slate-50 text-[9px] font-bold py-1 px-2 border border-slate-200 rounded cursor-pointer select-none"
                  >
                    Select Exhibit
                  </label>

                  {mockFileName && (
                    <p className="text-[10px] text-emerald-600 font-mono font-bold mt-1.5">
                      Selected: {mockFileName}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs font-bold">
                <button 
                  type="button"
                  onClick={() => setIsOppositionModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded transition-colors text-[#64748B]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors shadow-sm"
                >
                  File Opposition Proceeding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
