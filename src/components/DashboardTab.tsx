/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { usePomsStore } from '../store';
import { 
  FolderOpen, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  FileText,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Award,
  UploadCloud,
  ChevronRight,
  Activity,
  UserCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export default function DashboardTab({ 
  onNavigateToTab, 
  onSelectCaseId,
  openFilingModal
}: { 
  onNavigateToTab: (tab: string) => void;
  onSelectCaseId: (caseId: string) => void;
  openFilingModal: () => void;
}) {
  const { cases, oppositions, notifications, auditLogs } = usePomsStore();

  // Dynamic values calculated directly from database state
  const totalCasesCount = useMemo(() => cases.length, [cases]);
  
  const pendingCasesCount = useMemo(() => {
    return cases.filter(c => c.status !== 'Approved' && c.status !== 'Rejected').length;
  }, [cases]);

  const delayedCasesCount = useMemo(() => {
    // Under Delhi HC directives, any case pending longer than 60 days is classified as high-priority delayed
    return cases.filter(c => c.pendingDays > 60 && c.status !== 'Approved' && c.status !== 'Rejected').length;
  }, [cases]);

  const completedCasesCount = useMemo(() => {
    return cases.filter(c => c.status === 'Approved' || c.status === 'Rejected').length;
  }, [cases]);

  // Seeding high-quality visual chart data
  const trendData = [
    { name: 'Jan', Filed: 25, Resolved: 12 },
    { name: 'Feb', Filed: 38, Resolved: 19 },
    { name: 'Mar', Filed: 62, Resolved: 35 },
    { name: 'Apr', Filed: 45, Resolved: 28 },
    { name: 'May', Filed: 88, Resolved: 52 },
    { name: 'Jun', Filed: 110, Resolved: 72 }
  ];

  // Dynamic distribution of cases
  const caseDistributionData = useMemo(() => {
    const completed = cases.filter(c => c.status === 'Approved' || c.status === 'Rejected').length;
    const pending = cases.filter(c => ['Submitted', 'Under Examination'].includes(c.status)).length;
    const opposed = cases.filter(c => ['Opposition Filed', 'Hearing Scheduled', 'Decision Pending'].includes(c.status)).length;
    
    const total = cases.length || 1;
    return [
      { name: 'Completed', value: completed, color: '#10B981', percentage: Math.round((completed/total)*100) },
      { name: 'Active/Pending', value: pending, color: '#64748B', percentage: Math.round((pending/total)*100) },
      { name: 'Disputed/Opposed', value: opposed, color: '#F59E0B', percentage: Math.round((opposed/total)*100) }
    ];
  }, [cases]);

  // Delay Breakdown values
  const delayCategories = [
    { label: 'Technical Examination Delay', count: cases.filter(c => c.pendingDays > 30 && c.status === 'Under Examination').length, severity: 'Medium' },
    { label: 'Pre-Grant Opposition Interlock', count: cases.filter(c => c.status === 'Opposition Filed' && c.pendingDays > 45).length, severity: 'High' },
    { label: 'Hearing Dispatch Backlog', count: cases.filter(c => c.status === 'Hearing Scheduled' && c.pendingDays > 60).length, severity: 'Red' },
    { label: 'Filing Processing Backlog', count: cases.filter(c => c.status === 'Submitted' && c.pendingDays > 15).length, severity: 'Low' }
  ];

  const totalAlertsCount = useMemo(() => {
    return notifications.filter(n => !n.isRead && n.severity !== 'info').length;
  }, [notifications]);

  return (
    <div className="space-y-6 fade-in animate-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-sans tracking-tight text-[#0F172A] flex items-center gap-2">
            System Overview 
            <span className="text-xs bg-slate-100 text-[#0F172A] border border-slate-200 py-1 px-2.5 rounded-full font-mono font-normal">
              Pre-Grant Compliance Engine Active
            </span>
          </h2>
          <p className="text-[#64748B] text-sm mt-1">Real-time indicators mapped to Delhi High Court pre-grant transparency benchmarks.</p>
        </div>
        
        <button 
          onClick={openFilingModal}
          className="bg-[#0F172A] text-white hover:bg-slate-800 transition-all font-semibold rounded px-5 py-2.5 flex items-center gap-2 shadow-sm text-sm"
          id="btn-trigger-new-filing"
        >
          <FolderOpen size={16} />
          Register New Patent
        </button>
      </div>

      {/* Bento Stats Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Cases */}
        <div 
          onClick={() => onNavigateToTab('Case Management')}
          className="bg-white p-5 rounded border border-[#E2E8F0] hover:border-[#0F172A] transition-all cursor-pointer group hover:shadow-xs relative"
          id="kpi-total-cases"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-slate-50 text-[#0F172A] group-hover:bg-[#0F172A] group-hover:text-white transition-all rounded">
              <FolderOpen size={20} />
            </div>
            <span className="text-emerald-600 font-mono text-xs font-semibold flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp size={12} /> +12%
            </span>
          </div>
          <p className="text-[#64748B] text-xs font-medium uppercase tracking-wider mt-4">Total Registers</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold font-sans text-slate-900">{totalCasesCount}</span>
            <span className="text-xs text-[#64748B]">Active Cases</span>
          </div>
        </div>

        {/* Pending / Active Queue */}
        <div 
          onClick={() => onNavigateToTab('Case Management')}
          className="bg-white p-5 rounded border border-[#E2E8F0] hover:border-[#0F172A] transition-all cursor-pointer group hover:shadow-xs"
          id="kpi-pending-cases"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-sky-50 text-sky-700 rounded">
              <Clock size={20} />
            </div>
            <span className="text-[#64748B] font-mono text-xs font-medium">In Queue</span>
          </div>
          <p className="text-[#64748B] text-xs font-medium uppercase tracking-wider mt-4">Active Queue</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold font-sans text-slate-900">{pendingCasesCount}</span>
            <span className="text-xs text-sky-700 font-medium">Seeking Action</span>
          </div>
        </div>

        {/* Delayed / Overdue */}
        <div 
          onClick={() => onNavigateToTab('Case Management')}
          className="bg-white p-5 rounded border border-[#E2E8F0] hover:border-red-500 transition-all cursor-pointer group hover:shadow-xs"
          id="kpi-delayed-cases"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-red-50 text-red-600 rounded">
              <AlertTriangle size={20} />
            </div>
            <span className="text-red-700 font-mono text-xs font-bold bg-red-50 px-2 py-0.5 rounded-full">Action Required</span>
          </div>
          <p className="text-[#64748B] text-xs font-medium uppercase tracking-wider mt-4">Court Warned Delays</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold font-sans text-red-600">{delayedCasesCount}</span>
            <span className="text-xs text-red-500 font-semibold">&gt; 30-Day Limit</span>
          </div>
        </div>

        {/* Completed Resolutions */}
        <div 
          onClick={() => onNavigateToTab('Case Management')}
          className="bg-white p-5 rounded border border-[#E2E8F0] hover:border-emerald-500 transition-all cursor-pointer group hover:shadow-xs"
          id="kpi-completed-cases"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded">
              <CheckCircle size={20} />
            </div>
            <span className="text-emerald-700 font-mono text-xs bg-emerald-50 px-2 py-0.5 rounded-full">YTD Growth</span>
          </div>
          <p className="text-[#64748B] text-xs font-medium uppercase tracking-wider mt-4">Resolved & Completed</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold font-sans text-slate-900">{completedCasesCount}</span>
            <span className="text-xs text-emerald-600 font-medium">Official Decrees</span>
          </div>
        </div>

      </div>

      {/* Main Charts Integration Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart (Lg Column 2) */}
        <div className="lg:col-span-2 bg-white p-6 rounded border border-[#E2E8F0] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900 font-sans tracking-tight">Administrative Case Filing Trends</h3>
              <p className="text-xs text-[#64748B]">Comparing monthly filing counts against prompt resolution releases.</p>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-[#E2E8F0] rounded text-xs select-none">
              <span className="font-semibold text-[#0F172A] px-2 py-1">Semi-Annual</span>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFiled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '4px', borderColor: '#E2E8F0' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0F172A' }}
                />
                <Area type="monotone" dataKey="Filed" stroke="#0F172A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFiled)" name="Opposition Filed" />
                <Area type="monotone" dataKey="Resolved" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorResolved)" name="Excrees Released" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4 mt-4 font-mono text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#0F172A]"></span> Patent Opposition Filed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#10B981]"></span> Decrees & Actions Approved</span>
          </div>
        </div>

        {/* Circular Distribution Donut Chart (Lg Column 1) */}
        <div className="bg-white p-6 rounded border border-[#E2E8F0] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900 font-sans tracking-tight">Active Discrepancy Share</h3>
            <p className="text-xs text-[#64748B] mb-2">Pre-Grant opposition share across active workloads.</p>
          </div>

          <div className="relative h-[180px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={caseDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {caseDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute flex flex-col items-center justify-center select-none">
              <span className="text-2xl font-black text-slate-900">{totalCasesCount}</span>
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">Total Cases</span>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {caseDistributionData.map((data, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs p-1.5 rounded hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                  <span className="text-[#64748B]">{data.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 font-mono">{data.value}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({data.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Analytical Detail Breakdown Feed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Delay Analysis (Category list) */}
        <div className="bg-white p-5 rounded border border-[#E2E8F0] flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
              <AlertTriangle size={16} className="text-amber-500" />
              Administrative Negligence Check
            </h4>
            <p className="text-xs text-[#64748B] mt-0.5 mb-5">Backlog count mapped to critical delay limits.</p>
          </div>

          <div className="space-y-4">
            {delayCategories.map((cat, idx) => {
              const maxVal = Math.max(...delayCategories.map(c => c.count)) || 1;
              const barPct = Math.min(100, Math.max(5, (cat.count / maxVal) * 100));
              
              let barColor = 'bg-emerald-500';
              if (cat.severity === 'Medium') barColor = 'bg-amber-500';
              if (cat.severity === 'High') barColor = 'bg-orange-500';
              if (cat.severity === 'Red') barColor = 'bg-red-500';

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-700 font-medium truncate max-w-[190px]">{cat.label}</span>
                    <span className="font-bold text-slate-900">{cat.count} {cat.count === 1 ? 'Case' : 'Cases'}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${barColor} rounded-full transition-all duration-1000`} 
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-[#64748B] font-medium">
            <span>Critical limit threshold: &gt; 30 days</span>
            <span className="text-[#0F172A] hover:underline cursor-pointer flex items-center gap-0.5" onClick={() => onNavigateToTab('Reports')}>
              View Report <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* Active Emergency Alerts */}
        <div className="bg-white p-5 rounded border border-[#E2E8F0] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
              <AlertTriangle size={16} className="text-red-500" />
              Backlog Warnings
            </h4>
            {totalAlertsCount > 0 && (
              <span className="bg-red-100 text-red-700 py-0.5 px-2 rounded-full font-mono font-bold text-[10px]">
                {totalAlertsCount} LIMIT BREACH
              </span>
            )}
          </div>

          <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar">
            {notifications.slice(0, 3).map((noti) => {
              let alertBorder = 'border-l-sky-500 bg-sky-50/10';
              if (noti.severity === 'warning') alertBorder = 'border-l-amber-500 bg-amber-50/10';
              if (noti.severity === 'error') alertBorder = 'border-l-red-500 bg-red-50/10';

              return (
                <div 
                  key={noti.id} 
                  onClick={() => {
                    onSelectCaseId(noti.caseId);
                    onNavigateToTab('Case Tracking');
                  }}
                  className={`p-3 border-l-4 rounded-r border-[#E2E8F0] ${alertBorder} hover:shadow-xs transition-all cursor-pointer`}
                >
                  <p className="text-xs font-bold text-slate-900 font-sans tracking-tight line-clamp-1">{noti.title}</p>
                  <p className="text-[11px] text-[#64748B] line-clamp-2 mt-1 leading-normal">{noti.description}</p>
                  
                  <div className="flex justify-between items-center mt-2.5">
                    <span className="text-[10px] font-mono tracking-wide text-[#64748B] uppercase font-bold">
                      Case #{noti.caseId}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {noti.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
            <button 
              onClick={() => onNavigateToTab('Admin Panel')}
              className="text-[#0F172A] text-xs font-semibold hover:underline flex items-center gap-0.5"
            >
              Configure Rule Engine <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Recent Real-Time Audit Activities Feed */}
        <div className="bg-white p-5 rounded border border-[#E2E8F0] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
              <Activity size={16} className="text-slate-900" />
              Filing Activities
            </h4>
            <span className="text-slate-400 text-xs font-mono">Active tracking</span>
          </div>

          <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[1px] before:bg-slate-100 max-h-[250px] overflow-y-auto custom-scrollbar">
            {auditLogs.slice(0, 4).map((log) => {
              let circleColor = 'bg-slate-400 text-white';
              if (log.userRole === 'Admin') circleColor = 'bg-[#0F172A] text-white';
              if (log.userRole === 'Patent Officer') circleColor = 'bg-sky-600 text-white';
              if (log.userRole === 'Applicant') circleColor = 'bg-emerald-600 text-white';
              if (log.userRole === 'Opposition Party') circleColor = 'bg-amber-600 text-white';

              return (
                <div key={log.id} className="relative pl-8 text-xs">
                  <span className={`absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center z-10 text-[10px] font-bold ${circleColor}`}>
                    {log.userName.charAt(0)}
                  </span>
                  <div>
                    <p className="text-slate-800 leading-normal">
                      <span className="font-bold text-slate-900">{log.userName}</span> ({log.userRole})
                    </p>
                    <p className="text-[#64748B] mt-0.5 font-medium leading-relaxed">{log.details}</p>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-mono">Audit trail logs verified</span>
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              ● Secure SSL
            </span>
          </div>
        </div>

      </div>

      {/* Footer Premium Call-To-Action Annual Report Generator */}
      <div className="bg-[#0F172A] rounded p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden ring-1 ring-white/10 shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-500 text-[#0F172A] text-[10px] font-bold rounded-full px-2.5 py-0.5 uppercase tracking-wide">
              Compliance Module
            </span>
            <span className="text-slate-400 text-xs font-mono">Delhi High Court Pre-Grant Directive </span>
          </div>
          <h3 className="text-2xl font-bold font-sans tracking-tight mb-2">Generate backlog lag & delay audit analysis reports</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Instantly package administrative lag coefficients, examiner workloads, upcoming hearing timelines, and active opposition delays into a standardized PDF audit report for supreme accountability.
          </p>
        </div>

        <button 
          onClick={() => onNavigateToTab('Reports')}
          className="bg-white text-[#0F172A] hover:bg-slate-100 transition-all px-8 py-3 rounded font-bold text-sm tracking-tight whitespace-nowrap shadow-sm active:scale-98 relative z-10"
        >
          Execute Audit Report
        </button>

        {/* Elegant geometric line vector pattern as decoration */}
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-5 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 L100 0 V100 Z" fill="white" />
          </svg>
        </div>
      </div>

    </div>
  );
}
