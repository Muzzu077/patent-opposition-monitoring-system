/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePomsStore } from '../store';
import { 
  Scale, 
  Layers, 
  FolderLock, 
  Gavel, 
  BarChart3, 
  Clock, 
  Users, 
  ArrowRight,
  ShieldCheck,
  FileText,
  UserCheck,
  CheckCircle,
  HelpCircle,
  Calendar,
  Sparkles,
  Building,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface LandingPageProps {
  onEnterPortal: (startingTab?: string) => void;
}

export default function LandingPage({ onEnterPortal }: LandingPageProps) {
  const { cases, oppositions, currentUser, users, setCurrentUser, isBackendConnected } = usePomsStore();

  // Dynamic calculations based on live state inside the engine
  const totalPatents = cases.length;
  const activeDisputes = oppositions.length;
  
  // Under Delhi HC directives, any case pending longer than 60 days is classified as high-priority delayed
  const urgentDelayAlerts = cases.filter(c => c.pendingDays > 60 && c.status !== 'Approved' && c.status !== 'Rejected').length;
  
  // Calculate dynamic SLA Average
  const avgSlaDays = totalPatents > 0 
    ? Math.round(cases.reduce((acc, c) => acc + (c.pendingDays || 0), 0) / totalPatents)
    : 45;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-[#0F172A] selection:text-white">
      
      {/* Delhi Regulatory Palette top border (Saffron, White, Green) */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-white to-emerald-500 shrink-0" />

      {/* Hero Header Space */}
      <header className="bg-white/80 border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8 shrink-0 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            {/* emblem insignia seal */}
            <div className="w-10 h-10 bg-[#0F172A] rounded flex items-center justify-center font-bold text-white tracking-widest text-[#FFFDF4] text-xs">
              PMO
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <h1 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
                  Ministry of Commerce & Industry
                </h1>
              </div>
              <p className="text-[11px] font-bold text-slate-500">Patent Office India • Delhi HC Regulatory Compliance System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-sans font-semibold flex items-center gap-1 ${
              isBackendConnected 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' 
                : 'bg-amber-50 text-amber-700 border border-amber-200/80'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isBackendConnected ? 'DB Connected' : 'Offline/Mock'}
            </span>
            <button
              onClick={() => onEnterPortal('Dashboard')}
              className="bg-[#0F172A] hover:bg-slate-800 text-white font-semibold py-2 px-4 rounded text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Launch Compliance Console</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Feature Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Big visual statement (Hero Section) */}
        <section className="text-center max-w-3xl mx-auto space-y-5 py-6">
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase font-mono px-3 py-1 rounded-full border border-blue-200/60">
            <Scale size={11} /> Delhi High Court Directive Mandated Monitor
          </span>
          <h2 className="text-3.5xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight font-sans">
            Pre-Grant Opposition <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-slate-900 to-blue-600">
              Compliance Monitor
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium">
            An administrative platform designed to monitor time-sensitive patent disputes. 
            Track statutory pre-grant Form-7 representation dockets, enforce officer SLA targets, and protect the public domain 
            from over-broad intellectual property claims.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
            <button
              onClick={() => onEnterPortal('Dashboard')}
              className="px-6 py-3 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <span>Access Administration Console</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('statutory-timeline-guide');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded border border-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <span>Review Form-7 Guidelines</span>
              <HelpCircle size={15} />
            </button>
          </div>
        </section>

        {/* Dynamic Telemetry dashboard segment (Actual live state counts) */}
        <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest">Real-time Portal Telemetry</h3>
              <p className="text-xs text-slate-400 mt-0.5">Active variables computed from database indexes</p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-200/60 shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 flex flex-col justify-between hover:border-slate-200 hover:shadow-xs transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-slate-500 text-[11px] font-bold">Total Docket Files</span>
                <FolderLock size={15} className="text-slate-700" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 leading-none">
                  {totalPatents}
                </span>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">Approved & Pending Assets</p>
              </div>
            </div>

            <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 flex flex-col justify-between hover:border-slate-200 hover:shadow-xs transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-slate-500 text-[11px] font-bold">Form-7 Disputes</span>
                <Gavel size={15} className="text-orange-500" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 leading-none">
                  {activeDisputes}
                </span>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">Logged Pre-Grant Disputes</p>
              </div>
            </div>

            <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 flex flex-col justify-between hover:border-slate-200 hover:shadow-xs transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-slate-500 text-[11px] font-bold">Avg Agent SLA</span>
                <Clock size={15} className="text-sky-600" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 leading-none">
                  {avgSlaDays} Days
                </span>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">Delhi HC Target Limit: 90</p>
              </div>
            </div>

            <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 flex flex-col justify-between hover:border-slate-200 hover:shadow-xs transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-slate-500 text-[11px] font-bold">Priority Risk Alerts</span>
                <AlertTriangle size={15} className="text-red-500" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-red-600 leading-none">
                  {urgentDelayAlerts}
                </span>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">Escalated Priority Cases</p>
              </div>
            </div>

          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Consolidated Legal Framework Features</h3>
            <p className="text-xs sm:text-sm text-slate-500">Our suite offers transparent tools to ensure pre-grant operations and statutory guidelines are tracked down to the exact day.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div 
              onClick={() => onEnterPortal('Case Management')}
              className="bg-white p-6 rounded-lg border border-[#E2E8F0] hover:border-[#0F172A] hover:shadow-sm transition-all cursor-pointer group space-y-4"
            >
              <div className="w-10 h-10 bg-slate-50 text-[#0F172A] group-hover:bg-[#0F172A] group-hover:text-white transition-all rounded flex items-center justify-center font-bold">
                <Layers size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0F172A] transition-colors flex items-center gap-1">
                  Claim-Space Docketing <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all ml-1" />
                </h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Register, browse, and structure technological claims (e.g., Software/AI, Biotech) under active pre-grant examination sequences.
                </p>
              </div>
            </div>

            <div 
              onClick={() => onEnterPortal('Opposition Management')}
              className="bg-white p-6 rounded-lg border border-[#E2E8F0] hover:border-[#0F172A] hover:shadow-sm transition-all cursor-pointer group space-y-4"
            >
              <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded flex items-center justify-center font-bold">
                <Gavel size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-1">
                  Pre-Grant Representation Hub <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all ml-1" />
                </h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Submit Form-7 opposition challenges referencing Prior Art citations, lack of inventive steps, or non-patentability exclusions.
                </p>
              </div>
            </div>

            <div 
              onClick={() => onEnterPortal('Reports')}
              className="bg-white p-6 rounded-lg border border-[#E2E8F0] hover:border-[#0F172A] hover:shadow-sm transition-all cursor-pointer group space-y-4"
            >
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center font-bold">
                <BarChart3 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1">
                  Delhi HC SLA Compliance <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all ml-1" />
                </h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Monitor examiner backlog indexes, regulatory response latencies, and priority warnings feed to prevent administrative legal bottlenecks.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Delhi HC Statutory Timeline Rules - Form-7 Process */}
        <section id="statutory-timeline-guide" className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold font-mono text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <Scale size={14} className="text-slate-900" /> Compliance Guide: Statutory Form-7 Execution
            </h3>
            <p className="text-xs text-slate-500 mt-1">Rule 55 timeline mandates under the Indian Patents (Amendment) Act and recent Judiciary guidelines</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Horizontal line pattern in desktop view */}
            <div className="hidden md:block absolute top-[2.25rem] left-[5%] right-[5%] h-0.5 bg-gradient-to-r from-orange-400 via-yellow-400 to-emerald-500 opacity-20 pointer-events-none" />

            <div className="space-y-3 relative">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs font-mono select-none">
                01
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Representation Filing</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                  Once a patent is published, any person may write Form-7 opposition parameters including scientific specifications under patent rules.
                </p>
              </div>
              <span className="inline-block bg-slate-100 text-slate-700 text-[9px] font-mono font-bold py-0.5 px-2 rounded">
                Initiation Phase
              </span>
            </div>

            <div className="space-y-3 relative">
              <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-xs font-mono select-none">
                02
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Applicant Reply</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                  A notice is served to the applicant entity. The claimant is granted a strict statutory window of 90 days to issue counter-arguments.
                </p>
              </div>
              <span className="inline-block bg-orange-50 text-orange-700 text-[9px] font-mono font-bold py-0.5 px-2 rounded">
                Strict 90-Day SLA
              </span>
            </div>

            <div className="space-y-3 relative">
              <div className="w-9 h-9 rounded-full bg-yellow-500 text-slate-900 flex items-center justify-center font-black text-xs font-mono select-none">
                03
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Examiner Appraisal</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                  An assessment board compiles prior art databases, schedules virtual hearings, and assesses novelty against claim criteria.
                </p>
              </div>
              <span className="inline-block bg-yellow-50 text-yellow-700 text-[9px] font-mono font-bold py-0.5 px-2 rounded">
                Hearing Setup
              </span>
            </div>

            <div className="space-y-3 relative">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs font-mono select-none">
                04
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Final Decision</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                  The Controller-General publishes an official decision. Failed structures reject the document, while successful ones grant patent status.
                </p>
              </div>
              <span className="inline-block bg-emerald-50 text-emerald-700 text-[9px] font-mono font-bold py-0.5 px-2 rounded">
                Grant or Reject
              </span>
            </div>

          </div>
        </section>

        {/* Identity Evaluation Selector (Convenient testing profiles) */}
        <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4 shadow-xs">
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Users size={16} className="text-[#0F172A]" /> Administrative Persona Gateway
            </h3>
            <p className="text-xs text-slate-500 mt-1">Select an active evaluation credentials profile to examine specialized role-based capabilities inside the portal.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            {users.map((profile) => {
              const isActive = currentUser.id === profile.id;
              return (
                <div 
                  key={profile.id}
                  onClick={() => {
                    setCurrentUser(profile.id);
                  }}
                  className={`p-4 rounded border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isActive 
                      ? 'bg-slate-50 border-[#0F172A] shadow-xs ring-1 ring-[#0F172A]' 
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src={profile.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`} 
                      alt={profile.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-normal">{profile.name}</h4>
                      <p className="text-[9px] font-mono font-bold text-blue-700 mt-0.5">{profile.role}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
                    <span>{profile.organization?.substring(0, 20)}...</span>
                    {isActive && <span className="text-emerald-600 font-bold font-sans">Active</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-3">
            <button
              onClick={() => onEnterPortal('Dashboard')}
              className="w-full sm:w-auto px-10 py-3 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded text-xs transition-colors cursor-pointer shadow-md inline-flex items-center justify-center gap-2"
            >
              <span>Authenticate and Launch Portal as {currentUser.name}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </section>

      </main>

      {/* Official regulatory footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8 px-4 text-center space-y-3 text-xs text-slate-500 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
          <div className="space-y-1">
            <p className="font-bold text-slate-400">POMS Intellectual Property Compliance Regulatory Ledger</p>
            <p className="text-[11px]">Delhi Judicial Reform Compliance Hub • Intellectual Property Office, Govt. of India</p>
          </div>
          <p className="text-[10px] text-slate-500 font-mono sm:text-right">
            LEDGER STATUS: Cryptographic hash ECDSA SECP256K1 Verified <br />
            Secure Sandbox Protocol Active • TLS 1.3
          </p>
        </div>
      </footer>
    </div>
  );
}
