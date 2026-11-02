import React, { useState, useEffect } from 'react';
import { ProductionBatch, ProductionStage, StageRecord, UserRole, DiscrepancyReport } from '../types';
import { STAGES_LIST, DEFECT_OPTIONS, MISSING_REASONS_SUGGESTIONS } from '../utils/storage';
import { 
  computeStageMissing, 
  computeStageSurplus, 
  validateStageInput, 
  getAutoQtyReceivedForStage, 
  getPreviousStageInfo 
} from '../utils/rules';
import { 
  Scissors, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Package, 
  AlertTriangle, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  User, 
  Lock, 
  ArrowRight, 
  Info,
  Send,
  BellRing
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ModuleStageTrackerProps {
  batch: ProductionBatch;
  records: StageRecord[];
  onSaveRecord: (
    record: Omit<StageRecord, 'id' | 'submitted_at'>, 
    discrepancy?: Omit<DiscrepancyReport, 'id' | 'reported_at'>
  ) => void;
  onSendDiscrepancyReport: (report: Omit<DiscrepancyReport, 'id' | 'reported_at'>) => void;
  currentRole: UserRole;
  currentUserName?: string;
}

const STAGE_ICONS: Record<ProductionStage, React.ReactNode> = {
  Cutting: <Scissors className="w-4 h-4" />,
  Stitching: <Layers className="w-4 h-4" />,
  QC: <CheckCircle2 className="w-4 h-4" />,
  Finishing: <Sparkles className="w-4 h-4" />,
  Packing: <Package className="w-4 h-4" />
};

export const ModuleStageTracker: React.FC<ModuleStageTrackerProps> = ({
  batch,
  records,
  onSaveRecord,
  onSendDiscrepancyReport,
  currentRole,
  currentUserName
}) => {
  const activeBatchRecords = records.filter((r) => r.batch_no === batch.batch_no);
  
  const initialActiveStage: ProductionStage = 
    batch.current_stage === 'Completed' 
      ? 'Packing' 
      : (batch.current_stage as ProductionStage) || 'Cutting';

  const [selectedStage, setSelectedStage] = useState<ProductionStage>(initialActiveStage);

  useEffect(() => {
    if (batch.current_stage === 'Completed') {
      setSelectedStage('Packing');
    } else {
      setSelectedStage(batch.current_stage as ProductionStage);
    }
  }, [batch.batch_no, batch.current_stage]);

  const existingRecord = activeBatchRecords.find((r) => r.stage_name === selectedStage);
  const isStageCompleted = !!existingRecord;

  // Auto-calculated received quantity for this stage
  const autoReceived = getAutoQtyReceivedForStage(batch, selectedStage, records);
  const prevStageInfo = getPreviousStageInfo(batch, selectedStage, records);

  // Form State
  const [operatorName, setOperatorName] = useState(currentUserName || 'David Vance (Senior QC)');

  useEffect(() => {
    if (currentUserName) {
      setOperatorName(currentUserName);
    }
  }, [currentUserName]);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeIn, setTimeIn] = useState('08:30');
  const [qtyPassed, setQtyPassed] = useState<number | ''>('');
  const [qtyRejected, setQtyRejected] = useState<number | ''>('');
  const [qtyRework, setQtyRework] = useState<number | ''>(0); // QC
  const [fabricRolls, setFabricRolls] = useState<number | ''>(10); // Cutting
  const [rejectionReason, setRejectionReason] = useState('');
  const [missingReason, setMissingReason] = useState('');
  const [surplusReason, setSurplusReason] = useState('');
  const [defectType, setDefectType] = useState('');
  const [remarks, setRemarks] = useState('');

  // Discrepancy report message state
  const [discrepancyMessage, setDiscrepancyMessage] = useState('');
  const [isDiscrepancyReportSent, setIsDiscrepancyReportSent] = useState(false);
  const [autoFileDiscrepancy, setAutoFileDiscrepancy] = useState(true);

  // Packing specific breakdown
  const [sizeBreakdown, setSizeBreakdown] = useState<Record<string, number>>({
    'S': 0, 'M': 0, 'L': 0, 'XL': 0, 'XXL': 0
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);

  // Reset form when changing stage
  useEffect(() => {
    setQtyPassed('');
    setQtyRejected('');
    setQtyRework(0);
    setRejectionReason('');
    setMissingReason('');
    setSurplusReason('');
    setDefectType('');
    setRemarks('');
    setValidationErrors([]);
    setTouched(false);
    setIsDiscrepancyReportSent(false);

    if (selectedStage === 'Cutting') setOperatorName('Carlos Mendez (Cutter #1)');
    else if (selectedStage === 'Stitching') setOperatorName('Amina Khatun (Sewing Lead)');
    else if (selectedStage === 'QC') setOperatorName('David Vance (Senior QC)');
    else if (selectedStage === 'Finishing') setOperatorName('Fatima Noor (Finishing Lead)');
    else if (selectedStage === 'Packing') setOperatorName('Samuel Lee (Packing Mgr)');
  }, [selectedStage, batch.batch_no]);

  const numPassed = typeof qtyPassed === 'number' ? qtyPassed : 0;
  const numRejected = typeof qtyRejected === 'number' ? qtyRejected : 0;
  const numRework = typeof qtyRework === 'number' ? qtyRework : 0;

  // Live Calculations
  const totalAccounted = numPassed + numRejected + (selectedStage === 'QC' ? numRework : 0);
  const liveMissing = computeStageMissing(selectedStage, autoReceived, numPassed, numRejected, numRework);
  const liveSurplus = computeStageSurplus(selectedStage, autoReceived, numPassed, numRejected, numRework);
  const variance = totalAccounted - autoReceived;
  const hasDiscrepancy = (qtyPassed !== '' || qtyRejected !== '') && variance !== 0;

  // Auto-generate discrepancy report message
  useEffect(() => {
    if (variance > 0) {
      setDiscrepancyMessage(
        `SURPLUS HANDOFF DISCREPANCY: Counted ${totalAccounted} pieces (+${variance} surplus) at ${selectedStage}. Previous stage (${prevStageInfo.stage}) operator ${prevStageInfo.operator} recorded sending ${autoReceived} pieces. Audit requested.`
      );
    } else if (variance < 0) {
      setDiscrepancyMessage(
        `SHORTAGE HANDOFF DISCREPANCY: Counted only ${totalAccounted} pieces (${variance} missing) at ${selectedStage}. Previous stage (${prevStageInfo.stage}) operator ${prevStageInfo.operator} recorded sending ${autoReceived} pieces. Shortage investigation initiated.`
      );
    } else {
      setDiscrepancyMessage('');
    }
  }, [variance, totalAccounted, autoReceived, selectedStage, prevStageInfo.stage, prevStageInfo.operator]);

  // Validate form state live
  useEffect(() => {
    if (!touched) return;
    const { errors } = validateStageInput(
      selectedStage,
      autoReceived,
      numPassed,
      numRejected,
      numRework,
      rejectionReason,
      missingReason,
      surplusReason,
      isDiscrepancyReportSent
    );

    if (selectedStage === 'Packing' && numPassed > 0) {
      const sumSizes = Object.values(sizeBreakdown).reduce((a, b) => a + b, 0);
      if (sumSizes > 0 && sumSizes !== numPassed) {
        errors.push(`Final Packed Qty by Size sum (${sumSizes}) does not match Passed quantity (${numPassed}).`);
      }
    }

    setValidationErrors(errors);
  }, [selectedStage, autoReceived, numPassed, numRejected, numRework, rejectionReason, missingReason, surplusReason, isDiscrepancyReportSent, sizeBreakdown, touched]);

  // Check role permission
  const isViewer = currentRole === 'Viewer';
  const isQCOnly = currentRole === 'QC Inspector' && selectedStage !== 'QC';
  const isOperatorOnly = currentRole === 'Operator' && selectedStage !== batch.current_stage;
  const isSaveBlockedByRole = isViewer || isQCOnly || isOperatorOnly;

  const handleSendReportToAdmin = () => {
    if (!hasDiscrepancy) return;
    onSendDiscrepancyReport({
      batch_no: batch.batch_no,
      stage_name: selectedStage,
      current_operator: operatorName,
      previous_stage: prevStageInfo.stage,
      previous_operator: prevStageInfo.operator,
      type: variance > 0 ? 'Surplus (Received More)' : 'Shortage (Received Less)',
      expected_qty: autoReceived,
      counted_qty: totalAccounted,
      variance_qty: variance,
      message: discrepancyMessage || `Discrepancy of ${variance > 0 ? `+${variance}` : variance} pieces detected between ${prevStageInfo.stage} (${prevStageInfo.operator}) and ${selectedStage} (${operatorName}).`,
      status: 'Reported to Admin'
    });
    setIsDiscrepancyReportSent(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const { valid, errors } = validateStageInput(
      selectedStage,
      autoReceived,
      numPassed,
      numRejected,
      numRework,
      rejectionReason,
      missingReason,
      surplusReason,
      isDiscrepancyReportSent || autoFileDiscrepancy
    );

    if (selectedStage === 'Packing' && numPassed > 0) {
      const sumSizes = Object.values(sizeBreakdown).reduce((a, b) => a + b, 0);
      if (sumSizes > 0 && sumSizes !== numPassed) {
        errors.push(`Final Packed Qty by Size sum (${sumSizes}) must equal Passed quantity (${numPassed}).`);
      }
    }

    if (!valid || errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    let discrepancyToLog: Omit<DiscrepancyReport, 'id' | 'reported_at'> | undefined = undefined;
    if (hasDiscrepancy && (autoFileDiscrepancy || !isDiscrepancyReportSent)) {
      discrepancyToLog = {
        batch_no: batch.batch_no,
        stage_name: selectedStage,
        current_operator: operatorName,
        previous_stage: prevStageInfo.stage,
        previous_operator: prevStageInfo.operator,
        type: variance > 0 ? 'Surplus (Received More)' : 'Shortage (Received Less)',
        expected_qty: autoReceived,
        counted_qty: totalAccounted,
        variance_qty: variance,
        message: discrepancyMessage || `Auto-filed: Discrepancy of ${variance > 0 ? `+${variance}` : variance} pieces against previous stage operator ${prevStageInfo.operator}.`,
        status: 'Reported to Admin'
      };
    }

    onSaveRecord({
      batch_no: batch.batch_no,
      stage_name: selectedStage,
      date,
      time_in: timeIn,
      operator_name: operatorName,
      qty_received: autoReceived,
      qty_passed: numPassed,
      qty_rejected: numRejected,
      qty_missing: liveMissing,
      qty_surplus: liveSurplus > 0 ? liveSurplus : undefined,
      rejection_reason: numRejected > 0 ? rejectionReason : undefined,
      missing_reason: liveMissing > 0 ? missingReason : undefined,
      surplus_reason: liveSurplus > 0 ? (surplusReason || discrepancyMessage) : undefined,
      remarks: remarks || undefined,
      fabric_rolls_used: selectedStage === 'Cutting' ? Number(fabricRolls) || 1 : undefined,
      defect_type: defectType || undefined,
      qty_rework: selectedStage === 'QC' ? numRework : undefined,
      damage_reason: selectedStage === 'Finishing' && numRejected > 0 ? rejectionReason : undefined,
      packed_by_size: selectedStage === 'Packing' ? sizeBreakdown : undefined,
      packed_by_color: selectedStage === 'Packing' ? { [batch.color]: numPassed } : undefined,
      created_by: operatorName
    }, discrepancyToLog);

    if (selectedStage === 'Packing') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 5-Stage Stepper Navigation */}
      <div className="rounded-3xl glass-panel border border-white/10 p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="font-serif-instrument text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2">
              <span>Production Pipeline Stages</span>
            </h2>
            <p className="text-xs font-mono text-neutral-400 mt-0.5">
              Select any stage to inspect locked audit trail or enter live workstation output
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-mono px-3 py-1 rounded-full bg-white/[0.04] text-[#06B6D4] border border-[#06B6D4]/30">
            BATCH: {batch.batch_no}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {STAGES_LIST.map((stage, idx) => {
            const stageRec = activeBatchRecords.find((r) => r.stage_name === stage);
            const isDone = !!stageRec;
            const isCurrent = batch.current_stage === stage;
            const isSelected = selectedStage === stage;

            return (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`relative flex flex-col p-3.5 rounded-2xl border text-left transition-all transition-snappy cursor-pointer ${
                  idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                } ${
                  isSelected
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 ring-1 ring-[#8B5CF6]/50 shadow-[0_0_20px_rgba(139,92,246,0.35)] -translate-y-1'
                    : isDone
                    ? 'border-[#10B981]/30 bg-[#10B981]/5 hover:bg-[#10B981]/10 text-neutral-200'
                    : isCurrent
                    ? 'border-[#06B6D4]/40 bg-[#06B6D4]/10 hover:bg-[#06B6D4]/15 text-white'
                    : 'border-white/5 bg-white/[0.015] hover:bg-white/[0.04] text-neutral-500'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                    Stage {idx + 1}
                  </span>
                  {isDone ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-full border border-[#10B981]/30">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  ) : isCurrent ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#06B6D4] bg-[#06B6D4]/15 px-2 py-0.5 rounded-full border border-[#06B6D4]/30 animate-pulse">
                      <Clock className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-600">
                      <Lock className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 mt-1">
                  <div className={`p-2 rounded-xl ${
                    isSelected ? 'bg-[#8B5CF6] text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]' : isDone ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-white/5 text-neutral-400'
                  }`}>
                    {STAGE_ICONS[stage]}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{stage}</h3>
                    {stageRec ? (
                      <p className="text-[11px] font-mono text-[#10B981]">
                        Out: {stageRec.qty_passed} pcs
                      </p>
                    ) : (
                      <p className="text-[11px] font-mono text-neutral-500">
                        {isCurrent ? 'Ready for Entry' : 'Pending'}
                      </p>
                    )}
                  </div>
                </div>

                {stageRec && (stageRec.qty_rejected > 0 || stageRec.qty_missing > 0 || (stageRec.qty_surplus && stageRec.qty_surplus > 0)) && (
                  <div className="mt-2.5 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#F59E0B]">Def: -{stageRec.qty_rejected}</span>
                    {stageRec.qty_surplus ? (
                      <span className="text-[#06B6D4] font-bold">+{stageRec.qty_surplus} sur</span>
                    ) : (
                      <span className="text-[#F43F5E] font-semibold">-{stageRec.qty_missing} mis</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {isStageCompleted && existingRecord ? (
        /* READ-ONLY IMMUTABLE AUDIT LOG */
        <div className="glass-panel border border-[#10B981]/30 rounded-3xl p-5 sm:p-8 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-[#10B981]/15 border border-[#10B981]/30 rounded-2xl text-[#10B981] shrink-0">
                {STAGE_ICONS[selectedStage]}
              </div>
              <div>
                <h3 className="font-serif-instrument text-2xl sm:text-3xl font-normal text-white">
                  {selectedStage} Stage Completed Record
                </h3>
                <p className="text-xs font-mono text-neutral-400 mt-0.5">
                  Logged on {new Date(existingRecord.submitted_at).toLocaleString()} by{' '}
                  <span className="text-[#06B6D4] font-semibold">{existingRecord.operator_name}</span>
                </p>
              </div>
            </div>

            <div className="shrink-0 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Locked Audit Record</span>
              </span>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="bg-white/[0.02] p-3.5 sm:p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 block mb-1">Pieces Received</span>
              <span className="text-2xl sm:text-3xl font-mono font-bold text-white block truncate">{existingRecord.qty_received}</span>
              <span className="text-[10px] font-mono text-neutral-500 block mt-1 truncate">From previous stage</span>
            </div>

            <div className="bg-[#10B981]/10 p-3.5 sm:p-4 rounded-2xl border border-[#10B981]/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#10B981] block mb-1">Pieces Passed (OUT)</span>
              <span className="text-2xl sm:text-3xl font-mono font-bold text-[#10B981] block truncate">{existingRecord.qty_passed}</span>
              <span className="text-[10px] font-mono text-[#10B981]/80 block mt-1 truncate">Advanced to next stage</span>
            </div>

            <div className="bg-[#F59E0B]/10 p-3.5 sm:p-4 rounded-2xl border border-[#F59E0B]/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#F59E0B] block mb-1">Defective / Scrap</span>
              <span className="text-2xl sm:text-3xl font-mono font-bold text-[#F59E0B] block truncate">{existingRecord.qty_rejected}</span>
              <span className="text-[10px] font-mono text-[#F59E0B]/80 block mt-1 truncate">Failed inspection</span>
            </div>

            <div className="bg-[#F43F5E]/10 p-3.5 sm:p-4 rounded-2xl border border-[#F43F5E]/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#F43F5E] block mb-1 truncate">
                {existingRecord.qty_surplus ? 'Surplus / Excess' : 'Missing / Shortage'}
              </span>
              <span className={`text-2xl sm:text-3xl font-mono font-bold block truncate ${
                existingRecord.qty_surplus ? 'text-[#06B6D4]' : existingRecord.qty_missing > 0 ? 'text-[#F43F5E]' : 'text-neutral-500'
              }`}>
                {existingRecord.qty_surplus ? `+${existingRecord.qty_surplus}` : existingRecord.qty_missing}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 block mt-1 truncate">
                {existingRecord.qty_surplus ? 'Surplus recorded' : existingRecord.qty_missing === 0 ? 'Zero pieces lost' : 'Unaccounted'}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3.5 bg-white/[0.02] p-5 rounded-2xl border border-white/5 text-xs font-mono">
            {existingRecord.rejection_reason && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="font-semibold text-[#F59E0B] min-w-[150px]">Rejection Reason:</span>
                <span className="bg-[#F59E0B]/15 px-3 py-1 rounded-lg text-[#F59E0B] border border-[#F59E0B]/30">
                  {existingRecord.rejection_reason}
                </span>
                {existingRecord.defect_type && (
                  <span className="text-neutral-400">({existingRecord.defect_type})</span>
                )}
              </div>
            )}

            {existingRecord.missing_reason && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="font-semibold text-[#F43F5E] min-w-[150px]">Missing Explanation:</span>
                <span className="bg-[#F43F5E]/15 px-3 py-1 rounded-lg text-[#F43F5E] border border-[#F43F5E]/30">
                  {existingRecord.missing_reason}
                </span>
              </div>
            )}

            {existingRecord.surplus_reason && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="font-semibold text-[#06B6D4] min-w-[150px]">Surplus Audit Reason:</span>
                <span className="bg-[#06B6D4]/15 px-3 py-1 rounded-lg text-[#06B6D4] border border-[#06B6D4]/30">
                  {existingRecord.surplus_reason}
                </span>
              </div>
            )}

            {existingRecord.remarks && (
              <div className="flex items-start gap-3 pt-1">
                <span className="font-semibold text-neutral-400 min-w-[150px]">Remarks:</span>
                <span className="italic text-neutral-300">{existingRecord.remarks}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* INTERACTIVE STAGE ENTRY FORM */
        <form onSubmit={handleSubmit} className="glass-panel border border-white/10 rounded-3xl p-5 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-white/10 gap-3">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6] rounded-2xl shadow-[0_0_15px_rgba(139,92,246,0.2)] shrink-0">
                {STAGE_ICONS[selectedStage]}
              </div>
              <div>
                <h3 className="font-serif-instrument text-2xl sm:text-3xl text-white flex flex-wrap items-center gap-2">
                  <span>Record {selectedStage} Production Stage</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#06B6D4]/15 text-[#06B6D4] font-semibold border border-[#06B6D4]/30">
                    Active Telemetry
                  </span>
                </h3>
                <p className="text-xs font-mono text-neutral-400 mt-0.5">
                  Input count auto-preset from previous stage (<span className="text-[#06B6D4] font-semibold">{prevStageInfo.stage}</span> by <span className="text-white font-semibold">{prevStageInfo.operator}</span>).
                </p>
              </div>
            </div>

            {/* Read-Only Auto-Fed Received Banner */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 flex items-center justify-between sm:justify-start gap-3 shrink-0">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-400 block">
                  {selectedStage === 'Cutting' ? 'Pieces Planned (Master)' : `Auto-Received from ${prevStageInfo.stage}`}
                </span>
                <div className="text-lg font-mono font-bold text-white">
                  {autoReceived} <span className="text-xs font-normal text-neutral-400">pieces</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">
                  Logged by: {prevStageInfo.operator}
                </span>
              </div>
              <Info className="w-4 h-4 text-neutral-500 shrink-0" />
            </div>
          </div>

          {/* LIVE METRIC BAR */}
          <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-white/[0.02] p-2.5 sm:p-3 rounded-2xl border border-white/5">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-400 block mb-1 truncate">
                Qty Received
              </span>
              <span className="text-2xl font-mono font-bold text-white block truncate">{autoReceived}</span>
              <span className="text-[10px] font-mono text-neutral-500 block truncate mt-0.5">From {prevStageInfo.operator}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#10B981] block mb-1 truncate">
                Qty Passed (OK)
              </span>
              <span className="text-2xl font-mono font-bold text-[#10B981] block truncate">{numPassed || 0}</span>
              <span className="text-[10px] font-mono text-[#10B981]/80 block truncate mt-0.5">Completed OK</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#F59E0B] block mb-1 truncate">
                Qty Defective
              </span>
              <span className="text-2xl font-mono font-bold text-[#F59E0B] block truncate">{numRejected || 0}</span>
              <span className="text-[10px] font-mono text-[#F59E0B]/80 block truncate mt-0.5">Failed / scrap</span>
            </div>

            {/* DYNAMIC 4TH BOX: SHOWS SURPLUS (EXCESS) OR MISSING (SHORTAGE) */}
            {liveSurplus > 0 ? (
              <div className="p-3 rounded-xl bg-[#06B6D4]/15 border border-[#06B6D4]/35 text-[#06B6D4] shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#06B6D4] block font-bold truncate">
                    Qty Surplus
                  </span>
                  <AlertTriangle className="w-3.5 h-3.5 text-[#06B6D4] shrink-0" />
                </div>
                <span className="text-2xl font-mono font-bold text-white block truncate">+{liveSurplus} pcs</span>
                <span className="text-[10px] font-mono text-[#06B6D4] block truncate mt-0.5">Exceeds received!</span>
              </div>
            ) : (
              <div className={`p-3 rounded-xl border transition-all ${
                liveMissing > 0 
                  ? 'bg-[#F43F5E]/15 border-[#F43F5E]/35 text-[#F43F5E] shadow-[0_0_15px_rgba(244,63,94,0.2)]' 
                  : 'bg-white/[0.02] border-white/10 text-neutral-400'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] block">
                    Qty Shortage
                  </span>
                  {liveMissing > 0 && <AlertTriangle className="w-3.5 h-3.5 text-[#F43F5E]" />}
                </div>
                <span className={`text-2xl font-mono font-bold ${liveMissing > 0 ? 'text-[#F43F5E]' : 'text-neutral-500'}`}>
                  {liveMissing > 0 ? `-${liveMissing}` : '0'}
                </span>
                <span className="text-[10px] font-mono text-neutral-500 block mt-0.5">
                  {liveMissing > 0 ? 'Shortage detected' : 'Count balanced'}
                </span>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                Operator Signature <span className="text-[#F43F5E]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#0a0a0a] border border-white/15 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_15px_rgba(139,92,246,0.3)] shadow-xs"
                  placeholder="Operator name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                Entry Date <span className="text-[#F43F5E]">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-white/15 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_15px_rgba(139,92,246,0.3)] shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                Time In <span className="text-[#F43F5E]">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
                <input
                  type="time"
                  required
                  value={timeIn}
                  onChange={(e) => setTimeIn(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#0a0a0a] border border-white/15 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_15px_rgba(139,92,246,0.3)] shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Quantity Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {/* QTY PASSED */}
            <div className="p-5 bg-[#10B981]/5 border border-[#10B981]/30 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <label className="block text-xs font-mono font-bold text-[#10B981] uppercase tracking-wider mb-2">
                Pieces Passed OK <span className="text-[#F43F5E]">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={qtyPassed}
                onChange={(e) => {
                  setTouched(true);
                  setQtyPassed(e.target.value === '' ? '' : Number(e.target.value));
                }}
                className="w-full px-4 py-3 bg-[#080808] border border-[#10B981]/40 rounded-xl text-2xl font-mono font-bold text-[#10B981] focus:outline-none focus:border-[#10B981] focus:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                placeholder="0"
              />
              <span className="text-[10px] font-mono text-[#10B981]/70 mt-1.5 block">
                Garments completing stage successfully
              </span>
            </div>

            {/* QTY REJECTED */}
            <div className="p-5 bg-[#F59E0B]/5 border border-[#F59E0B]/30 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <label className="block text-xs font-mono font-bold text-[#F59E0B] uppercase tracking-wider mb-2">
                Pieces Defective / Scrap <span className="text-[#F43F5E]">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={qtyRejected}
                onChange={(e) => {
                  setTouched(true);
                  setQtyRejected(e.target.value === '' ? '' : Number(e.target.value));
                }}
                className="w-full px-4 py-3 bg-[#080808] border border-[#F59E0B]/40 rounded-xl text-2xl font-mono font-bold text-[#F59E0B] focus:outline-none focus:border-[#F59E0B] focus:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                placeholder="0"
              />
              <span className="text-[10px] font-mono text-[#F59E0B]/70 mt-1.5 block">
                Failed quality checks or bad cuts
              </span>
            </div>

            {/* QC REWORK */}
            {selectedStage === 'QC' && (
              <div className="p-5 bg-[#8B5CF6]/5 border border-[#8B5CF6]/30 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                <label className="block text-xs font-mono font-bold text-[#8B5CF6] uppercase tracking-wider mb-2">
                  Pieces for Rework (Fixable)
                </label>
                <input
                  type="number"
                  min="0"
                  value={qtyRework}
                  onChange={(e) => {
                    setTouched(true);
                    setQtyRework(e.target.value === '' ? '' : Number(e.target.value));
                  }}
                  className="w-full px-4 py-3 bg-[#080808] border border-[#8B5CF6]/40 rounded-xl text-2xl font-mono font-bold text-[#8B5CF6] focus:outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                  placeholder="0"
                />
                <span className="text-[10px] font-mono text-[#8B5CF6]/70 mt-1.5 block">
                  Pieces routed for alteration
                </span>
              </div>
            )}
          </div>

          {/* DISCREPANCY SECTION */}
          {hasDiscrepancy && (
            <div className={`mb-8 p-6 rounded-3xl border transition-all ${
              variance > 0 
                ? 'bg-[#06B6D4]/10 border-[#06B6D4]/40 shadow-[0_0_30px_rgba(6,182,212,0.15)]' 
                : 'bg-[#F43F5E]/10 border-[#F43F5E]/40 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${variance > 0 ? 'bg-[#06B6D4]/20 text-[#06B6D4]' : 'bg-[#F43F5E]/20 text-[#F43F5E]'}`}>
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                      <span>
                        {variance > 0 
                          ? `SURPLUS DETECTED: +${variance} PIECES EXCEED BUNDLE TALLY` 
                          : `CRITICAL SHORTAGE: ${Math.abs(variance)} PIECES UNACCOUNTED`}
                      </span>
                    </h4>
                    <p className="text-xs font-mono text-neutral-400 mt-0.5">
                      Target handoff from: <span className="text-[#8B5CF6] font-semibold">{prevStageInfo.stage}</span> operator <span className="text-white font-semibold">{prevStageInfo.operator}</span>.
                    </p>
                  </div>
                </div>

                {isDiscrepancyReportSent ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Incident Dispatched to Admin
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendReportToAdmin}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-xs font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-neutral-200 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Incident to Admin</span>
                  </button>
                )}
              </div>

              {/* Comparison chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs font-mono bg-[#080808] p-4 rounded-2xl border border-white/10">
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">Previous Operator ({prevStageInfo.stage}):</span>
                  <span className="font-bold text-white text-sm">{prevStageInfo.operator}</span>
                  <span className="text-neutral-400 block text-[11px] mt-0.5">Sent: {autoReceived} pcs</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">Current Operator ({selectedStage}):</span>
                  <span className="font-bold text-[#8B5CF6] text-sm">{operatorName}</span>
                  <span className="text-neutral-400 block text-[11px] mt-0.5">Counted: {totalAccounted} pcs</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">Net Discrepancy Variance:</span>
                  <span className={`font-bold text-sm ${variance > 0 ? 'text-[#06B6D4]' : 'text-[#F43F5E]'}`}>
                    {variance > 0 ? `+${variance} pcs (SURPLUS)` : `${variance} pcs (SHORTAGE)`}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300">
                  Incident Reason & Root Cause Details:
                </label>
                <textarea
                  rows={2}
                  value={discrepancyMessage}
                  onChange={(e) => setDiscrepancyMessage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#080808] border border-white/15 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>
          )}

          {/* Defect Reasons */}
          {numRejected > 0 && (
            <div className="mb-8 p-6 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <div className="flex items-center gap-2 text-[#F59E0B] font-mono font-bold text-xs mb-3">
                <AlertCircle className="w-4 h-4" />
                <span>DEFECT CLASSIFICATION MANDATORY ({numRejected} PIECES FAILED)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    Defect Classification <span className="text-[#F43F5E]">*</span>
                  </label>
                  <select
                    value={defectType}
                    onChange={(e) => {
                      setDefectType(e.target.value);
                      if (!rejectionReason) setRejectionReason(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#080808] border border-white/15 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
                  >
                    <option value="">-- Choose defect classification --</option>
                    {DEFECT_OPTIONS[selectedStage]?.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#080808] text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    Detailed Rejection Reason <span className="text-[#F43F5E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Specific defect explanation (e.g. Iron burn on placket)"
                    className="w-full px-3.5 py-2.5 bg-[#080808] border border-white/15 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Missing Explanation */}
          {liveMissing > 0 && (
            <div className="mb-8 p-6 rounded-2xl bg-[#F43F5E]/10 border border-[#F43F5E]/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
              <div className="flex items-center gap-2 text-[#F43F5E] font-mono font-bold text-xs mb-3">
                <AlertTriangle className="w-4 h-4" />
                <span>{liveMissing} PIECES UNACCOUNTED — MANDATORY INCIDENT REASON</span>
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={missingReason}
                  onChange={(e) => setMissingReason(e.target.value)}
                  placeholder="Where did the missing pieces go? (e.g. Dropped behind table, bundle tally mismatch)"
                  className="w-full px-4 py-2.5 bg-[#080808] border border-white/15 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#F43F5E]"
                />

                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-mono text-neutral-400">Suggestions:</span>
                  {MISSING_REASONS_SUGGESTIONS.slice(0, 4).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setMissingReason(suggestion)}
                      className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-neutral-300 cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PACKING BREAKDOWN */}
          {selectedStage === 'Packing' && (
            <div className="mb-8 p-6 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#8B5CF6]" />
                  Final Packed Qty by Size Breakdown (Mandatory at Packing)
                </h4>
                <span className="text-xs font-mono text-neutral-400">
                  Allocated: <strong className="text-[#06B6D4]">{Object.values(sizeBreakdown).reduce((a, b) => a + b, 0)}</strong> / {numPassed || 0} pcs
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2.5">
                {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                  <div key={sz} className="bg-[#080808] p-2.5 rounded-xl border border-white/10 text-center">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                      Size {sz}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={sizeBreakdown[sz] || 0}
                      onChange={(e) =>
                        setSizeBreakdown({
                          ...sizeBreakdown,
                          [sz]: Math.max(0, Number(e.target.value) || 0)
                        })
                      }
                      className="w-full text-center py-1.5 bg-transparent border border-white/15 rounded text-sm font-mono font-bold text-white focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors Box */}
          {validationErrors.length > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-[#F43F5E]/15 border border-[#F43F5E]/40 text-[#F43F5E] text-xs font-mono space-y-1.5">
              <div className="font-bold flex items-center gap-2 text-white">
                <AlertCircle className="w-4 h-4 text-[#F43F5E]" />
                <span>CANNOT COMPLETE STAGE — RESOLVE THE FOLLOWING:</span>
              </div>
              {validationErrors.map((err, i) => (
                <div key={i} className="pl-6">
                  • {err}
                </div>
              ))}
            </div>
          )}

          {/* SYNAPSE SHINY BORDER ACTION BUTTON */}
          <div className="flex items-center justify-end pt-4 w-full">
            <button
              type="submit"
              disabled={isSaveBlockedByRole}
              className={`shiny-border-btn w-full sm:w-auto ${isSaveBlockedByRole ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="shiny-border-btn-inner flex items-center justify-center space-x-2 text-white font-semibold text-xs sm:text-sm w-full">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span className="truncate">Complete & Lock {selectedStage} Stage</span>
                <ArrowRight className="w-4 h-4 text-[#06B6D4] shrink-0" />
              </div>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
