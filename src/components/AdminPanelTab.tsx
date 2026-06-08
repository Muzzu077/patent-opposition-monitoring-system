/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePomsStore } from '../store';
import { User, UserRole } from '../types';
import { 
  Settings, 
  Clock, 
  Users, 
  Lock, 
  ShieldAlert, 
  Layers, 
  CheckCircle,
  HelpCircle,
  BellRing,
  Award,
  BookOpen,
  ArrowRight,
  Gavel,
  History,
  Activity,
  PenTool
} from 'lucide-react';

export default function AdminPanelTab() {
  const { 
    settings, 
    updateSettings, 
    users, 
    auditLogs, 
    addNotification, 
    currentUser,
    setCurrentUser 
  } = usePomsStore();

  const [maxExam, setMaxExam] = useState(settings.maxExaminationDays);
  const [maxOps, setMaxOps] = useState(settings.maxOppositionResponseDays);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = () => {
    updateSettings({
      maxExaminationDays: maxExam,
      maxOppositionResponseDays: maxOps
    });
    setIsSaved(true);

    addNotification({
      type: 'Decision Published',
      title: 'Global governance limits updated',
      description: `Administrative limits revised: Max Examination to ${maxExam} days, Max Opposition to ${maxOps} days. Rules recalculated securely.`,
      caseId: 'SYSTEM',
      severity: 'info'
    });

    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleToggleOption = (key: 'enableEmailAlerts' | 'enableAutoEscalation' | 'strictHCDirectiveRules') => {
    updateSettings({ [key]: !settings[key] });
    addNotification({
      type: 'Decision Published',
      title: 'Compliance logic changed',
      description: `Compliance parameter '${key}' has been adjusted in the Admin configuration console.`,
      caseId: 'SYSTEM',
      severity: 'info'
    });
  };

  return (
    <div className="space-y-6 fade-in animate-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-sans tracking-tight text-[#0F172A]">Sovereign Control & Governance Center</h2>
          <p className="text-[#64748B] text-sm mt-1">Configure automated rules, oversee user credentials, and trace live administrative audit trails.</p>
        </div>
      </div>

      {/* Main Grid: Settings & Audit logs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Settings panel card (Lg Column 2) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Rules Configuration Console */}
          <div className="bg-white border border-[#E2E8F0] rounded p-5 space-y-5 shadow-xs">
            <h3 className="font-bold text-[#0F172A] text-base flex items-center gap-1.5 border-b border-slate-100 pb-3 font-sans tracking-tight">
              <Settings size={18} /> Pre-Grant Regulation Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Max Examination Days */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Max Examination Stage Duration (Days)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={maxExam}
                    onChange={(e) => setMaxExam(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono font-bold text-[#0F172A] w-24 outline-none focus:ring-1 focus:ring-[#0F172A]"
                  />
                  <span className="text-[11px] text-[#64748B]">SLA limit for standard patents</span>
                </div>
              </div>

              {/* Max Pre-grant Oppositions */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Max Opposition Reply Deadline (Days)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={maxOps}
                    onChange={(e) => setMaxOps(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono font-bold text-[#0F172A] w-24 outline-none focus:ring-1 focus:ring-[#0F172A]"
                  />
                  <span className="text-[11px] text-[#64748B]">Applicant reply SLA</span>
                </div>
              </div>
            </div>

            {/* Quick Toggle Settings list */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              
              {/* Strict Delhi HC Toggles */}
              <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors text-xs font-medium">
                <div className="flex gap-2.5 items-start">
                  <ShieldAlert size={16} className="text-slate-500 mt-0.5" />
                  <div>
                    <label className="font-bold text-slate-900 block cursor-pointer" htmlFor="cb-strict">
                      Enforce strict Delhi High Court pre-grant delay rules
                    </label>
                    <span className="text-[#64748B] text-[11px] font-normal block mt-0.5">
                      Triggers instant Orange/Red warning breaches on examiner desks beyond 30 days.
                    </span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  id="cb-strict"
                  checked={settings.strictHCDirectiveRules}
                  onChange={() => handleToggleOption('strictHCDirectiveRules')}
                  className="rounded border-[#cbd5e1] text-[#0F172A] focus:ring-[#0F172A] cursor-pointer"
                />
              </div>

              {/* Auto Escalation */}
              <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors text-xs font-medium">
                <div className="flex gap-2.5 items-start">
                  <BellRing size={16} className="text-slate-500 mt-0.5" />
                  <div>
                    <label className="font-bold text-slate-900 block cursor-pointer" htmlFor="cb-escalate">
                      Automate backlog director escalation
                    </label>
                    <span className="text-[#64748B] text-[11px] font-normal block mt-0.5">
                      Instantly alerts head registry of files left unassigned more than 30 days.
                    </span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  id="cb-escalate"
                  checked={settings.enableAutoEscalation}
                  onChange={() => handleToggleOption('enableAutoEscalation')}
                  className="rounded border-[#cbd5e1] text-[#0F172A] focus:ring-[#0F172A] cursor-pointer"
                />
              </div>

              {/* Email Integration block structure */}
              <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors text-xs font-medium">
                <div className="flex gap-2.5 items-start">
                  <Settings size={16} className="text-slate-500 mt-0.5" />
                  <div>
                    <label className="font-bold text-slate-900 block cursor-pointer" htmlFor="cb-email">
                      Enable secure SMTP email alerts and dispatch
                    </label>
                    <span className="text-[#64748B] text-[11px] font-normal block mt-0.5">
                      Pipes automated SLA reminder notices instantly to examiner and applicant boxes.
                    </span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  id="cb-email"
                  checked={settings.enableEmailAlerts}
                  onChange={() => handleToggleOption('enableEmailAlerts')}
                  className="rounded border-[#cbd5e1] text-[#0F172A] focus:ring-[#0F172A] cursor-pointer"
                />
              </div>

            </div>

            {/* Save Buttons */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-mono">Parameters recalculated globally</span>
              <button 
                onClick={handleSaveSettings}
                className="bg-[#0F172A] hover:bg-slate-950 font-bold px-5 py-2 rounded text-white shadow-sm transition-all"
              >
                {isSaved ? 'Settings Saved Successfully!' : 'Commit Parameters'}
              </button>
            </div>
          </div>

          {/* User Roster Roster Registry */}
          <div className="bg-white border border-[#E2E8F0] rounded p-5 space-y-4 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5 border-b border-slate-100 pb-3 font-sans tracking-tight animate-in">
              <Users size={18} /> POMS User Role Accounts ({users.length})
            </h3>
            
            <p className="text-xs text-[#64748B]">
              These authorized roles are pre-seeded in the local environment. Use the selector inside the top toolbar of this application to live switch roles and see the system through their specific access clearances:
            </p>

            <div className="divide-y divide-slate-100">
              {users.map((item) => {
                const isActive = currentUser.id === item.id;
                return (
                  <div key={item.id} className="py-3 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.name}</p>
                        <p className="text-[10px] text-[#64748B] font-mono">{item.email}</p>
                        <p className="text-[9px] text-[#64748B] font-medium">{item.organization}</p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <span className="bg-slate-100 text-[#0F172A] text-[9px] font-mono font-bold py-1 px-2.5 rounded border border-slate-200">
                        {item.role}
                      </span>
                      {isActive ? (
                        <span className="text-emerald-600 font-bold text-xs flex items-center gap-1 font-sans">
                          Active Clearances
                        </span>
                      ) : (
                        <button
                          onClick={() => setCurrentUser(item.id)}
                          className="bg-slate-50 hover:bg-[#0F172A] text-[#0F172A] hover:text-white font-bold py-1 px-3.5 rounded border border-slate-200 text-xs transition-colors"
                        >
                          Switch
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Live System Auditing panel (Lg Column 1) */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-[#0F172A] text-base font-sans tracking-tight flex items-center gap-1.5">
              <History size={18} /> Live Audit Trail logs
            </h3>
            <span className="bg-[#0F172A] text-white font-mono text-[9px] font-bold py-0.5 px-2.5 rounded">SECURE</span>
          </div>

          <p className="text-xs text-[#64748B] font-medium">To maintain administrative integrity, every action, user toggle, specs revision and file approval is automatically stamped in these system logs:</p>

          <div className="space-y-4 overflow-y-auto max-h-[500px] custom-scrollbar relative before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[1px] before:bg-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="relative pl-8 text-xs font-sans">
                <span className="absolute left-0 top-0.5 w-[22px] h-[22px] rounded-full bg-slate-100 border border-slate-200 text-[#0F172A] font-black text-[9px] flex items-center justify-center">
                  {log.action.charAt(0)}
                </span>
                <div>
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium leading-normal mt-1">{log.details}</p>
                  <p className="text-[9px] text-[#64748B] font-mono mt-0.5">Stamping: {log.userName} ({log.userRole})</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
