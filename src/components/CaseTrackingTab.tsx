/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { usePomsStore } from '../store';
import { PatentStatus, Document, AuditLog } from '../types';
import { 
  ArrowLeft, 
  Search, 
  UserCheck, 
  ExternalLink,
  ChevronRight,
  Gavel, 
  Calendar, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  FileText, 
  Plus, 
  Upload, 
  BookOpen, 
  Edit, 
  Download, 
  Eye, 
  CheckCircle2, 
  EyeOff,
  Smile,
  Users,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function CaseTrackingTab({
  selectedCaseId,
  onBackToCases,
  onNavigateToTab
}: {
  selectedCaseId: string;
  onBackToCases: () => void;
  onNavigateToTab: (tab: string) => void;
}) {
  const { 
    cases, 
    oppositions, 
    hearings, 
    documents, 
    addDocument, 
    deleteDocument, 
    updateCase,
    currentUser,
    addNotification
  } = usePomsStore();

  const [isEditingSpecs, setIsEditingSpecs] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [internalNotes, setInternalNotes] = useState<Array<{ id: string; text: string; author: string; time: string }>>([
    { id: '1', text: 'Review of Omni-Pharma pre-grant claims scheduled for next Monday with the technical advisory board.', author: 'Dr. Helena Vance', time: '2h ago' },
    { id: '2', text: 'Stellar Computing prior art document USTPO 1129312 retrieved and indexed on the digital dossier.', author: 'Dr. Helena Vance', time: '1d ago' }
  ]);

  // Document Upload States
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileCategory, setSelectedFileCategory] = useState<Document['category']>('Prior Art');

  // Specs Edit form state
  const [editFields, setEditFields] = useState({
    title: '',
    ipcClassification: '',
    applicantName: '',
    priorityDate: '',
    description: ''
  });

  // Dynamic Case Matching
  const activeCase = useMemo(() => {
    const matched = cases.find(c => c.id === selectedCaseId);
    if (matched) {
      // populate editor fields
      return matched;
    }
    // Fallback default case to match Mockup 4
    return cases.find(c => c.id === 'PAT-2024-0892') || cases[0];
  }, [cases, selectedCaseId]);

  // Populate editor fields on load / activeCase change
  React.useEffect(() => {
    if (activeCase) {
      setEditFields({
        title: activeCase.title,
        ipcClassification: activeCase.ipcClassification,
        applicantName: activeCase.applicantName,
        priorityDate: activeCase.priorityDate,
        description: activeCase.description
      });
    }
  }, [activeCase]);

  // Match Oppositions to this Case ID
  const caseOppositions = useMemo(() => {
    return oppositions.filter(ops => ops.caseId === activeCase.id);
  }, [oppositions, activeCase]);

  // Match Documents to this Case ID
  const caseDocuments = useMemo(() => {
    return documents.filter(doc => doc.caseId === activeCase.id);
  }, [documents, activeCase]);

  // Status mapping for visual timeline stepper
  const getTimelineSteps = (status: PatentStatus) => {
    const steps: Array<{ key: PatentStatus; label: string; date?: string; completed: boolean; active: boolean }> = [
      { key: 'Submitted', label: 'Submitted', date: activeCase.filingDate, completed: false, active: false },
      { key: 'Under Examination', label: 'Examination', date: 'In Progress', completed: false, active: false },
      { key: 'Opposition Filed', label: 'Opposition Filed', date: 'Pending Resolve', completed: false, active: false },
      { key: 'Hearing Scheduled', label: 'Hearing Scheduled', date: 'Awaiting Date', completed: false, active: false },
      { key: 'Decision Pending', label: 'Decision Pending', date: 'Drafting', completed: false, active: false },
      { key: 'Approved', label: 'Approved / Rejected', date: 'Final Decree', completed: false, active: false }
    ];

    const statusHierarchy: PatentStatus[] = [
      'Submitted',
      'Under Examination',
      'Opposition Filed',
      'Hearing Scheduled',
      'Decision Pending',
      'Approved',
      'Rejected'
    ];

    const currentIdx = statusHierarchy.indexOf(status);

    return steps.map((step) => {
      let completed = false;
      let active = false;

      const stepIdx = statusHierarchy.indexOf(step.key);

      if (step.key === 'Approved') {
        completed = status === 'Approved' || status === 'Rejected';
        active = status === 'Approved' || status === 'Rejected';
      } else {
        completed = stepIdx < currentIdx;
        active = step.key === status;
      }

      return {
        ...step,
        completed,
        active
      };
    });
  };

  const timelineSteps = useMemo(() => getTimelineSteps(activeCase.status), [activeCase]);

  // Dynamic values calculated directly from delay bounds
  const severityLabel = useMemo(() => {
    const days = activeCase.pendingDays;
    if (days > 90) return { text: `${days} Days - Red Severity Delay`, style: 'bg-red-100 text-red-800 border-red-200' };
    if (days > 60) return { text: `${days} Days - Orange Severity Warn`, style: 'bg-orange-100 text-orange-800 border-orange-200' };
    if (days > 30) return { text: `${days} Days - Yellow Severity Alert`, style: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { text: `${days} Days - Green Priority`, style: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  }, [activeCase]);

  // Action Save detailed technical specs
  const handleSaveSpecs = () => {
    updateCase(activeCase.id, {
      title: editFields.title,
      ipcClassification: editFields.ipcClassification,
      applicantName: editFields.applicantName,
      priorityDate: editFields.priorityDate,
      description: editFields.description
    });
    setIsEditingSpecs(false);

    addNotification({
      type: 'Deadline Approaching',
      title: 'Technical Specs updated',
      description: `User '${currentUser.name}' has saved updated technical specifications and abstract claims on patent ${activeCase.id}.`,
      caseId: activeCase.id,
      severity: 'info'
    });
  };

  // Drag and drop mock handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      
      addDocument({
        name: file.name,
        size: `${sizeMb} MB`,
        category: selectedFileCategory,
        caseId: activeCase.id,
        status: 'Approved'
      });
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      
      addDocument({
        name: file.name,
        size: `${sizeMb} MB`,
        category: selectedFileCategory,
        caseId: activeCase.id,
        status: 'Approved'
      });
    }
  };

  // Add tracking statement note list card
  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const added = {
      id: String(Date.now()),
      text: newNoteText,
      author: currentUser.name,
      time: 'Just now'
    };
    setInternalNotes([added, ...internalNotes]);
    setNewNoteText('');
  };

  return (
    <div className="space-y-6 fade-in">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToCases}
            className="p-1.5 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
          >
            <ArrowLeft size={18} className="text-slate-700" />
          </button>
          
          <div>
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
              Docket Tracker #{activeCase.id}
            </span>
            <h2 className="text-xl font-bold font-sans text-slate-900 line-clamp-1">
              {activeCase.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#64748B]">Assignee:</span>
          <span className="font-bold text-slate-900 bg-slate-100 py-1 px-2.5 rounded font-mono">
            {activeCase.assignedOfficer}
          </span>
        </div>
      </div>

      {/* Severity indicator & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status card */}
        <div className="lg:col-span-2 bg-white rounded border border-[#E2E8F0] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Case Stage Overview</h3>
            <p className="text-xs text-[#64748B] mt-1">
              This filing index is categorized in the{' '} 
              <span className="font-bold text-[#0F172A] underline">{activeCase.status}</span>{' '}
              SLA track, monitored for dispatch lags.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${severityLabel.style}`}>
              <ShieldAlert size={14} />
              {severityLabel.text}
            </span>
            <p className="text-[10px] text-slate-400 font-mono mt-2">Recommended Next Milestone: Oct 24, 2026</p>
          </div>
        </div>

        {/* Assigned Officer card */}
        <div className="bg-white rounded border border-[#E2E8F0] p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center font-bold text-lg text-[#0F172A]">
            {activeCase.assignedOfficer.charAt(0)}
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">Assigned Patent Official</p>
            <h4 className="font-bold text-[#0F172A] text-sm">{activeCase.assignedOfficer}</h4>
            <p className="text-xs text-[#64748B] hover:underline cursor-pointer font-medium mt-0.5">
              View Examiner Backlog
            </p>
          </div>
        </div>

      </div>

      {/* Case Progression Stepper Timeline (Visual Timeline) */}
      <div className="bg-white border border-[#E2E8F0] rounded p-6 relative">
        <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-[#64748B] mb-8">
          Patent Opposition Progression Line
        </h3>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4 w-full">
          
          {/* Progress Connector Line (Background) */}
          <div className="absolute top-[18px] left-[15px] md:left-0 md:right-0 bottom-4 md:bottom-auto md:top-1/2 w-0.5 md:w-full h-full md:h-1 bg-slate-100 -translate-y-0 md:-translate-y-1/2 z-0" />
          
          {/* Timeline Steps */}
          {timelineSteps.map((step, idx) => {
            let stepIcon = (
              <span className="font-mono font-bold text-xs">{idx + 1}</span>
            );

            if (step.completed) {
              stepIcon = <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50" />;
            } else if (step.active) {
              stepIcon = <Gavel size={16} className="text-[#0F172A] animate-pulse" />;
            }
            
            const circleColor = step.active 
              ? 'border-4 border-[#0F172A] bg-white ring-4 ring-slate-100 h-10 w-10 text-[#0F172A]' 
              : step.completed 
                ? 'bg-white border border-emerald-500 h-8 w-8 text-emerald-600'
                : 'bg-white border-2 border-slate-200 text-slate-400 h-8 w-8';

            return (
              <div key={idx} className="relative z-10 flex flex-row md:flex-col items-center gap-3 md:gap-2 md:text-center w-full max-w-[150px]">
                <div className={`rounded-full flex items-center justify-center shrink-0 transition-all ${circleColor}`}>
                  {stepIcon}
                </div>
                <div>
                  <p className={`text-xs ${step.active ? 'font-bold text-slate-900' : 'font-medium text-[#64748B]'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {step.date || 'TBD'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Details and Sidebar Documents Stack */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Detail specs sheet (Lg Column 2) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Technical Specifications */}
          <div className="bg-white border border-[#E2E8F0] rounded overflow-hidden">
            <div className="bg-[#0F172A] p-4 flex justify-between items-center text-white">
              <h3 className="text-xs font-bold font-mono tracking-widest uppercase">
                Detailed Technical Specifications dossier
              </h3>
              
              <button 
                onClick={() => {
                  if (isEditingSpecs) {
                    handleSaveSpecs();
                  } else {
                    setIsEditingSpecs(true);
                  }
                }}
                className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 transition-all py-1 px-3 rounded"
              >
                <Edit size={12} />
                {isEditingSpecs ? 'Save Details' : 'Edit Details'}
              </button>
            </div>

            <div className="p-5">
              {isEditingSpecs ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Patent Asset Title</label>
                      <input 
                        type="text" 
                        value={editFields.title}
                        onChange={(e) => setEditFields({ ...editFields, title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium focus:ring-1 focus:ring-[#0F172A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">IPC International Code</label>
                      <input 
                        type="text" 
                        value={editFields.ipcClassification}
                        onChange={(e) => setEditFields({ ...editFields, ipcClassification: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono focus:ring-1 focus:ring-[#0F172A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Applicant Entity</label>
                      <input 
                        type="text" 
                        value={editFields.applicantName}
                        onChange={(e) => setEditFields({ ...editFields, applicantName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium focus:ring-1 focus:ring-[#0F172A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Priority Filing Date</label>
                      <input 
                        type="text" 
                        value={editFields.priorityDate}
                        onChange={(e) => setEditFields({ ...editFields, priorityDate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono focus:ring-1 focus:ring-[#0F172A] outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Abstract Summary Analysis</label>
                    <textarea 
                      value={editFields.description}
                      onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#0F172A] outline-none leading-relaxed"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <span className="text-slate-400 font-mono block uppercase text-[10px]">Patent Title</span>
                    <p className="font-semibold text-slate-900 mt-1 leading-relaxed">
                      {activeCase.title}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono block uppercase text-[10px]">IPC Classification Code</span>
                    <p className="font-semibold text-slate-900 mt-1 font-mono">
                      {activeCase.ipcClassification}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono block uppercase text-[10px]">Applicant Claimant</span>
                    <p className="font-semibold text-slate-900 mt-1">
                      {activeCase.applicantName} ({activeCase.applicantOrganization})
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono block uppercase text-[10px]">Priority Assertion Date</span>
                    <p className="font-semibold text-slate-900 mt-1">
                      {activeCase.priorityDate}
                    </p>
                  </div>
                  
                  <div className="sm:col-span-2 pt-3 border-t border-slate-100">
                    <span className="text-slate-400 font-mono block uppercase text-[10px]">Abstract & Claim Boundaries</span>
                    <p className="text-slate-700 leading-relaxed mt-1 text-xs">
                      {activeCase.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Opposition Parties */}
          <div className="bg-white border border-[#E2E8F0] rounded">
            <div className="border-b border-[#E2E8F0] p-4 flex justify-between items-center bg-slate-50">
              <h3 className="text-xs font-bold font-mono uppercase text-slate-900">
                Active Pre-Grant Opposition Partners ({caseOppositions.length})
              </h3>
              <button 
                onClick={() => onNavigateToTab('Oppositions')}
                className="text-xs font-bold text-[#0F172A] hover:underline flex items-center gap-0.5"
              >
                File pre-grant notice <ChevronRight size={14} />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {caseOppositions.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No opposition claims currently logged against this patent application file.
                </div>
              ) : (
                caseOppositions.map((ops) => (
                  <div key={ops.id} className="p-4 flex justify-between items-start gap-4 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{ops.opponentName}</span>
                        <span className="bg-rose-50 text-rose-700 font-mono text-[9px] font-bold py-0.5 px-2 border border-rose-100 rounded">
                          Claimed: {ops.reason}
                        </span>
                      </div>
                      <p className="text-[#64748B] text-xs mt-1 leading-relaxed line-clamp-2">
                        {ops.detailedStatement}
                      </p>
                      
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {ops.evidenceFiles.map((evidence, eIdx) => (
                          <span key={eIdx} className="bg-slate-100 text-slate-700 font-mono text-[10px] py-1 px-2.5 rounded flex items-center gap-1 border border-slate-200">
                            <FileText size={10} />
                            {evidence}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Sidebar Dossier Documents List */}
        <div className="space-y-6">
          
          {/* Documents Box */}
          <div className="bg-white border border-[#E2E8F0] rounded flex flex-col h-full">
            <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50">
              <h3 className="text-xs font-bold font-mono uppercase text-slate-900 flex items-center gap-1.5">
                <FileText size={14} /> Digital Dossier Repository ({caseDocuments.length})
              </h3>
            </div>

            <div className="p-4 space-y-2.5 max-h-[350px] overflow-y-auto custom-scrollbar flex-1">
              {caseDocuments.map((doc) => {
                const isPending = doc.status === 'Pending Approval';
                const containerClass = isPending 
                  ? 'border-amber-200 bg-amber-50/30' 
                  : 'border-slate-200 hover:border-slate-300';

                return (
                  <div 
                    key={doc.id}
                    className={`p-3 border rounded transition-all flex justify-between items-center gap-2 ${containerClass}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={16} className={isPending ? 'text-amber-500' : 'text-slate-600'} />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-900 truncate" title={doc.name}>
                          {doc.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {isPending ? 'Pending Legal Approval' : `${doc.size} • ${doc.uploadedAt}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isPending ? (
                        <button 
                          onClick={() => {
                            // Approve file mockup
                            updateCase(activeCase.id, {});
                            doc.status = 'Approved';
                            addDocument({...doc});
                            deleteDocument(doc.id);
                          }}
                          className="bg-amber-100 hover:bg-emerald-100 text-amber-800 hover:text-emerald-800 px-2.5 py-1 text-[10px] rounded font-bold transition-all"
                          title="Authorize file entry"
                        >
                          Approve
                        </button>
                      ) : (
                        <a 
                          href="#" 
                          onClick={(e) => e.preventDefault()}
                          className="p-1 text-slate-400 hover:text-slate-900 transition-colors"
                          title="Preview"
                        >
                          <Eye size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}

              {caseDocuments.length === 0 && (
                <div className="text-center text-slate-400 text-xs py-10 font-medium">
                  No documents cataloged in this application file.
                </div>
              )}
            </div>

            {/* Simulated Drag & Drop Uploader */}
            <div className="p-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Select upload category:</span>
                <select 
                  value={selectedFileCategory}
                  onChange={(e) => setSelectedFileCategory(e.target.value as any)}
                  className="bg-slate-100 hover:bg-slate-250 p-1 text-[11px] rounded transition-all outline-none"
                >
                  <option value="Patent Application">Patent Application</option>
                  <option value="Prior Art">Prior Art</option>
                  <option value="Opposition Notice">Opposition Notice</option>
                  <option value="Counter Statement">Counter Statement</option>
                </select>
              </div>

              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded p-5 text-center transition-all cursor-pointer ${
                  dragActive 
                    ? 'border-[#0F172A] bg-slate-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Upload size={24} className="text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-900">Drag supporting exhibit or PDF here</p>
                <p className="text-[10px] text-slate-400 mt-1">or click to browse local storage</p>
                
                <input 
                  type="file" 
                  onChange={handleManualUpload}
                  className="hidden" 
                  id="file-manual-chooser" 
                />
                
                <label 
                  htmlFor="file-manual-chooser"
                  className="mt-3 inline-block bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-[10px] font-bold py-1 px-2.5 rounded transition-all border border-slate-200"
                >
                  Choose File
                </label>
              </div>
            </div>
          </div>

          {/* Internal tracking notes */}
          <div className="bg-[#FFFDF4] border border-[#F2ECE4] rounded p-5">
            <h3 className="text-xs font-bold font-mono uppercase text-[#4D3C25] flex items-center gap-1.5 mb-4">
              <MessageSquare size={14} /> Internal Officer Tracking Notes
            </h3>
            
            <div className="space-y-3">
              {internalNotes.map((note) => (
                <div key={note.id} className="text-xs border-l-2 border-[#D9CFC4] pl-3 py-1 space-y-1">
                  <p className="text-slate-800 leading-relaxed font-sans">{note.text}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    — {note.author} • {note.time}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#F2ECE4] space-y-2">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Log internal note, technical discrepancy, or examiner task..."
                rows={2}
                className="w-full bg-[#FFFDF2] border border-[#EBE3D7] rounded p-2 text-xs text-slate-800 focus:ring-1 focus:ring-[#0F172A] outline-none"
              />
              <button
                onClick={handleAddNote}
                className="w-full bg-[#0F172A] hover:bg-slate-950 text-white font-bold text-xs py-2 rounded transition-all flex items-center justify-center gap-1 shadow-sm"
              >
                <Plus size={12} /> Log Internal Note
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
