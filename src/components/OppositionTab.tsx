/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { usePomsStore } from '../store';
import { Opposition, OppositionStatus, PatentCase } from '../types';
import { 
  Plus, 
  Search, 
  FileText, 
  Trash2, 
  Gavel, 
  AlertTriangle,
  Users,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';

export default function OppositionTab({
  onSelectCaseId,
  onNavigateToTab,
  openOppositionModal
}: {
  onSelectCaseId: (caseId: string) => void;
  onNavigateToTab: (tab: string) => void;
  openOppositionModal: () => void;
}) {
  const { oppositions, cases } = usePomsStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | OppositionStatus>('All');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Filter pipeline
  const filteredOppositions = useMemo(() => {
    return oppositions.filter(ops => {
      const matchesSearch = 
        ops.id.toLowerCase().includes(searchText.toLowerCase()) ||
        ops.caseId.toLowerCase().includes(searchText.toLowerCase()) ||
        ops.opponentName.toLowerCase().includes(searchText.toLowerCase()) ||
        ops.reason.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || ops.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [oppositions, searchText, statusFilter]);

  // Page partition
  const paginatedOppositions = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredOppositions.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredOppositions, currentPage]);

  const totalPages = Math.ceil(filteredOppositions.length / itemsPerPage) || 1;

  // Static stats indicators
  const statsActive = oppositions.length;
  const statsHearingsCount = 3;
  const statsAvgResolution = '214d';
  const statsApproval = '68%';

  const getStatusBadge = (status: OppositionStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold flex items-center w-fit gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
        );
      case 'Under Review':
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold flex items-center w-fit gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Under Review
          </span>
        );
      case 'Hearing Scheduled':
        return (
          <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-bold flex items-center w-fit gap-1.5">
            <Calendar size={12} className="text-red-500" />
            Hearing Scheduled
          </span>
        );
      case 'Resolved':
        return (
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center w-fit gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Dispute Resolved
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-sans tracking-tight text-[#0F172A]">Pre-Grant Opposition filings</h2>
          <p className="text-[#64748B] text-sm mt-1">Review third-party claims, grounds of anticipation, and prior art notices.</p>
        </div>
        
        <button 
          onClick={openOppositionModal}
          className="bg-[#0F172A] text-white hover:bg-slate-800 transition-all font-semibold rounded px-5 py-2.5 flex items-center gap-2 shadow-sm text-sm"
        >
          <Plus size={16} />
          File pre-grant opposition
        </button>
      </div>

      {/* Stats Bento Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#E2E8F0] p-4 rounded flex flex-col justify-between">
          <span className="text-[#64748B] text-xs font-medium uppercase tracking-wider block">Active Disputes</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold font-sans text-slate-900">{statsActive}</span>
            <span className="text-emerald-600 text-xs font-bold font-mono">+12% vs LY</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4 rounded flex flex-col justify-between">
          <span className="text-[#64748B] text-xs font-medium uppercase tracking-wider block">Hearings Dispatched</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold font-sans text-slate-900">{statsHearingsCount}</span>
            <span className="text-amber-500 text-xs font-bold font-mono">High priority pending</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4 rounded flex flex-col justify-between">
          <span className="text-[#64748B] text-xs font-medium uppercase tracking-wider block">Avg Resolution SLA</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold font-sans text-slate-900">{statsAvgResolution}</span>
            <span className="text-red-500 text-xs font-bold font-mono">-4d speed change</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4 rounded flex flex-col justify-between">
          <span className="text-[#64748B] text-xs font-medium uppercase tracking-wider block">Pre-Grant rejection rate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold font-sans text-slate-900">{statsApproval}</span>
            <span className="text-emerald-700 text-xs font-semibold">Consistent yield</span>
          </div>
        </div>
      </div>

      {/* Core Table View Container */}
      <div className="bg-white border border-[#E2E8F0] rounded overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Opposition ID, Case ID or opponent..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 rounded pl-10 pr-4 py-2 border border-[#E2E8F0] text-sm focus:ring-1 focus:ring-[#0F172A] outline-none"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white border border-[#E2E8F0] p-2 text-xs font-medium text-[#64748B] rounded focus:ring-1 focus:ring-[#0F172A] outline-none w-full sm:w-auto"
            >
              <option value="All">Filter Status (All)</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Hearing Scheduled">Hearing Scheduled</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Responsive Table Grid */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F172A] text-white border-b border-[#E2E8F0]">
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Opposition ID</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Patent ID Reference</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Opponent Entity</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Dispute Grounds</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Submission Date</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-right text-right">Link</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {paginatedOppositions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm font-medium">
                    No matching pre-grant oppositions found.
                  </td>
                </tr>
              ) : (
                paginatedOppositions.map((ops) => (
                  <tr 
                    key={ops.id}
                    onClick={() => {
                      onSelectCaseId(ops.caseId);
                      onNavigateToTab('Case Tracking');
                    }}
                    className="hover:bg-slate-50/55 transition-all cursor-pointer group"
                  >
                    <td className="px-5 py-4 text-xs font-bold text-slate-950 font-mono">
                      {ops.id}
                    </td>
                    
                    <td className="px-5 py-4 text-xs font-bold text-[#0F172A] underline group-hover:text-slate-900">
                      {ops.caseId}
                    </td>

                    <td className="px-5 py-4 text-xs font-medium text-slate-800">
                      {ops.opponentName}
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-600 max-w-[150px] truncate" title={ops.reason}>
                      {ops.reason}
                    </td>

                    <td className="px-5 py-4 text-xs font-mono text-[#64748B]">
                      {ops.submissionDate}
                    </td>

                    <td className="px-5 py-4">
                      {getStatusBadge(ops.status)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button className="text-slate-400 group-hover:text-[#0F172A] p-1.5 hover:bg-slate-50 rounded transition-all">
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="px-5 py-3.5 bg-slate-50 border-t border-[#E2E8F0] flex items-center justify-between">
            <span className="text-xs text-[#64748B]">
              Showing <span className="font-semibold text-slate-900">{filteredOppositions.length}</span> entries on this filter group
            </span>
            <div className="flex items-center gap-1">
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

      {/* Primary bento system insights row matching mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* System Insights modal */}
        <div className="lg:col-span-2 bg-[#0F172A] text-white rounded p-5 relative overflow-hidden flex flex-col justify-between" style={{ minHeight: '180px' }}>
          <div>
            <span className="bg-white/10 text-white font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
              Administrative Insights
            </span>
            <h3 className="text-xl font-bold font-sans tracking-tight mt-3 mb-1">Pre-Grant Filing Indicators</h3>
            <p className="text-slate-300 text-xs max-w-lg leading-relaxed">
              Our dynamic tracking indexes notice a 24% boost in pre-grant oppositions pertaining to biotechnology patents and artificial intelligence arrays compared to the same operational period last fiscal year.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
            <div className="flex gap-3 items-start">
              <div className="bg-white/10 p-2 rounded text-emerald-400">
                <TrendingUp size={16} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Biotech Surge Notice</p>
                <p className="text-slate-400 mt-0.5 leading-normal">Oppositions are heavily clustered around novel gene synthesis methodologies.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="bg-white/10 p-2 rounded text-amber-400">
                <Clock size={16} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Pending Applicant Responds</p>
                <p className="text-slate-400 mt-0.5 leading-normal">14 files are entering the critical 30-day response window under local regulations.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary warning feed card list matching mockup 2 */}
        <div className="bg-slate-100 rounded border border-[#E2E8F0] p-5">
          <span className="text-[#64748B] text-xs font-bold uppercase tracking-wider">Administrative Alerts</span>
          
          <ul className="space-y-4 mt-4">
            <li className="flex gap-3 text-xs leading-normal">
              <AlertTriangle size={18} className="text-[#0F172A] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">New Evidence Logged</p>
                <p className="text-[#64748B]">Supporting exhibits and lab trial reports have been submitted for pre-grant dispute #OP-2023-9842.</p>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">2 hours ago</span>
              </div>
            </li>

            <li className="flex gap-3 text-xs leading-normal">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              <div>
                <p className="font-bold text-slate-900">Opposition Closed #OP-2023-5512</p>
                <p className="text-[#64748B]">Legal officers formally approved claim limits, rejection notice dismissed with prejudice.</p>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">5 hours ago</span>
              </div>
            </li>

            <li className="flex gap-3 text-xs leading-normal">
              <AlertTriangle size={18} className="text-[#0F172A] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Deadline Approaching</p>
                <p className="text-[#64748B]">Counter response for disputed filing JP-33412-K must be recorded strictly within 48 hours to avert cancellation.</p>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">Yesterday</span>
              </div>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
}
