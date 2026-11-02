import React from 'react';
import { ProductionBatch, UserRole } from '../types';
import { Layers, Plus, Calendar, Tag, CheckCircle2, Clock } from 'lucide-react';

interface BatchSelectorProps {
  batches: ProductionBatch[];
  selectedBatchNo: string;
  onSelectBatch: (batchNo: string) => void;
  onNewBatchClick: () => void;
  currentRole: UserRole;
}

export const BatchSelector: React.FC<BatchSelectorProps> = ({
  batches,
  selectedBatchNo,
  onSelectBatch,
  onNewBatchClick,
  currentRole
}) => {
  const currentBatch = batches.find((b) => b.batch_no === selectedBatchNo) || batches[0];
  const canCreate = currentRole === 'Admin' || currentRole === 'Stage Supervisor';

  return (
    <div className="rounded-3xl glass-panel border border-white/10 p-5 mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all transition-snappy">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Active Batch Info & Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 block mb-0.5">
                Active Order Pipeline
              </span>
              <div className="flex flex-wrap items-center gap-2 mt-1 w-full">
                <select
                  aria-label="Select Active Batch"
                  value={selectedBatchNo}
                  onChange={(e) => onSelectBatch(e.target.value)}
                  className="w-full sm:w-auto max-w-full sm:max-w-md truncate bg-[#0a0a0a] text-white font-mono font-semibold text-xs sm:text-sm rounded-xl border border-white/15 px-3 py-1.5 focus:border-[#8B5CF6] focus:outline-none cursor-pointer transition-colors shadow-xs"
                >
                  {batches.map((b) => (
                    <option key={b.batch_no} value={b.batch_no} className="bg-[#080808] text-white">
                      {b.batch_no} — {b.product_name} ({b.total_planned_qty} pcs)
                    </option>
                  ))}
                </select>

                {currentBatch?.status === 'Completed' ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>COMPLETED</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30">
                    <Clock className="w-3.5 h-3.5" />
                    <span>STAGE: {currentBatch?.current_stage}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Quick Metadata chips */}
        {currentBatch && (
          <div className="flex flex-wrap items-center gap-2 text-xs bg-white/[0.02] p-2 rounded-2xl border border-white/5">
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-white/[0.03] rounded-xl border border-white/5">
              <Tag className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-neutral-500 text-[10px] font-mono uppercase tracking-wider">Style:</span>
              <span className="font-semibold text-white">{currentBatch.product_name}</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-white/[0.03] rounded-xl border border-white/5">
              <span className="text-neutral-500 text-[10px] font-mono uppercase tracking-wider">Variant:</span>
              <span className="font-mono font-semibold text-[#06B6D4]">{currentBatch.color}</span>
              <span className="text-neutral-600">/</span>
              <span className="font-mono font-semibold text-[#8B5CF6]">{currentBatch.size}</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-white/[0.03] rounded-xl border border-white/5">
              <span className="text-neutral-500 text-[10px] font-mono uppercase tracking-wider">Planned:</span>
              <span className="font-mono font-bold text-white">{currentBatch.total_planned_qty} pcs</span>
            </div>
            <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1 bg-white/[0.03] rounded-xl border border-white/5">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-neutral-500 text-[10px] font-mono uppercase tracking-wider">Date:</span>
              <span className="font-mono text-neutral-300">{currentBatch.date_created}</span>
            </div>
          </div>
        )}

        {/* Right: Add new batch button */}
        {canCreate && (
          <button
            onClick={onNewBatchClick}
            className="rounded-full bg-white text-black text-xs font-semibold px-4 py-2 hover:bg-neutral-200 active:scale-95 transition-all transition-snappy flex items-center space-x-1.5 shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer whitespace-nowrap self-start lg:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Batch</span>
          </button>
        )}
      </div>
    </div>
  );
};
