import React, { useState } from 'react';
import { ProductionBatch, StageRecord, ProductionStage } from '../types';
import { STAGES_LIST } from '../utils/storage';
import { getBatchSummaryMetrics, getStatusColor } from '../utils/rules';
import { 
  FileText, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  AlertTriangle, 
  UserCheck, 
  TrendingUp, 
  Calendar,
  Layers
} from 'lucide-react';

interface ModuleReportsProps {
  batches: ProductionBatch[];
  records: StageRecord[];
  selectedBatchNo: string;
  onSelectBatch: (batchNo: string) => void;
}

type ReportType = 
  | 'progress' 
  | 'missing' 
  | 'rejections' 
  | 'efficiency' 
  | 'operators' 
  | 'daily';

export const ModuleReports: React.FC<ModuleReportsProps> = ({ 
  batches, 
  records,
  selectedBatchNo,
  onSelectBatch
}) => {
  const [activeReport, setActiveReport] = useState<ReportType>('progress');
  const [reportScope, setReportScope] = useState<'selected' | 'all'>('selected');
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');

  const activeBatch = batches.find(b => b.batch_no === selectedBatchNo) || batches[0];
  const activeBatchMetrics = activeBatch ? getBatchSummaryMetrics(activeBatch, records) : null;

  const filteredRecordsByScope = records.filter(r => {
    if (reportScope === 'selected' && activeBatch) {
      return r.batch_no === activeBatch.batch_no;
    }
    return true;
  });

  const exportToCSV = (filename: string, rows: (string | number)[][], headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${reportScope === 'selected' ? selectedBatchNo : 'all'}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const missingRecords = filteredRecordsByScope.filter(r => r.qty_missing > 0 && 
    (stageFilter === 'ALL' || r.stage_name === stageFilter) &&
    (searchTerm === '' || r.batch_no.toLowerCase().includes(searchTerm.toLowerCase()) || (r.missing_reason || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const rejectionRecords = filteredRecordsByScope.filter(r => r.qty_rejected > 0 &&
    (stageFilter === 'ALL' || r.stage_name === stageFilter) &&
    (searchTerm === '' || r.batch_no.toLowerCase().includes(searchTerm.toLowerCase()) || (r.rejection_reason || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const operatorStats = React.useMemo(() => {
    const map: Record<string, { name: string; stagesHandled: number; totalPassed: number; totalRejected: number; totalMissing: number; stagesList: string[] }> = {};
    filteredRecordsByScope.forEach(r => {
      const op = r.operator_name || 'Unknown Operator';
      if (!map[op]) {
        map[op] = { name: op, stagesHandled: 0, totalPassed: 0, totalRejected: 0, totalMissing: 0, stagesList: [] };
      }
      map[op].stagesHandled += 1;
      map[op].totalPassed += r.qty_passed;
      map[op].totalRejected += r.qty_rejected;
      map[op].totalMissing += r.qty_missing;
      if (!map[op].stagesList.includes(r.stage_name)) {
        map[op].stagesList.push(r.stage_name);
      }
    });
    return Object.values(map).sort((a, b) => b.totalMissing + b.totalRejected - (a.totalMissing + a.totalRejected));
  }, [filteredRecordsByScope]);

  const stageThroughput = React.useMemo(() => {
    const map: Record<ProductionStage, { received: number; passed: number; rejected: number; missing: number; count: number; operator: string }> = {
      Cutting: { received: 0, passed: 0, rejected: 0, missing: 0, count: 0, operator: '—' },
      Stitching: { received: 0, passed: 0, rejected: 0, missing: 0, count: 0, operator: '—' },
      QC: { received: 0, passed: 0, rejected: 0, missing: 0, count: 0, operator: '—' },
      Finishing: { received: 0, passed: 0, rejected: 0, missing: 0, count: 0, operator: '—' },
      Packing: { received: 0, passed: 0, rejected: 0, missing: 0, count: 0, operator: '—' },
    };

    filteredRecordsByScope.forEach(r => {
      if (map[r.stage_name]) {
        map[r.stage_name].received += r.qty_received;
        map[r.stage_name].passed += r.qty_passed;
        map[r.stage_name].rejected += r.qty_rejected;
        map[r.stage_name].missing += r.qty_missing;
        map[r.stage_name].count += 1;
        map[r.stage_name].operator = r.operator_name;
      }
    });

    return map;
  }, [filteredRecordsByScope]);

  return (
    <div className="space-y-6">
      {/* Top Header & Scope Controls */}
      <div className="rounded-3xl glass-panel border border-white/10 p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="font-serif-instrument text-2xl sm:text-3xl text-white">
                Production Loss & Audit Reports
              </h2>
            </div>
            <p className="text-xs font-mono text-neutral-400 mt-1">
              Auditing stage handoffs, missing explanations, and operator accountability for{' '}
              <strong className="text-white">
                {reportScope === 'selected' && activeBatch ? `${activeBatch.batch_no} (${activeBatch.product_name})` : 'All Batches'}
              </strong>
            </p>
          </div>

          {/* Scope Switcher & Print */}
          <div className="flex flex-wrap items-center gap-2.5 font-mono">
            {/* Toggle: Selected Batch vs All Batches */}
            <div className="bg-white/[0.03] p-1 rounded-xl border border-white/10 flex items-center">
              <button
                type="button"
                onClick={() => setReportScope('selected')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all transition-snappy cursor-pointer ${
                  reportScope === 'selected'
                    ? 'bg-white text-black font-bold shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Selected Batch
              </button>
              <button
                type="button"
                onClick={() => setReportScope('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all transition-snappy cursor-pointer ${
                  reportScope === 'all'
                    ? 'bg-white text-black font-bold shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                All Batches
              </button>
            </div>

            {/* Quick Switch Batch Dropdown */}
            {reportScope === 'selected' && (
              <select
                aria-label="Select Batch for Audit Report"
                value={selectedBatchNo}
                onChange={(e) => onSelectBatch(e.target.value)}
                className="bg-[#0a0a0a] text-white font-semibold text-xs rounded-xl border border-white/15 px-3 py-1.5 focus:border-[#8B5CF6] focus:outline-none cursor-pointer"
              >
                {batches.map((b) => (
                  <option key={b.batch_no} value={b.batch_no} className="bg-[#080808] text-white">
                    {b.batch_no} — {b.product_name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-400" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Selected Batch Scope Info Banner */}
        {reportScope === 'selected' && activeBatch && activeBatchMetrics && (
          <div className="mb-5 bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-[#8B5CF6] bg-[#8B5CF6]/15 px-2.5 py-0.5 rounded-lg border border-[#8B5CF6]/30">
                {activeBatch.batch_no}
              </span>
              <span className="text-white font-semibold">{activeBatch.product_name}</span>
              <span className="text-neutral-500">({activeBatch.color} / {activeBatch.size})</span>
            </div>

            <div className="flex items-center gap-5 text-xs">
              <div>
                <span className="text-neutral-500">Planned:</span>{' '}
                <strong className="text-white">{activeBatch.total_planned_qty} pcs</strong>
              </div>
              <div>
                <span className="text-neutral-500">Output:</span>{' '}
                <strong className="text-[#10B981]">{activeBatchMetrics.finalPassedOutput} pcs</strong>
              </div>
              <div>
                <span className="text-neutral-500">Defects:</span>{' '}
                <strong className="text-[#F59E0B]">{activeBatchMetrics.totalRejected}</strong>
              </div>
              <div>
                <span className="text-neutral-500">Missing:</span>{' '}
                <strong className={activeBatchMetrics.totalMissing > 0 ? 'text-[#F43F5E]' : 'text-neutral-500'}>
                  {activeBatchMetrics.totalMissing}
                </strong>
              </div>
              <div>
                <span className="text-neutral-500">Yield:</span>{' '}
                <strong className="text-[#06B6D4]">{activeBatchMetrics.efficiency}%</strong>
              </div>
            </div>
          </div>
        )}

        {/* Report Selector Pills */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10 font-mono">
          {[
            { id: 'progress', label: '1. Batch Progress', icon: Layers },
            { id: 'missing', label: '2. Missing Pieces Log', icon: AlertTriangle },
            { id: 'rejections', label: '3. Rejection & Scrap', icon: Filter },
            { id: 'efficiency', label: '4. Production Efficiency', icon: TrendingUp },
            { id: 'operators', label: '5. Operator Performance', icon: UserCheck },
            { id: 'daily', label: '6. Stage Throughput', icon: Calendar }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeReport === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveReport(item.id as ReportType)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all transition-snappy cursor-pointer ${
                  isActive
                    ? 'bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.35)] font-bold'
                    : 'bg-white/[0.02] hover:bg-white/[0.05] text-neutral-400 hover:text-white border border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search / Filter bar for missing and rejection reports */}
      {(activeReport === 'missing' || activeReport === 'rejections') && (
        <div className="glass-panel border border-white/10 p-3.5 rounded-2xl shadow-xs flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by defect keyword or explanation..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#0a0a0a] border border-white/15 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-neutral-400">Filter Stage:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-[#0a0a0a] text-white border border-white/15 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              <option value="ALL">All Stages</option>
              {STAGES_LIST.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* REPORT 1: BATCH PROGRESS REPORT */}
      {activeReport === 'progress' && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                {reportScope === 'selected' && activeBatch 
                  ? `Stage-by-Stage Progress Audit: ${activeBatch.batch_no} (${activeBatch.product_name})`
                  : 'Batch Progress & Stage Handoff Report (All Batches)'}
              </h3>
              <p className="text-xs text-stone-500">
                {reportScope === 'selected'
                  ? 'Audit tracking input, output, defects, and shortages for each sequential stage.'
                  : 'Overview across all manufacturing orders.'}
              </p>
            </div>

            <button
              onClick={() => {
                if (reportScope === 'selected' && activeBatch) {
                  const headers = ['Stage', 'Date', 'Time In', 'Operator', 'Qty In', 'Qty Passed', 'Qty Rejected', 'Qty Missing', 'Defect Reason', 'Missing Explanation'];
                  const rows = STAGES_LIST.map(st => {
                    const r = filteredRecordsByScope.find(rec => rec.stage_name === st);
                    return [
                      st,
                      r?.date || '—',
                      r?.time_in || '—',
                      r?.operator_name || '—',
                      r?.qty_received ?? '—',
                      r?.qty_passed ?? '—',
                      r?.qty_rejected ?? '—',
                      r?.qty_missing ?? '—',
                      r?.rejection_reason || '—',
                      r?.missing_reason || '—'
                    ];
                  });
                  exportToCSV(`progress-${activeBatch.batch_no}`, rows, headers);
                } else {
                  const headers = ['Batch No', 'Garment', 'Planned', 'Current Stage', 'Status', 'Cutting Out', 'Stitching Out', 'QC Out', 'Finishing Out', 'Packing Out'];
                  const rows = batches.map(b => {
                    const bRecs = records.filter(r => r.batch_no === b.batch_no);
                    return [
                      b.batch_no,
                      b.product_name,
                      b.total_planned_qty,
                      b.current_stage,
                      b.status,
                      bRecs.find(r => r.stage_name === 'Cutting')?.qty_passed ?? '—',
                      bRecs.find(r => r.stage_name === 'Stitching')?.qty_passed ?? '—',
                      bRecs.find(r => r.stage_name === 'QC')?.qty_passed ?? '—',
                      bRecs.find(r => r.stage_name === 'Finishing')?.qty_passed ?? '—',
                      bRecs.find(r => r.stage_name === 'Packing')?.qty_passed ?? '—'
                    ];
                  });
                  exportToCSV('batch-progress-all', rows, headers);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {reportScope === 'selected' && activeBatch ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="p-3">Stage</th>
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">Operator Name</th>
                    <th className="p-3 text-right">Qty Received (IN)</th>
                    <th className="p-3 text-right">Qty Passed (OUT)</th>
                    <th className="p-3 text-right">Defective</th>
                    <th className="p-3 text-right">Missing</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {STAGES_LIST.map((stage) => {
                    const rec = filteredRecordsByScope.find(r => r.stage_name === stage);
                    const isCurrent = activeBatch.current_stage === stage;
                    const statusColor = rec ? getStatusColor(rec.qty_missing, rec.qty_received) : 'green';

                    return (
                      <tr key={stage} className={`hover:bg-stone-50/70 ${isCurrent ? 'bg-indigo-50/20' : ''}`}>
                        <td className="p-3 font-bold text-stone-900 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                          <span>{stage}</span>
                        </td>
                        <td className="p-3 text-stone-500">
                          {rec ? `${rec.date} (${rec.time_in})` : '—'}
                        </td>
                        <td className="p-3 text-stone-800 font-medium">
                          {rec ? rec.operator_name : isCurrent ? <span className="text-amber-700">Pending Assignment</span> : '—'}
                        </td>
                        <td className="p-3 text-right font-medium text-stone-600">
                          {rec ? rec.qty_received : isCurrent ? 'Auto-fed' : '—'}
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-700">
                          {rec ? rec.qty_passed : '—'}
                        </td>
                        <td className="p-3 text-right font-bold text-amber-700">
                          {rec ? rec.qty_rejected : '—'}
                        </td>
                        <td className="p-3 text-right font-extrabold">
                          {rec ? (
                            <span className={rec.qty_missing > 0 ? 'text-rose-700' : 'text-stone-400'}>
                              {rec.qty_missing}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="p-3 text-center">
                          {rec ? (
                            statusColor === 'green' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Perfect (0)
                              </span>
                            ) : statusColor === 'yellow' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                &le; 2% loss
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                High Loss
                              </span>
                            )
                          ) : isCurrent ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              In Progress
                            </span>
                          ) : (
                            <span className="text-stone-400">Pending</span>
                          )}
                        </td>
                        <td className="p-3 max-w-xs text-stone-700">
                          {rec?.missing_reason ? (
                            <div className="text-rose-800 bg-rose-50 p-1.5 rounded border border-rose-200">
                              Shortage: {rec.missing_reason}
                            </div>
                          ) : rec?.rejection_reason ? (
                            <div className="text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                              Defect: {rec.rejection_reason}
                            </div>
                          ) : rec?.remarks ? (
                            <div className="text-stone-500 italic">{rec.remarks}</div>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="p-3">Batch No</th>
                    <th className="p-3">Garment</th>
                    <th className="p-3 text-right">Planned</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Cutting</th>
                    <th className="p-3 text-right">Stitching</th>
                    <th className="p-3 text-right">QC</th>
                    <th className="p-3 text-right">Finishing</th>
                    <th className="p-3 text-right">Packing (Final)</th>
                    <th className="p-3 text-right">Yield</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {batches.map((b) => {
                    const m = getBatchSummaryMetrics(b, records);
                    const bRecs = records.filter(r => r.batch_no === b.batch_no);
                    return (
                      <tr key={b.batch_no} className="hover:bg-stone-50/70">
                        <td className="p-3 font-bold text-indigo-700">{b.batch_no}</td>
                        <td className="p-3 text-stone-800 font-medium">{b.product_name} ({b.color} / {b.size})</td>
                        <td className="p-3 text-right font-bold text-stone-900">{b.total_planned_qty}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}>
                            {b.current_stage}
                          </span>
                        </td>
                        <td className="p-3 text-right text-stone-600">{bRecs.find(r => r.stage_name === 'Cutting')?.qty_passed ?? '—'}</td>
                        <td className="p-3 text-right text-stone-600">{bRecs.find(r => r.stage_name === 'Stitching')?.qty_passed ?? '—'}</td>
                        <td className="p-3 text-right text-stone-600">{bRecs.find(r => r.stage_name === 'QC')?.qty_passed ?? '—'}</td>
                        <td className="p-3 text-right text-stone-600">{bRecs.find(r => r.stage_name === 'Finishing')?.qty_passed ?? '—'}</td>
                        <td className="p-3 text-right font-bold text-emerald-700">{bRecs.find(r => r.stage_name === 'Packing')?.qty_passed ?? '—'}</td>
                        <td className="p-3 text-right font-extrabold text-indigo-800">{m.efficiency}%</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              onSelectBatch(b.batch_no);
                              setReportScope('selected');
                            }}
                            className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold cursor-pointer"
                          >
                            Inspect &rarr;
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* REPORT 2: MISSING PIECES REPORT */}
      {activeReport === 'missing' && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-rose-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>
                  {reportScope === 'selected' && activeBatch 
                    ? `Missing Pieces Log for ${activeBatch.batch_no}` 
                    : 'Missing Pieces Log (All Batches)'}
                </span>
              </h3>
              <p className="text-xs text-stone-500">Documented explanations captured during handoff.</p>
            </div>
            <button
              onClick={() => {
                const headers = ['Batch No', 'Stage', 'Date', 'Missing Qty', 'Operator', 'Mandatory Explanation'];
                const rows = missingRecords.map(r => [
                  r.batch_no,
                  r.stage_name,
                  r.date,
                  r.qty_missing,
                  r.operator_name,
                  r.missing_reason || 'N/A'
                ]);
                exportToCSV('missing-pieces-report', rows, headers);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3">Batch No</th>
                  <th className="p-3">Stage</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Missing Qty</th>
                  <th className="p-3">Operator</th>
                  <th className="p-3">Documented Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {missingRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-stone-400">
                      Zero missing pieces recorded for this scope.
                    </td>
                  </tr>
                ) : (
                  missingRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-rose-50/40">
                      <td className="p-3 font-bold text-stone-900">{r.batch_no}</td>
                      <td className="p-3 font-semibold text-indigo-700">{r.stage_name}</td>
                      <td className="p-3 text-stone-500">{r.date}</td>
                      <td className="p-3 text-right font-extrabold text-rose-700">{r.qty_missing} pcs</td>
                      <td className="p-3 text-stone-800 font-medium">{r.operator_name}</td>
                      <td className="p-3">
                        <span className="bg-rose-50 px-2 py-1 rounded text-rose-900 border border-rose-200 font-medium">
                          {r.missing_reason}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: REJECTION & SCRAP REPORT */}
      {activeReport === 'rejections' && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-700" />
                <span>
                  {reportScope === 'selected' && activeBatch 
                    ? `Defect & Scrap Log for ${activeBatch.batch_no}` 
                    : 'Defect & Scrap Log (All Batches)'}
                </span>
              </h3>
              <p className="text-xs text-stone-500">Defects categorized by stage and root cause.</p>
            </div>
            <button
              onClick={() => {
                const headers = ['Batch No', 'Stage', 'Date', 'Rejected Qty', 'Defect Category', 'Operator', 'Rejection Reason'];
                const rows = rejectionRecords.map(r => [
                  r.batch_no,
                  r.stage_name,
                  r.date,
                  r.qty_rejected,
                  r.defect_type || 'Unspecified',
                  r.operator_name,
                  r.rejection_reason || 'N/A'
                ]);
                exportToCSV('rejection-report', rows, headers);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3">Batch No</th>
                  <th className="p-3">Stage</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Rejected Qty</th>
                  <th className="p-3">Defect Category</th>
                  <th className="p-3">Operator</th>
                  <th className="p-3">Rejection Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rejectionRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-stone-400">
                      No defective pieces recorded for this scope.
                    </td>
                  </tr>
                ) : (
                  rejectionRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-amber-50/40">
                      <td className="p-3 font-bold text-stone-900">{r.batch_no}</td>
                      <td className="p-3 font-semibold text-indigo-700">{r.stage_name}</td>
                      <td className="p-3 text-stone-500">{r.date}</td>
                      <td className="p-3 text-right font-extrabold text-amber-700">{r.qty_rejected} pcs</td>
                      <td className="p-3 text-stone-800 font-medium">{r.defect_type || 'General Defect'}</td>
                      <td className="p-3 text-stone-700">{r.operator_name}</td>
                      <td className="p-3 text-stone-700">{r.rejection_reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: PRODUCTION EFFICIENCY REPORT */}
      {activeReport === 'efficiency' && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-sm">
              {reportScope === 'selected' && activeBatch 
                ? `Yield Efficiency for ${activeBatch.batch_no}` 
                : 'Batch Production Efficiency vs Planned Master'}
            </h3>
            <button
              onClick={() => {
                const targetBatches = reportScope === 'selected' && activeBatch ? [activeBatch] : batches;
                const headers = ['Batch No', 'Garment', 'Planned Master', 'Final Output', 'Total Loss', 'Loss %', 'Efficiency %', 'Evaluation'];
                const rows = targetBatches.map(b => {
                  const m = getBatchSummaryMetrics(b, records);
                  return [
                    b.batch_no,
                    b.product_name,
                    m.planned,
                    m.finalPassedOutput,
                    m.totalLoss,
                    `${m.lossPercentage}%`,
                    `${m.efficiency}%`,
                    m.efficiency >= 90 ? 'High Yield' : 'Substandard Yield'
                  ];
                });
                exportToCSV('production-efficiency-report', rows, headers);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3">Batch No</th>
                  <th className="p-3">Garment</th>
                  <th className="p-3 text-right">Planned Master</th>
                  <th className="p-3 text-right">Output Passed</th>
                  <th className="p-3 text-right">Total Lost</th>
                  <th className="p-3 text-right">Loss Rate</th>
                  <th className="p-3 text-right">Yield Efficiency</th>
                  <th className="p-3 text-center">Benchmark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(reportScope === 'selected' && activeBatch ? [activeBatch] : batches).map((b) => {
                  const m = getBatchSummaryMetrics(b, records);
                  return (
                    <tr key={b.batch_no} className="hover:bg-stone-50/70">
                      <td className="p-3 font-bold text-stone-900">{b.batch_no}</td>
                      <td className="p-3 text-stone-700">{b.product_name}</td>
                      <td className="p-3 text-right font-bold text-stone-900">{m.planned}</td>
                      <td className="p-3 text-right font-bold text-emerald-700">{m.finalPassedOutput}</td>
                      <td className="p-3 text-right font-bold text-rose-700">{m.totalLoss} pcs</td>
                      <td className="p-3 text-right font-semibold text-rose-700">{m.lossPercentage}%</td>
                      <td className="p-3 text-right font-extrabold text-sm text-indigo-900">{m.efficiency}%</td>
                      <td className="p-3 text-center">
                        {m.efficiency >= 90 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Excellent Yield (&gt;=90%)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            High Variance (&lt;90%)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 5: OPERATOR PERFORMANCE REPORT */}
      {activeReport === 'operators' && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                {reportScope === 'selected' && activeBatch 
                  ? `Operator Accountability for ${activeBatch.batch_no}` 
                  : 'Operator Performance & Scrap Rate Analysis (All Batches)'}
              </h3>
              <p className="text-xs text-stone-500">Pieces passed vs defects and missing under each operator.</p>
            </div>
            <button
              onClick={() => {
                const headers = ['Operator Name', 'Stages Handled', 'Total Passed', 'Total Rejected', 'Total Missing'];
                const rows = operatorStats.map(op => [
                  op.name,
                  op.stagesHandled,
                  op.totalPassed,
                  op.totalRejected,
                  op.totalMissing
                ]);
                exportToCSV('operator-performance-report', rows, headers);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3">Operator / Station Lead</th>
                  <th className="p-3 text-center">Stages Handled</th>
                  <th className="p-3 text-right">Total Passed</th>
                  <th className="p-3 text-right">Defective</th>
                  <th className="p-3 text-right">Shortages</th>
                  <th className="p-3 text-right">Total Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {operatorStats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-stone-400">
                      No operator records found for this scope.
                    </td>
                  </tr>
                ) : (
                  operatorStats.map((op) => {
                    const totalLoss = op.totalRejected + op.totalMissing;
                    return (
                      <tr key={op.name} className="hover:bg-stone-50/70">
                        <td className="p-3 font-bold text-stone-900 flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-indigo-700" />
                          <div>
                            <span>{op.name}</span>
                            <span className="text-[10px] text-stone-500 block">({op.stagesList.join(', ')})</span>
                          </div>
                        </td>
                        <td className="p-3 text-center text-stone-600">{op.stagesHandled}</td>
                        <td className="p-3 text-right font-bold text-emerald-700">{op.totalPassed} pcs</td>
                        <td className="p-3 text-right font-bold text-amber-700">{op.totalRejected} pcs</td>
                        <td className="p-3 text-right font-bold text-rose-700">{op.totalMissing} pcs</td>
                        <td className="p-3 text-right font-extrabold text-stone-900">
                          {totalLoss > 0 ? (
                            <span className="text-amber-800">{totalLoss} pcs</span>
                          ) : (
                            <span className="text-emerald-700">0 variance</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 6: DAILY / STAGE THROUGHPUT */}
      {activeReport === 'daily' && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                {reportScope === 'selected' && activeBatch 
                  ? `Stage Throughput for ${activeBatch.batch_no}` 
                  : 'Stage-wise Throughput Summary (All Batches)'}
              </h3>
              <p className="text-xs text-stone-500">Volume processed across Cutting, Stitching, QC, Finishing, and Packing.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3">Production Stage</th>
                  <th className="p-3 text-center">Stage Entries</th>
                  <th className="p-3 text-right">Total In (Received)</th>
                  <th className="p-3 text-right">Total Out (Passed)</th>
                  <th className="p-3 text-right">Total Defective</th>
                  <th className="p-3 text-right">Total Missing</th>
                  <th className="p-3 text-right">Stage Pass Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {STAGES_LIST.map((stage) => {
                  const stat = stageThroughput[stage];
                  const passRate = stat.received > 0 ? ((stat.passed / stat.received) * 100).toFixed(1) : '100';
                  return (
                    <tr key={stage} className="hover:bg-stone-50/70">
                      <td className="p-3 font-bold text-indigo-700">{stage}</td>
                      <td className="p-3 text-center text-stone-600">{stat.count} logged</td>
                      <td className="p-3 text-right text-stone-800 font-semibold">{stat.received}</td>
                      <td className="p-3 text-right text-emerald-700 font-bold">{stat.passed}</td>
                      <td className="p-3 text-right text-amber-700 font-bold">{stat.rejected}</td>
                      <td className="p-3 text-right text-rose-700 font-extrabold">{stat.missing}</td>
                      <td className="p-3 text-right font-extrabold text-indigo-900">{passRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
