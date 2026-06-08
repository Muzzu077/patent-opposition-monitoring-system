/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { usePomsStore } from '../store';
import { PatentCase, PatentStatus, PriorityLevel } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  Clock,
  Briefcase,
  CheckCircle,
  HelpCircle,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';

export default function CaseManagementTab({
  onSelectCaseId,
  onNavigateToTab,
  openFilingModal
}: {
  onSelectCaseId: (caseId: string) => void;
  onNavigateToTab: (tab: string) => void;
  openFilingModal: () => void;
}) {
  const { cases, deleteCase, updateCase } = usePomsStore();
  const [internalSearch, setInternalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PatentStatus>('All');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Search & Filter sequence
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = 
        c.id.toLowerCase().includes(internalSearch.toLowerCase()) ||
        c.title.toLowerCase().includes(internalSearch.toLowerCase()) ||
        c.applicantName.toLowerCase().includes(internalSearch.toLowerCase()) ||
        c.applicantOrganization.toLowerCase().includes(internalSearch.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cases, internalSearch, statusFilter]);

  // Page partition
  const paginatedCases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCases.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCases, currentPage]);

  const totalPages = Math.ceil(filteredCases.length / itemsPerPage) || 1;

  // Computed counters
  const totalActiveCases = cases.length;
  const urgentCount = cases.filter(c => c.pendingDays > 60 && c.status !== 'Approved' && c.status !== 'Rejected').length;

  const getSeverityBadge = (pendingDays: number) => {
    if (pendingDays > 90) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-full">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          Red ({pendingDays} Days Overdue)
        </span>
      );
    } else if (pendingDays > 60) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-full">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          Orange ({pendingDays} Days Delay)
        </span>
      );
    } else if (pendingDays > 30) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Yellow ({pendingDays} Days Alert)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Green ({pendingDays} Days Standard)
        </span>
      );
    }
  };

  const getStatusStyle = (status: PatentStatus) => {
    switch (status) {
      case 'Submitted':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Under Examination':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Opposition Filed':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Hearing Scheduled':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Decision Pending':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCase(id);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-6 fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-sans tracking-tight text-[#0F172A]">Patent Case Management</h2>
          <p className="text-[#64748B] text-sm mt-1">Review active filings, assign examining officers, and update regulatory stages.</p>
        </div>
        
        <button 
          onClick={openFilingModal}
          className="inline-flex items-center gap-2 bg-[#0F172A] text-white hover:bg-slate-800 transition-all font-semibold rounded px-5 py-2.5 shadow-sm text-sm"
        >
          <Plus size={16} />
          Register New Case
        </button>
      </div>

      {/* Stats Bento Layout & Filter Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
        
        {/* Stat Counter */}
        <div className="bg-white p-4 rounded border border-[#E2E8F0] flex items-center gap-4">
          <div className="p-3 bg-slate-50 text-[#0F172A] rounded-lg">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-medium uppercase tracking-wide">Patent Assets</p>
            <p className="text-xl font-bold text-slate-900">{totalActiveCases} Active Cases</p>
          </div>
        </div>

        {/* Severe Count */}
        <div className="bg-white p-4 rounded border border-[#E2E8F0] flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs text-red-500 font-bold uppercase tracking-wide">Limit Breach</p>
            <p className="text-xl font-bold text-slate-900">{urgentCount} Flagged (90+ Days)</p>
          </div>
        </div>

        {/* Inline Filter Buttons strip */}
        <div className="lg:col-span-2 bg-slate-50 p-1.5 rounded border border-[#E2E8F0] flex flex-wrap gap-1 items-center">
          <span className="text-xs font-semibold text-[#64748B] px-2">Filter state:</span>
          {['All', 'Submitted', 'Under Examination', 'Opposition Filed', 'Approved'].map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status as any);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded text-xs transition-all ${
                  isActive 
                    ? 'bg-[#0F172A] text-white font-bold shadow-xs' 
                    : 'text-[#64748B] hover:text-[#0F172A] font-medium'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

      </div>

      {/* Table search action bar */}
      <div className="bg-white rounded border border-[#E2E8F0] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Patent ID, Title, or Applicant..."
              value={internalSearch}
              onChange={(e) => {
                setInternalSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 rounded pl-10 pr-4 py-2 border border-[#E2E8F0] text-sm focus:ring-1 focus:ring-[#0F172A] outline-none"
            />
          </div>
          
          <div className="text-xs text-[#64748B]">
            Showing <span className="font-bold text-slate-900">{filteredCases.length}</span> of {totalActiveCases} register cases
          </div>
        </div>

        {/* Data Grid Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-sans border-b border-[#E2E8F0]">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Patent ID</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Title / Classification</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Applicant Entity</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Registration Date</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Assigned Official</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Severity Warning</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {paginatedCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                    No active patent cases matching the criteria. Try a different search term or register a new one.
                  </td>
                </tr>
              ) : (
                paginatedCases.map((c) => (
                  <tr 
                    key={c.id}
                    onClick={() => {
                      onSelectCaseId(c.id);
                      onNavigateToTab('Case Tracking');
                    }}
                    className="hover:bg-slate-50/55 transition-all cursor-pointer group"
                  >
                    {/* Patent ID */}
                    <td className="px-6 py-4 font-mono font-bold text-sm text-[#0F172A] group-hover:underline">
                      {c.id}
                    </td>

                    {/* Title */}
                    <td className="px-6 py-4 max-w-xs">
                      <div>
                        <p className="font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-[#0F172A]">
                          {c.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {c.ipcClassification}
                        </p>
                      </div>
                    </td>

                    {/* Applicant */}
                    <td className="px-6 py-4 text-xs">
                      <div>
                        <p className="font-medium text-slate-800 truncate max-w-[150px]">{c.applicantName}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{c.applicantOrganization}</p>
                      </div>
                    </td>

                    {/* Filing Date */}
                    <td className="px-6 py-4 text-xs font-mono text-[#64748B]">
                      {c.filingDate}
                    </td>

                    {/* Assigned Officer */}
                    <td className="px-6 py-4 text-xs text-slate-800 font-medium">
                      {c.assignedOfficer === 'Unassigned' ? (
                        <span className="text-red-500 font-semibold bg-red-50 py-0.5 px-2 rounded-full border border-red-100">Unassigned Case</span>
                      ) : (
                        c.assignedOfficer
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(c.status)}`}>
                        {c.status}
                      </span>
                    </td>

                    {/* Severity Badge */}
                    <td className="px-6 py-4">
                      {getSeverityBadge(c.pendingDays)}
                    </td>

                    {/* Row Actions */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {showDeleteConfirm === c.id ? (
                        <div className="flex justify-end gap-1 items-center">
                          <button 
                            onClick={(e) => handleDelete(c.id, e)} 
                            className="text-red-600 hover:text-red-800 font-bold text-xs bg-red-50 p-1.5 rounded transition-all"
                            title="Confirm delete"
                          >
                            Yes, delete
                          </button>
                          <button 
                            onClick={() => setShowDeleteConfirm(null)} 
                            className="text-[#64748B] hover:text-[#0F172A] text-xs bg-slate-100 p-1.5 rounded transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => {
                              onSelectCaseId(c.id);
                              onNavigateToTab('Case Tracking');
                            }}
                            className="p-1 hover:bg-slate-100 text-slate-600 hover:text-[#0F172A] rounded transition-all"
                            title="Track timeline details"
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button 
                            onClick={() => setShowDeleteConfirm(c.id)}
                            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-red-600 rounded transition-all"
                            title="Delete Case from database"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer dynamic pagination controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-[#E2E8F0] flex items-center justify-between">
            <span className="text-xs text-[#64748B]">
              Page <span className="font-bold text-slate-900">{currentPage}</span> of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1 border border-[#E2E8F0] hover:bg-white rounded transition-colors disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 text-xs font-semibold rounded flex items-center justify-center transition-colors ${
                    currentPage === i + 1 
                      ? 'bg-[#0F172A] text-white' 
                      : 'hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1 border border-[#E2E8F0] hover:bg-white rounded transition-colors disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Structural help drawer explaining delays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Severity Logic explanation */}
        <div className="bg-white border border-[#E2E8F0] rounded p-5">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-[#0F172A]" />
            Administrative Negligence & Severity Meter
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed mb-4">
            Under Delhi High Court case management optimization models, delays in resolving pre-grant patent oppositions are auto-classified mathematically. This forces high-priority escalation logs:
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 bg-emerald-50 rounded border border-emerald-100">
              <span className="font-bold text-emerald-800 flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                Green Priority (0 - 30 days)
              </span>
              <span className="text-emerald-700 font-mono font-bold">Standard filing queue</span>
            </div>

            <div className="flex justify-between items-center p-2 bg-amber-50 rounded border border-amber-100">
              <span className="font-bold text-amber-800 flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                Yellow Priority (31 - 60 days)
              </span>
              <span className="text-amber-700 font-mono font-bold">Examiner warning dispatched</span>
            </div>

            <div className="flex justify-between items-center p-2 bg-orange-50 rounded border border-orange-100">
              <span className="font-bold text-orange-800 flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                Orange Priority (61 - 90 days)
              </span>
              <span className="text-orange-700 font-mono font-bold">Delhi HC warning triggered</span>
            </div>

            <div className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-100">
              <span className="font-bold text-red-800 flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" />
                Red Priority (90+ days)
              </span>
              <span className="text-red-700 font-mono font-bold">Critical - Escalated to Director</span>
            </div>
          </div>
        </div>

        {/* Portfolio insights graphic matching Mockup 3 */}
        <div className="relative rounded overflow-hidden border border-[#E2E8F0] p-6 h-full flex flex-col justify-between text-white" style={{ minHeight: '220px' }}>
          <img 
            alt="Patent library stacks" 
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80" 
            className="absolute inset-0 w-full h-full object-cover brightness-[0.25] pointer-events-none"
            referrerPolicy="no-referrer"
          />
          <div className="relative z-10">
            <span className="bg-white/10 text-white font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded">
              Administrative Insight
            </span>
            <h4 className="font-bold text-xl font-sans tracking-tight mt-2 mb-1">Portfolio & HC Backlog Insights</h4>
            <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
              Instantly fetch and parse high-stakes opposition dependencies, cross-linking active pre-grant disputes against examiner release latency indexes.
            </p>
          </div>
          <button 
            onClick={() => onNavigateToTab('Reports')}
            className="relative z-10 self-start mt-4 border border-white hover:bg-white hover:text-slate-900 transition-all text-xs font-semibold px-4 py-2 rounded flex items-center gap-1"
          >
            Download PDF Audit Report
            <ArrowUpRight size={14} />
          </button>
        </div>

      </div>

    </div>
  );
}
