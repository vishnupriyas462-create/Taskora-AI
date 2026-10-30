import React, { useState } from 'react';
import { Product, ProductionBatch, StageRecord, UserRole } from '../types';
import { STAGES_LIST, getAllUsers, getRoleBadgeColor } from '../utils/storage';
import { getBatchSummaryMetrics } from '../utils/rules';
import { CreateAccountModal } from './CreateAccountModal';
import { 
  Plus, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  X, 
  Eye, 
  Activity,
  UserPlus,
  Shield,
  User,
  Building2,
  BadgeCheck
} from 'lucide-react';

interface ModuleMasterDataProps {
  products: Product[];
  batches: ProductionBatch[];
  records: StageRecord[];
  selectedBatchNo: string;
  onSelectBatch: (batchNo: string) => void;
  onNavigateTo: (tab: 'tracker' | 'dashboard' | 'reports') => void;
  onAddProduct: (product: Product) => void;
  onAddBatch: (batch: ProductionBatch) => void;
  currentRole: UserRole;
}

export const ModuleMasterData: React.FC<ModuleMasterDataProps> = ({
  products,
  batches,
  records,
  selectedBatchNo,
  onSelectBatch,
  onNavigateTo,
  onAddProduct,
  onAddBatch,
  currentRole
}) => {
  const [activeTab, setActiveTab] = useState<'batches' | 'products' | 'accounts'>('batches');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [activeDetailBatch, setActiveDetailBatch] = useState<ProductionBatch | null>(null);
  const [userList, setUserList] = useState(() => getAllUsers());

  // New Batch Form State
  const [batchNo, setBatchNo] = useState(() => `BATCH-2026-00${batches.length + 1}`);
  const [selectedProductCode, setSelectedProductCode] = useState(products[0]?.product_code || '');
  const [batchSize, setBatchSize] = useState('M');
  const [batchColor, setBatchColor] = useState('White');
  const [plannedQty, setPlannedQty] = useState(500);
  const [targetDate, setTargetDate] = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [batchNotes, setBatchNotes] = useState('');
  const [createdBy, setCreatedBy] = useState('Production Supervisor');

  // New Product Form State
  const [prodCode, setProdCode] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Shirt');
  const [prodSizes, setProdSizes] = useState('S, M, L, XL, XXL');
  const [prodColors, setProdColors] = useState('White, Blue, Black');
  const [prodDesc, setProdDesc] = useState('');

  const canEdit = currentRole === 'Admin' || currentRole === 'Stage Supervisor';

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.product_code === selectedProductCode) || products[0];
    const newBatch: ProductionBatch = {
      batch_no: batchNo.trim(),
      product_code: prod.product_code,
      product_name: prod.product_name,
      size: batchSize,
      color: batchColor,
      date_created: new Date().toISOString().split('T')[0],
      total_planned_qty: Number(plannedQty),
      current_stage: 'Cutting',
      status: 'Active',
      created_by: createdBy,
      target_delivery_date: targetDate,
      notes: batchNotes || undefined
    };
    onAddBatch(newBatch);
    setIsBatchModalOpen(false);
    setBatchNo(`BATCH-2026-00${batches.length + 2}`);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct({
      product_code: prodCode.trim().toUpperCase(),
      product_name: prodName.trim(),
      category: prodCategory,
      sizes_available: prodSizes.split(',').map(s => s.trim()).filter(Boolean),
      colors_available: prodColors.split(',').map(c => c.trim()).filter(Boolean),
      description: prodDesc.trim() || undefined,
      created_at: new Date().toISOString().split('T')[0]
    });
    setIsProductModalOpen(false);
    setProdCode('');
    setProdName('');
  };

  const detailBatchMetrics = activeDetailBatch ? getBatchSummaryMetrics(activeDetailBatch, records) : null;
  const detailBatchRecords = activeDetailBatch ? records.filter(r => r.batch_no === activeDetailBatch.batch_no) : [];
  const latestRecord = detailBatchRecords.length > 0 
    ? [...detailBatchRecords].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Header with Switcher */}
      <div className="rounded-3xl glass-panel border border-white/10 p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-instrument text-2xl sm:text-3xl text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#8B5CF6]" />
            <span>Master Data & Production Orders</span>
          </h2>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Click on any batch card to inspect its master specifications, stage timeline, and live accountability.
          </p>
        </div>

        <div className="flex items-center gap-2.5 font-mono">
          <div className="bg-white/[0.03] p-1 rounded-xl border border-white/10 flex items-center">
            <button
              onClick={() => setActiveTab('batches')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all transition-snappy cursor-pointer ${
                activeTab === 'batches' ? 'bg-white text-black font-bold shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Batches ({batches.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all transition-snappy cursor-pointer ${
                activeTab === 'products' ? 'bg-white text-black font-bold shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('accounts');
                setUserList(getAllUsers());
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all transition-snappy cursor-pointer ${
                activeTab === 'accounts' ? 'bg-white text-black font-bold shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Accounts ({userList.length})
            </button>
          </div>

          {canEdit && (
            activeTab === 'batches' ? (
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-black rounded-full text-xs font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-neutral-200 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Batch</span>
              </button>
            ) : activeTab === 'products' ? (
              <button
                onClick={() => setIsProductModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-black rounded-full text-xs font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-neutral-200 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Garment</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAccountModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-black rounded-full text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* BATCHES TAB */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {batches.map((b) => {
              const bMetrics = getBatchSummaryMetrics(b, records);
              const isSelected = selectedBatchNo === b.batch_no;
              const bRecs = records.filter(r => r.batch_no === b.batch_no);
              const completedCount = bRecs.length;
              const progressPercent = Math.round((completedCount / STAGES_LIST.length) * 100);

              return (
                <div
                  key={b.batch_no}
                  onClick={() => {
                    setActiveDetailBatch(b);
                    onSelectBatch(b.batch_no);
                  }}
                  className={`rounded-3xl glass-panel border p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] cursor-pointer hover:-translate-y-2 hover:border-[#8B5CF6]/50 transition-all transition-snappy group ${
                    isSelected ? 'border-[#8B5CF6] ring-1 ring-[#8B5CF6]/40 shadow-[0_0_25px_rgba(139,92,246,0.2)]' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-xs text-[#8B5CF6] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      {b.batch_no}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      b.status === 'Completed'
                        ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                        : 'bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30'
                    }`}>
                      {b.status === 'Completed' ? 'Completed' : `Stage: ${b.current_stage}`}
                    </span>
                  </div>

                  <h3 className="font-serif-instrument text-2xl text-white mb-1 group-hover:text-[#8B5CF6] transition-colors">
                    {b.product_name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-4">
                    <span>Variant: <strong className="text-[#06B6D4]">{b.color} / {b.size}</strong></span>
                    <span>•</span>
                    <span>Planned: <strong className="text-white">{b.total_planned_qty} pcs</strong></span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1.5">
                      <span>Pipeline Progress</span>
                      <span className="font-semibold text-white">{completedCount} of 5 stages ({progressPercent}%)</span>
                    </div>
                    <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden border border-white/5">
                      <div
                        className={`h-full transition-all duration-300 ${
                          b.status === 'Completed' ? 'bg-[#10B981]' : 'bg-[#8B5CF6]'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick Metric Stats */}
                  <div className="grid grid-cols-3 gap-2 bg-[#080808] p-2.5 rounded-xl border border-white/10 text-center text-xs font-mono mb-4">
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase block">Passed</span>
                      <span className="font-bold text-[#10B981]">{bMetrics.finalPassedOutput} pcs</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase block">Defects</span>
                      <span className="font-bold text-[#F59E0B]">-{bMetrics.totalRejected}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase block">Missing</span>
                      <span className={`font-bold ${bMetrics.totalMissing > 0 ? 'text-[#F43F5E]' : 'text-neutral-500'}`}>
                        -{bMetrics.totalMissing}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-neutral-500 pt-3 border-t border-white/5">
                    <span className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {b.date_created}
                    </span>
                    <span className="text-[#06B6D4] font-semibold group-hover:text-white flex items-center gap-1 text-[11px] transition-colors">
                      <span>Inspect Details</span>
                      <Eye className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Table View */}
          <div className="rounded-3xl glass-panel border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden mt-8">
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
              <h3 className="font-serif-instrument text-2xl text-white">Production Orders Ledger</h3>
              <span className="text-xs font-mono text-neutral-400">{batches.length} orders total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] text-neutral-400 border-b border-white/10">
                  <tr>
                    <th className="p-3">Batch No</th>
                    <th className="p-3">Garment Item</th>
                    <th className="p-3">Variant</th>
                    <th className="p-3 text-right">Planned Master</th>
                    <th className="p-3 text-center">Current Stage</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Created By</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {batches.map((b) => (
                    <tr
                      key={b.batch_no}
                      onClick={() => {
                        setActiveDetailBatch(b);
                        onSelectBatch(b.batch_no);
                      }}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <td className="p-3 font-bold text-[#8B5CF6]">{b.batch_no}</td>
                      <td className="p-3 font-semibold text-white">{b.product_name}</td>
                      <td className="p-3 text-neutral-300">{b.color} / {b.size}</td>
                      <td className="p-3 text-right font-bold text-white">{b.total_planned_qty} pcs</td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30">
                          {b.current_stage}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'Completed' ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' : 'bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-neutral-400">{b.created_by}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          className="text-xs text-[#06B6D4] hover:text-white font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {products.map((p) => (
            <div key={p.product_code} className="rounded-3xl glass-panel border border-white/10 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:-translate-y-2 hover:border-[#06B6D4]/40 transition-all transition-snappy space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-[#06B6D4]/15 text-[#06B6D4] rounded-lg border border-[#06B6D4]/30">
                  {p.product_code}
                </span>
                <span className="text-xs font-mono text-neutral-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                  {p.category}
                </span>
              </div>
              <div>
                <h4 className="font-serif-instrument text-2xl text-white">{p.product_name}</h4>
                {p.description && <p className="text-xs font-mono text-neutral-400 mt-1">{p.description}</p>}
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2.5 text-xs font-mono">
                <div>
                  <span className="text-neutral-500 block mb-1 text-[10px] uppercase tracking-wider">Sizes Available:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {p.sizes_available.map(s => (
                      <span key={s} className="px-2.5 py-0.5 bg-white/[0.03] border border-white/10 rounded-md text-white font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-500 block mb-1 text-[10px] uppercase tracking-wider">Colors Available:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {p.colors_available.map(c => (
                      <span key={c} className="px-2.5 py-0.5 bg-white/[0.03] border border-white/10 rounded-md text-neutral-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ACCOUNTS TAB */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="rounded-2xl glass-panel border border-white/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-neutral-400">
              <Shield className="w-4 h-4 text-[#10B981]" />
              <span>
                Default system entries and registered workstation accounts configured for this facility.
              </span>
            </div>
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] font-bold text-xs hover:bg-[#10B981]/25 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Create New Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {userList.map((u) => {
              const isDefault = ['admin', 'supervisor', 'operator', 'qc_inspector', 'viewer'].includes(u.username);
              const badgeColor = u.badgeColor || getRoleBadgeColor(u.role);
              return (
                <div
                  key={u.username}
                  className="rounded-3xl glass-panel border border-white/10 p-6 shadow-lg hover:border-white/20 transition-all space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border"
                      style={{
                        backgroundColor: `${badgeColor}20`,
                        color: badgeColor,
                        borderColor: `${badgeColor}40`
                      }}
                    >
                      {u.role}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                      {isDefault ? 'Default System Entry' : 'Custom Account'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif-instrument text-2xl text-white">
                      {u.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs font-mono text-neutral-400">
                      <span>Handle: <strong className="text-white">@{u.username}</strong></span>
                      <span>&bull;</span>
                      <span>ID: <strong className="text-[#06B6D4]">{u.employeeId}</strong></span>
                    </div>
                  </div>

                  <p className="text-xs font-mono text-neutral-400 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                    {u.description || 'Registered production line operator workstation account.'}
                  </p>

                  <div className="pt-2 border-t border-white/10 text-xs font-mono flex items-center justify-between text-neutral-400">
                    <span className="truncate">{u.department}</span>
                    <span className="text-[#10B981] flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      Active
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: BATCH DETAILS CARD */}
      {activeDetailBatch && detailBatchMetrics && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)] animate-fadeIn relative my-0 sm:my-8 max-h-[92vh] overflow-y-auto text-white">
            {/* Mobile Sheet Drag Indicator */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />

            <button
              onClick={() => setActiveDetailBatch(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30 rounded-md">
                {activeDetailBatch.batch_no}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                activeDetailBatch.status === 'Completed'
                  ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                  : 'bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30'
              }`}>
                {activeDetailBatch.status === 'Completed' ? 'Completed Run' : `Active at ${activeDetailBatch.current_stage}`}
              </span>
            </div>

            <h3 className="font-serif-instrument text-2xl sm:text-3xl text-white mb-0.5">
              {activeDetailBatch.product_name}
            </h3>
            <p className="text-xs font-mono text-neutral-400 mb-6">
              Master Order Specifications & Live Production Stage Accountability
            </p>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/[0.02] p-4 rounded-2xl border border-white/10 mb-6 text-xs font-mono">
              <div>
                <span className="text-neutral-500 block mb-1">Style Code</span>
                <span className="font-semibold text-white">{activeDetailBatch.product_code}</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Variant (Color / Size)</span>
                <span className="font-semibold text-[#06B6D4]">{activeDetailBatch.color} / {activeDetailBatch.size}</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Planned Master Qty</span>
                <span className="font-bold text-white text-sm">{activeDetailBatch.total_planned_qty} pcs</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Created By</span>
                <span className="font-semibold text-white">{activeDetailBatch.created_by}</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Date Started</span>
                <span className="text-neutral-300">{activeDetailBatch.date_created}</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Target Delivery</span>
                <span className="text-neutral-300">{activeDetailBatch.target_delivery_date || 'Standard'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-neutral-500 block mb-1">Notes / Instructions</span>
                <span className="text-neutral-400 italic">{activeDetailBatch.notes || 'No special notes.'}</span>
              </div>
            </div>

            {/* Live Update Section */}
            <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 p-5 rounded-2xl mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#8B5CF6]" />
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Live Production Status Update</h4>
                </div>
                <span className="text-xs font-mono font-bold text-[#06B6D4]">
                  {detailBatchMetrics.efficiency}% Yield
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center mb-3 font-mono">
                <div className="p-2.5 bg-[#080808] rounded-xl border border-white/10">
                  <span className="text-[10px] text-neutral-400 uppercase block">Current Output</span>
                  <span className="text-sm font-bold text-[#10B981]">{detailBatchMetrics.finalPassedOutput} pcs</span>
                </div>
                <div className="p-2.5 bg-[#080808] rounded-xl border border-white/10">
                  <span className="text-[10px] text-neutral-400 uppercase block">Defective</span>
                  <span className="text-sm font-bold text-[#F59E0B]">{detailBatchMetrics.totalRejected} pcs</span>
                </div>
                <div className="p-2.5 bg-[#080808] rounded-xl border border-white/10">
                  <span className="text-[10px] text-neutral-400 uppercase block">Shortage</span>
                  <span className={`text-sm font-bold ${detailBatchMetrics.totalMissing > 0 ? 'text-[#F43F5E]' : 'text-neutral-500'}`}>
                    {detailBatchMetrics.totalMissing} pcs
                  </span>
                </div>
                <div className="p-2.5 bg-[#080808] rounded-xl border border-white/10">
                  <span className="text-[10px] text-neutral-400 uppercase block">Net Loss</span>
                  <span className="text-sm font-bold text-[#F43F5E]">{detailBatchMetrics.totalLoss} pcs</span>
                </div>
              </div>

              {latestRecord && (
                <div className="text-xs font-mono text-neutral-300 bg-[#080808] p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                  <span>
                    Latest update on <strong className="text-white">{latestRecord.stage_name}</strong> by{' '}
                    <strong className="text-[#8B5CF6]">{latestRecord.operator_name}</strong>
                  </span>
                  <span className="text-[11px] text-neutral-500">{new Date(latestRecord.submitted_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Stage Timeline */}
            <div className="mb-6">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2.5">
                STAGE EXECUTION TRAIL ({detailBatchRecords.length} OF 5 COMPLETED)
              </h4>
              <div className="space-y-2 font-mono">
                {STAGES_LIST.map((stage) => {
                  const rec = detailBatchRecords.find(r => r.stage_name === stage);
                  const isCurrent = activeDetailBatch.current_stage === stage;

                  return (
                    <div
                      key={stage}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        rec
                          ? 'bg-white/[0.02] border-[#10B981]/30 text-white'
                          : isCurrent
                          ? 'bg-[#06B6D4]/10 border-[#06B6D4]/30 text-white font-medium'
                          : 'bg-transparent border-white/5 text-neutral-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {rec ? (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        ) : isCurrent ? (
                          <Clock className="w-4 h-4 text-[#06B6D4]" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-neutral-700" />
                        )}
                        <span className="font-semibold text-white">{stage}</span>
                      </div>

                      {rec ? (
                        <div className="flex items-center gap-3">
                          <span className="text-[#10B981] font-semibold">Passed: {rec.qty_passed}</span>
                          {rec.qty_rejected > 0 && (
                            <span className="text-[#F59E0B]">Defects: -{rec.qty_rejected}</span>
                          )}
                          {rec.qty_missing > 0 && (
                            <span className="text-[#F43F5E] font-bold">Missing: -{rec.qty_missing}</span>
                          )}
                          <span className="text-[10px] text-neutral-500">({rec.operator_name})</span>
                        </div>
                      ) : isCurrent ? (
                        <span className="text-[#06B6D4] text-[11px]">In progress</span>
                      ) : (
                        <span className="text-neutral-600 text-[11px]">Pending</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-white/10 font-mono">
              <button
                type="button"
                onClick={() => {
                  onSelectBatch(activeDetailBatch.batch_no);
                  setActiveDetailBatch(null);
                  onNavigateTo('dashboard');
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold cursor-pointer border border-white/10"
              >
                View Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectBatch(activeDetailBatch.batch_no);
                  setActiveDetailBatch(null);
                  onNavigateTo('reports');
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold cursor-pointer border border-white/10"
              >
                Inspect Reports
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectBatch(activeDetailBatch.batch_no);
                  setActiveDetailBatch(null);
                  onNavigateTo('tracker');
                }}
                className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-full text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open in Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE BATCH */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)] animate-fadeIn max-h-[92vh] overflow-y-auto text-white">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-serif-instrument text-2xl text-white">Create New Production Batch</h3>
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs font-mono text-neutral-400 mb-6">
              Enter the planned master quantity that all stages will track against.
            </p>

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">Batch Number</label>
                <input
                  type="text"
                  required
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080808] border border-white/15 rounded-xl text-white font-mono focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">Select Garment / Product</label>
                <select
                  value={selectedProductCode}
                  onChange={(e) => setSelectedProductCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080808] border border-white/15 rounded-xl text-white cursor-pointer focus:border-[#8B5CF6] focus:outline-none"
                >
                  {products.map(p => (
                    <option key={p.product_code} value={p.product_code} className="bg-[#080808] text-white">
                      {p.product_code} — {p.product_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5">Size</label>
                  <input
                    type="text"
                    required
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#080808] border border-white/15 rounded-xl text-white focus:border-[#8B5CF6] focus:outline-none"
                    placeholder="M"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5">Color</label>
                  <input
                    type="text"
                    required
                    value={batchColor}
                    onChange={(e) => setBatchColor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#080808] border border-white/15 rounded-xl text-white focus:border-[#8B5CF6] focus:outline-none"
                    placeholder="Navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-bold mb-1.5">
                  Total Planned Qty (Master Baseline) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={plannedQty}
                  onChange={(e) => setPlannedQty(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 bg-[#080808] border border-white/15 rounded-xl text-white font-bold text-sm focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">Target Delivery Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080808] border border-white/15 rounded-xl text-white focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">Created By</label>
                <input
                  type="text"
                  required
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080808] border border-white/15 rounded-xl text-white focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black hover:bg-neutral-200 rounded-full font-bold shadow-xs cursor-pointer"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)] animate-fadeIn max-h-[92vh] overflow-y-auto text-white">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-serif-instrument text-2xl text-white">Add Garment Master Item</h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs font-mono text-neutral-400 mb-6">Register a style pattern in the system.</p>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5">Product Code</label>
                  <input
                    type="text"
                    required
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value)}
                    placeholder="SHT-004"
                    className="w-full px-3.5 py-2.5 bg-[#080808] border border-white/15 rounded-xl text-white font-mono focus:border-[#8B5CF6] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#080808] border border-white/15 rounded-xl text-white cursor-pointer focus:border-[#8B5CF6] focus:outline-none"
                  >
                    <option value="Shirt" className="bg-[#080808] text-white">Shirt</option>
                    <option value="Trouser" className="bg-[#080808] text-white">Trouser</option>
                    <option value="Jacket" className="bg-[#080808] text-white">Jacket</option>
                    <option value="T-Shirt" className="bg-[#080808] text-white">T-Shirt</option>
                    <option value="Hoodie" className="bg-[#080808] text-white">Hoodie</option>
                    <option value="Other" className="bg-[#080808] text-white">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">Product Name</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Linen Slim Fit Shirt"
                  className="w-full px-3.5 py-2.5 bg-[#080808] border border-white/15 rounded-xl text-white focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">Sizes Available</label>
                <input
                  type="text"
                  required
                  value={prodSizes}
                  onChange={(e) => setProdSizes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080808] border border-white/15 rounded-xl text-white focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">Colors Available</label>
                <input
                  type="text"
                  required
                  value={prodColors}
                  onChange={(e) => setProdColors(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080808] border border-white/15 rounded-xl text-white focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black hover:bg-neutral-200 rounded-full font-bold shadow-xs cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ACCOUNT MODAL */}
      <CreateAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onAccountCreated={() => {
          setUserList(getAllUsers());
        }}
      />
    </div>
  );
};
