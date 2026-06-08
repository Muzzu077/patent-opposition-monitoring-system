/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { usePomsStore } from '../store';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  AlertTriangle, 
  Layers, 
  HelpCircle,
  Briefcase, 
  Clock, 
  ArrowUpRight,
  TrendingDown,
  CheckCircle,
  BarChart2,
  Calendar
} from 'lucide-react';

export default function ReportsTab() {
  const { cases, oppositions, addNotification, currentUser } = usePomsStore();
  const [activeReportType, setActiveReportType] = useState<'delays' | 'backlog' | 'performance'>('delays');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Dynamic Case calculations based on Delay Detection thresholds
  const over30DaysCases = useMemo(() => cases.filter(c => c.pendingDays > 30 && c.status !== 'Approved' && c.status !== 'Rejected'), [cases]);
  const over60DaysCases = useMemo(() => cases.filter(c => c.pendingDays > 60 && c.status !== 'Approved' && c.status !== 'Rejected'), [cases]);
  const over90DaysCases = useMemo(() => cases.filter(c => c.pendingDays > 90 && c.status !== 'Approved' && c.status !== 'Rejected'), [cases]);

  // Officer Workloads
  const officerWorkloads = useMemo(() => {
    const counts: Record<string, { active: number, averageLag: number, resolved: number }> = {};
    cases.forEach(c => {
      const officer = c.assignedOfficer;
      if (!counts[officer]) {
        counts[officer] = { active: 0, averageLag: 0, resolved: 0 };
      }
      
      if (c.status === 'Approved' || c.status === 'Rejected') {
        counts[officer].resolved += 1;
      } else {
        counts[officer].active += 1;
        counts[officer].averageLag += c.pendingDays;
      }
    });

    return Object.entries(counts).map(([name, data]) => ({
      name,
      active: data.active,
      resolved: data.resolved,
      averageLag: data.active > 0 ? Math.round(data.averageLag / data.active) : 0
    }));
  }, [cases]);

  // Backlog coefficients
  const backlogCoefficients = useMemo(() => {
    const total = cases.length || 1;
    const submitted = cases.filter(c => c.status === 'Submitted').length;
    const examination = cases.filter(c => c.status === 'Under Examination').length;
    const opposition = cases.filter(c => c.status === 'Opposition Filed' || c.status === 'Hearing Scheduled').length;
    
    return [
      { name: 'Intake Registration Stage', count: submitted, percentage: Math.round((submitted/total)*100) },
      { name: 'Active Patent Examination', count: examination, percentage: Math.round((examination/total)*100) },
      { name: 'Opposition Trial Hearings', count: opposition, percentage: Math.round((opposition/total)*100) }
    ];
  }, [cases]);

  const handleExport = (format: 'PDF' | 'Excel') => {
    const fileName = `POMS_Sovereign_Audit_Report_${new Date().toISOString().split('T')[0]}`;
    setIsExporting(format);

    setTimeout(() => {
      setIsExporting(null);
      addNotification({
        type: 'Decision Published',
        title: `Report generated successfully (${format})`,
        description: `Form compliance file '${fileName}.${format === 'PDF' ? 'pdf' : 'xlsx'}' saved securely. Log entry recorded by ${currentUser.name}.`,
        caseId: 'SYSTEM',
        severity: 'info'
      });
    }, 1500);
  };

  return (
    <div className="space-y-6 fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-sans tracking-tight text-[#0F172A]">Compliance Reports & Analytics</h2>
          <p className="text-[#64748B] text-sm mt-1">Generate High Court audit records, administrative lag studies, and officer SLA indices.</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleExport('PDF')}
            disabled={isExporting !== null}
            className="bg-[#0F172A] hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download size={14} />
            {isExporting === 'PDF' ? 'Packaging PDF...' : 'Download PDF Record'}
          </button>
          
          <button 
            onClick={() => handleExport('Excel')}
            disabled={isExporting !== null}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet size={14} />
            {isExporting === 'Excel' ? 'Structuring spreadsheet...' : 'Export Excel Ledger'}
          </button>
        </div>
      </div>

      {/* Analytics Tabs buttons bar */}
      <div className="border-b border-slate-200 flex gap-4 text-sm font-semibold select-none">
        <button 
          onClick={() => setActiveReportType('delays')}
          className={`pb-3 transition-colors ${activeReportType === 'delays' ? 'border-b-2 border-[#0F172A] text-[#0F172A] font-bold' : 'text-[#64748B] hover:text-[#0F172A]'}`}
        >
          Delhi HC Delay Analysis
        </button>
        <button 
          onClick={() => setActiveReportType('backlog')}
          className={`pb-3 transition-colors ${activeReportType === 'backlog' ? 'border-b-2 border-[#0F172A] text-[#0F172A] font-bold' : 'text-[#64748B] hover:text-[#0F172A]'}`}
        >
          Status Backlog Coefficient
        </button>
        <button 
          onClick={() => setActiveReportType('performance')}
          className={`pb-3 transition-colors ${activeReportType === 'performance' ? 'border-b-2 border-[#0F172A] text-[#0F172A] font-bold' : 'text-[#64748B] hover:text-[#0F172A]'}`}
        >
          Officer SLA Performance
        </button>
      </div>

      {/* Conditionally Render Reports Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main report view (Lg Column 2) */}
        <div className="lg:col-span-2 bg-white rounded border border-[#E2E8F0] p-5 shadow-xs">
          
          {activeReportType === 'delays' && (
            <div className="space-y-6">
              <div>
                <span className="bg-red-50 text-red-700 font-mono text-[9px] font-bold py-0.5 px-2 rounded uppercase tracking-wider border border-red-100">
                  Administrative Lag Metric
                </span>
                <h3 className="font-bold text-slate-900 mt-2 text-base">Delhi HC Delay Analysis Grid</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Summary of pending pre-grant cases breaching target timelines:</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded border border-amber-100 bg-amber-50/20 text-center">
                  <p className="text-xs text-amber-800 font-semibold uppercase tracking-wider">Lag &gt; 30 Days</p>
                  <p className="font-bold text-3xl text-amber-600 mt-1 font-mono">{over30DaysCases.length}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">Yellow Stage Alerts</p>
                </div>
                <div className="p-4 rounded border border-orange-100 bg-orange-50/20 text-center">
                  <p className="text-xs text-orange-800 font-semibold uppercase tracking-wider">Lag &gt; 60 Days</p>
                  <p className="font-bold text-3xl text-orange-600 mt-1 font-mono">{over60DaysCases.length}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">Orange Stage Escalate</p>
                </div>
                <div className="p-4 rounded border border-red-150 bg-red-50/20 text-center">
                  <p className="text-xs text-red-850 font-semibold uppercase tracking-wider">Lag &gt; 90 Days</p>
                  <p className="font-bold text-3xl text-red-650 mt-1 font-mono">{over90DaysCases.length}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">High-Risk Negligence</p>
                </div>
              </div>

              {/* Delayed Cases list table snippet */}
              <div className="border border-[#E2E8F0] rounded overflow-hidden">
                <div className="bg-slate-50 p-3 text-xs font-mono font-bold text-slate-900 border-b border-[#E2E8F0]">
                  Registry files exceeding 30-day limits
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {over30DaysCases.map(c => (
                    <div key={c.id} className="p-3 flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-bold text-slate-950 font-mono">{c.id}</p>
                        <p className="text-slate-500 font-medium truncate max-w-[280px] mt-0.5">{c.title}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-red-100 border border-red-150 text-red-800 font-mono text-[10px] font-bold py-0.5 px-1.5 rounded">
                          {c.pendingDays} Days Lag
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{c.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeReportType === 'backlog' && (
            <div className="space-y-6">
              <div>
                <span className="bg-[#0F172A] text-white font-mono text-[9px] font-bold py-0.5 px-2 rounded uppercase tracking-wider">
                  Administrative Coefficient
                </span>
                <h3 className="font-bold text-slate-900 mt-2 text-base">Backlog Category Coefficient</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Distribution of cases piling in early processing stages:</p>
              </div>

              <div className="space-y-4">
                {backlogCoefficients.map((coef, idx) => (
                  <div key={idx} className="p-3 border border-slate-100 rounded hover:border-[#E2E8F0] transition-all flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900">{coef.name}</p>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-[#0F172A] h-full rounded-full transition-all duration-1000" style={{ width: `${coef.percentage}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-[#0F172A] font-mono">{coef.percentage}%</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{coef.count} Cases</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeReportType === 'performance' && (
            <div className="space-y-6">
              <div>
                <span className="bg-sky-50 text-sky-700 font-mono text-[9px] font-bold py-0.5 px-2 rounded uppercase tracking-wider border border-sky-100">
                  Officer Load Tracking
                </span>
                <h3 className="font-bold text-slate-900 mt-2 text-base">Officer Workload & SLA indices</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Active filings assigned per patent officer and average lag duration:</p>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded overflow-hidden">
                <div className="grid grid-cols-4 bg-slate-50 text-slate-700 p-3 font-mono text-[10px] font-bold">
                  <div>Officer Name</div>
                  <div className="text-center">Active Docket</div>
                  <div className="text-center">Decrees Completed</div>
                  <div className="text-right">Average Lag SLA</div>
                </div>

                {officerWorkloads.map((officer, index) => (
                  <div key={index} className="grid grid-cols-4 p-3 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-700 items-center">
                    <div>{officer.name}</div>
                    <div className="text-center font-bold text-slate-900">{officer.active}</div>
                    <div className="text-center text-emerald-600 font-bold">{officer.resolved}</div>
                    <div className="text-right">
                      <span className={`py-0.5 px-2 rounded-full font-mono font-bold text-[10px] ${officer.averageLag > 50 ? 'bg-red-100 text-red-800' : 'bg-emerald-150 text-emerald-800'}`}>
                        {officer.averageLag} Days average
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Informative Side Panel (Lg Column 1) */}
        <div className="space-y-6">
          
          {/* Directive compliance guide */}
          <div className="bg-slate-[#FCFCFC] border border-[#E2E8F0] p-5 rounded">
            <h4 className="font-bold text-xs font-mono uppercase text-[#0F172A] mb-3 select-none flex items-center gap-1">
              <Calendar size={14} /> Delhi HC Directive Check
            </h4>
            <p className="text-xs text-[#64748B] leading-relaxed mb-4">
              To resolve pre-grant patent opposition delays, the Delhi High Court directive challenges administrative negligence under strict operational standards. 
            </p>

            <div className="space-y-3 font-medium text-xs text-slate-800">
              <div className="flex gap-2.5">
                <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <p>Ensure no pre-grant opposition remains pending beyond a mandated 60-day window without technical hearing notices.</p>
              </div>
              <div className="flex gap-2.5">
                <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <p>Consolidated digital dossiers must show complete transparency metrics to prevent unilateral backlog shelving.</p>
              </div>
              <div className="flex gap-2.5">
                <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <p>Audit trail logging tracks all examiner changes to safeguard accountability on high-stakes pharma files.</p>
              </div>
            </div>
          </div>

          {/* Quick analysis summary box */}
          <div className="bg-[#FFFDF4] border border-[#F2ECE4] p-5 rounded space-y-4">
            <h4 className="font-bold text-xs font-mono uppercase text-[#4D3C25] flex items-center gap-1.5">
              <Clock size={14} /> Backlog Speed Coefficient
            </h4>
            
            <div className="text-xs space-y-3">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Average Docket Lag Duration:</span>
                <span className="font-bold text-slate-900 font-mono">61 Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Pre-Grant Challenge Ratio:</span>
                <span className="font-bold text-slate-900 font-mono">2.8 Oppositions/Case</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Target Resolve Target:</span>
                <span className="font-bold text-[#10B981] font-mono">30 Days Max</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
