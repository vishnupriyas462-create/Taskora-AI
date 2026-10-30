import React, { useState, useEffect } from 'react';
import { Product, ProductionBatch, StageRecord, UserRole, DiscrepancyReport, AuthUser } from './types';
import { 
  getStoredProducts, 
  saveProducts, 
  getStoredBatches, 
  saveBatches, 
  getStoredStageRecords, 
  saveStageRecords, 
  getStoredDiscrepancies,
  saveDiscrepancies,
  resetStorageToDefaults,
  getStoredAuthUser,
  saveAuthUser
} from './utils/storage';
import { getNextStage, getBatchSummaryMetrics } from './utils/rules';
import { Navbar } from './components/Navbar';
import { BatchSelector } from './components/BatchSelector';
import { ModuleStageTracker } from './components/ModuleStageTracker';
import { ModuleBatchDashboard } from './components/ModuleBatchDashboard';
import { ModuleReports } from './components/ModuleReports';
import { ModuleMasterData } from './components/ModuleMasterData';
import { AlertsDrawer } from './components/AlertsDrawer';
import { TaskoraLogo } from './components/TaskoraLogo';
import { LoginPage } from './components/LoginPage';

export function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredAuthUser);
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [batches, setBatches] = useState<ProductionBatch[]>(getStoredBatches);
  const [records, setRecords] = useState<StageRecord[]>(getStoredStageRecords);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyReport[]>(getStoredDiscrepancies);
  const [selectedBatchNo, setSelectedBatchNo] = useState<string>(() => batches[0]?.batch_no || 'BATCH-2026-001');
  const [activeTab, setActiveTab] = useState<'tracker' | 'dashboard' | 'master' | 'reports'>('tracker');
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'alert' } | null>(null);

  const currentRole: UserRole = currentUser ? currentUser.role : 'Admin';

  // Sync auth state to LocalStorage
  useEffect(() => {
    saveAuthUser(currentUser);
  }, [currentUser]);

  // Sync state to LocalStorage
  useEffect(() => {
    saveProducts(products);
  }, [products]);

  useEffect(() => {
    saveBatches(batches);
  }, [batches]);

  useEffect(() => {
    saveStageRecords(records);
  }, [records]);

  useEffect(() => {
    saveDiscrepancies(discrepancies);
  }, [discrepancies]);

  // Current active batch object
  const currentBatch = batches.find(b => b.batch_no === selectedBatchNo) || batches[0];

  // Count active alerts & discrepancies
  const totalMissingRecords = records.filter(r => r.qty_missing > 0).length;
  const highLossBatchesCount = batches.filter(b => getBatchSummaryMetrics(b, records).isHighLoss).length;
  const openDiscrepanciesCount = discrepancies.filter(d => d.status !== 'Resolved by Admin').length;
  const totalAlertsCount = totalMissingRecords + highLossBatchesCount;

  // Handle explicit or auto-filed discrepancy report to Admin
  const handleSendDiscrepancyReport = (reportData: Omit<DiscrepancyReport, 'id' | 'reported_at'>) => {
    const newReport: DiscrepancyReport = {
      ...reportData,
      id: `DISC-${Date.now().toString().slice(-4)}`,
      reported_at: new Date().toISOString()
    };

    setDiscrepancies(prev => [newReport, ...prev]);
    setNotification({
      message: `📩 Discrepancy Incident reported to Factory Admin for ${reportData.previous_operator} (${reportData.previous_stage})!`,
      type: 'alert'
    });

    setTimeout(() => setNotification(null), 6000);
  };

  const handleUpdateDiscrepancyStatus = (
    id: string, 
    status: 'Reported to Admin' | 'Under Investigation' | 'Resolved by Admin'
  ) => {
    setDiscrepancies(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    setNotification({
      message: `Updated Discrepancy Incident status to: ${status}`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Save new stage record & advance batch stage automatically (RULE 4)
  const handleSaveStageRecord = (
    recordData: Omit<StageRecord, 'id' | 'submitted_at'>,
    discrepancyToLog?: Omit<DiscrepancyReport, 'id' | 'reported_at'>
  ) => {
    const newRecordId = `REC-${Date.now().toString().slice(-6)}-${recordData.stage_name.toUpperCase()}`;
    const newRecord: StageRecord = {
      ...recordData,
      id: newRecordId,
      submitted_at: new Date().toISOString()
    };

    // Update records array
    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);

    // Auto log discrepancy if present
    if (discrepancyToLog) {
      const autoDiscrepancy: DiscrepancyReport = {
        ...discrepancyToLog,
        id: `DISC-${Date.now().toString().slice(-4)}`,
        reported_at: new Date().toISOString()
      };
      setDiscrepancies(prev => [autoDiscrepancy, ...prev]);
    }

    // Advance current batch to the next stage
    const nextStage = getNextStage(recordData.stage_name);
    setBatches(prevBatches =>
      prevBatches.map(b => {
        if (b.batch_no === recordData.batch_no) {
          const isComplete = nextStage === 'Completed';
          return {
            ...b,
            current_stage: nextStage,
            status: isComplete ? 'Completed' : 'Active'
          };
        }
        return b;
      })
    );

    setNotification({
      message: `✅ Stage ${recordData.stage_name} locked into immutable ledger! Advanced to ${nextStage}.`,
      type: 'success'
    });

    setTimeout(() => setNotification(null), 5000);
  };

  // Add Product Master
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
    setNotification({
      message: `Product ${newProduct.product_code} registered in system.`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Add Production Batch Master
  const handleAddBatch = (newBatch: ProductionBatch) => {
    setBatches(prev => [newBatch, ...prev]);
    setSelectedBatchNo(newBatch.batch_no);
    setNotification({
      message: `Production Batch ${newBatch.batch_no} created and activated!`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Reset to default factory records
  const handleResetData = () => {
    if (window.confirm('Reset all production stages and return to factory demo records?')) {
      resetStorageToDefaults();
      setProducts(getStoredProducts());
      setBatches(getStoredBatches());
      setRecords(getStoredStageRecords());
      setDiscrepancies(getStoredDiscrepancies());
      setSelectedBatchNo(getStoredBatches()[0]?.batch_no || 'BATCH-2026-001');
      setNotification({
        message: '🔄 Data reset to default factory sample records.',
        type: 'success'
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Live telemetry summary metrics
  const activeMetrics = currentBatch ? getBatchSummaryMetrics(currentBatch, records) : null;

  const tickerItems = [
    { label: "TASKORA AI PIPELINE", value: "5-STAGE ACTIVE", color: "text-[#06B6D4]" },
    { label: "ACTIVE ORDER", value: currentBatch?.batch_no || "NONE", color: "text-white" },
    { label: "YIELD EFFICIENCY", value: `${activeMetrics?.efficiency || 100}%`, color: "text-[#10B981]" },
    { label: "ACCOUNTABILITY", value: "ZERO-TOLERANCE", color: "text-[#8B5CF6]" },
    { label: "SHORTAGES", value: `${activeMetrics?.totalMissing || 0} PCS`, color: (activeMetrics?.totalMissing || 0) > 0 ? "text-[#F43F5E]" : "text-[#10B981]" },
    { label: "DEFECTS", value: `${activeMetrics?.totalRejected || 0} PCS`, color: "text-[#F59E0B]" },
    { label: "FACTORY AUDIT", value: "IMMUTABLE LEDGER", color: "text-[#06B6D4]" },
  ];

  if (!currentUser) {
    return (
      <>
        {notification && (
          <div className="fixed top-6 right-6 z-50 animate-fadeIn">
            <div className="px-4 py-3 rounded-2xl glass-panel text-white shadow-2xl text-xs sm:text-sm font-semibold flex items-center space-x-2.5 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <span>{notification.message}</span>
            </div>
          </div>
        )}
        <LoginPage
          onLogin={(user) => {
            setCurrentUser(user);
            saveAuthUser(user);
            setNotification({
              message: `Welcome, ${user.name}! Terminal authenticated as ${user.role}.`,
              type: 'success'
            });
            setTimeout(() => setNotification(null), 4500);
          }}
        />
      </>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030303] text-[#F3F4F6] selection:bg-[#8B5CF6]/30 selection:text-white flex flex-col font-sans overflow-x-hidden">
      
      {/* SYNAPSE FLOATING AMBIENT GLOW ORBS */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-[12%] left-1/2 -translate-x-1/2 w-[750px] h-[550px] rounded-full bg-[rgba(139,92,246,0.22)] blur-[130px] animate-float-orb1" />
        <div className="absolute top-[30%] -left-[12%] w-[550px] h-[550px] rounded-full bg-[rgba(6,182,212,0.1)] blur-[120px] animate-float-orb2" />
        <div className="absolute bottom-[5%] -right-[8%] w-[500px] h-[500px] rounded-full bg-[rgba(139,92,246,0.12)] blur-[110px] animate-float-orb1" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* SYNAPSE FLOATING GLASS TOP NAVIGATION */}
      <Navbar
        currentRole={currentRole}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          saveAuthUser(null);
          setNotification({
            message: 'Terminal session logged out successfully.',
            type: 'alert'
          });
          setTimeout(() => setNotification(null), 3000);
        }}
        onResetData={handleResetData}
        alertCount={totalAlertsCount}
        discrepancyCount={openDiscrepanciesCount}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* SYNAPSE INFINITE TELEMETRY TICKER */}
      <div className="relative z-10 w-full overflow-hidden bg-black/40 border-y border-white/5 py-2.5 mt-4">
        <div className="flex animate-ticker whitespace-nowrap">
          {tickerItems.map((item, idx) => (
            <div key={`tick-1-${idx}`} className="inline-flex items-center space-x-2.5 px-6">
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                {item.label}:
              </span>
              <span className={`text-xs font-mono font-medium ${item.color}`}>
                {item.value}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20 ml-4" />
            </div>
          ))}
          {tickerItems.map((item, idx) => (
            <div key={`tick-2-${idx}`} className="inline-flex items-center space-x-2.5 px-6">
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                {item.label}:
              </span>
              <span className={`text-xs font-mono font-medium ${item.color}`}>
                {item.value}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20 ml-4" />
            </div>
          ))}
        </div>
      </div>

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-24 right-4 z-50 animate-fadeIn">
          <div className="px-4 py-3 rounded-2xl glass-panel text-white shadow-2xl text-xs sm:text-sm font-semibold flex items-center space-x-2.5 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main App Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-12">
        {/* Active Batch Selector Strip */}
        {activeTab !== 'master' && currentBatch && (
          <BatchSelector
            batches={batches}
            selectedBatchNo={selectedBatchNo}
            onSelectBatch={setSelectedBatchNo}
            onNewBatchClick={() => {
              setActiveTab('master');
            }}
            currentRole={currentRole}
          />
        )}

        {/* Tab 1: Stage Tracker (Core Module with Discrepancy Reporting to Admin) */}
        {activeTab === 'tracker' && currentBatch && (
          <ModuleStageTracker
            batch={currentBatch}
            records={records}
            onSaveRecord={handleSaveStageRecord}
            onSendDiscrepancyReport={handleSendDiscrepancyReport}
            currentRole={currentRole}
            currentUserName={currentUser.name}
          />
        )}

        {/* Tab 2: Live Batch Dashboard */}
        {activeTab === 'dashboard' && currentBatch && (
          <ModuleBatchDashboard
            batch={currentBatch}
            records={records}
            onSelectStageTab={() => {
              setActiveTab('tracker');
            }}
          />
        )}

        {/* Tab 3: Reports & Audit */}
        {activeTab === 'reports' && (
          <ModuleReports
            batches={batches}
            records={records}
            selectedBatchNo={selectedBatchNo}
            onSelectBatch={setSelectedBatchNo}
          />
        )}

        {/* Tab 4: Master Data & Batches */}
        {activeTab === 'master' && (
          <ModuleMasterData
            products={products}
            batches={batches}
            records={records}
            selectedBatchNo={selectedBatchNo}
            onSelectBatch={setSelectedBatchNo}
            onNavigateTo={(tab) => setActiveTab(tab)}
            onAddProduct={handleAddProduct}
            onAddBatch={handleAddBatch}
            currentRole={currentRole}
          />
        )}
      </main>

      {/* Alerts & Discrepancies Slideover Drawer */}
      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        batches={batches}
        records={records}
        discrepancies={discrepancies}
        onUpdateDiscrepancyStatus={handleUpdateDiscrepancyStatus}
        onSelectBatch={(bNo) => {
          setSelectedBatchNo(bNo);
          setActiveTab('dashboard');
        }}
      />

      {/* TASKORA AI EDITORIAL FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-8 mt-12 bg-[#050505] text-xs font-mono text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <TaskoraLogo size={24} textClassName="text-base" />
            <span className="text-neutral-600">//</span>
            <span className="text-neutral-400">Garment Production Neural OS</span>
          </div>

          <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
            </span>
            <span className="text-[#10B981] font-semibold text-[11px] tracking-wide">
              All Systems Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
