import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  Laptop, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  ExternalLink,
  HardDriveDownload,
  Sparkles
} from 'lucide-react';
import { TaskoraLogo } from './TaskoraLogo';
import { getAllUsers, getStoredBatches, getStoredStageRecords } from '../utils/storage';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallSuccess?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'ios' | 'android' | 'desktop'>('prompt');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        if (onInstallSuccess) onInstallSuccess();
        onClose();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadOfflineData = () => {
    try {
      const data = {
        app: 'Taskora AI',
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        batches: getStoredBatches(),
        stageRecords: getStoredStageRecords(),
        users: getAllUsers()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Taskora-AI-Offline-Data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg rounded-3xl glass-panel border border-white/15 bg-[#08080a]/95 p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.35),transparent_70%)] blur-2xl" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <TaskoraLogo size={32} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Title */}
        <div className="mt-4 mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6] text-[10px] font-mono font-semibold mb-2">
            <Sparkles className="w-3 h-3 text-[#06B6D4]" />
            <span>PROGRESSIVE WEB APP & OFFLINE READY</span>
          </div>
          <h2 className="font-serif-instrument text-2xl sm:text-3xl font-normal text-white leading-tight">
            Download & Install Taskora AI
          </h2>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Install the app on your mobile phone, tablet, or desktop computer for 1-tap access and offline terminal operations.
          </p>
        </div>

        {/* Direct One-Click Install Trigger if Native PWA Prompt is Active */}
        {deferredPrompt && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6]/20 via-[#06B6D4]/15 to-[#10B981]/20 border border-[#8B5CF6]/40 shadow-[0_0_25px_rgba(139,92,246,0.25)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">One-Click Instant Install</span>
                <span className="text-[11px] font-mono text-neutral-300">Fast install supported on this browser</span>
              </div>
              <button
                type="button"
                onClick={handleNativeInstall}
                className="px-4 py-2.5 rounded-full bg-white text-black font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-neutral-200 active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-black" />
                <span>Install App Now</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-2 mb-4 bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`py-1.5 rounded-xl text-center transition-all cursor-pointer ${
              activeTab === 'android' ? 'bg-[#06B6D4]/20 text-[#06B6D4] font-bold border border-[#06B6D4]/40' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Android
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`py-1.5 rounded-xl text-center transition-all cursor-pointer ${
              activeTab === 'ios' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] font-bold border border-[#8B5CF6]/40' : 'text-neutral-400 hover:text-white'
            }`}
          >
            iPhone / iPad
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`py-1.5 rounded-xl text-center transition-all cursor-pointer ${
              activeTab === 'desktop' ? 'bg-[#10B981]/20 text-[#10B981] font-bold border border-[#10B981]/40' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Desktop (PC/Mac)
          </button>
        </div>

        {/* Tab Content Instructions */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 mb-5 text-xs font-mono space-y-3">
          {activeTab === 'ios' && (
            <>
              <div className="text-[11px] font-semibold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#8B5CF6]" />
                <span>iOS Safari Installation (Apple Devices)</span>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-neutral-300 text-[11px] leading-relaxed">
                <li>
                  Open this site in <strong className="text-white">Safari</strong> on your iPhone or iPad.
                </li>
                <li>
                  Tap the <strong className="text-white inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-white/10"><Share className="w-3 h-3" /> Share</strong> button at the bottom navigation bar.
                </li>
                <li>
                  Scroll down and tap <strong className="text-white inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-white/10"><PlusSquare className="w-3 h-3" /> Add to Home Screen</strong>.
                </li>
                <li>
                  Tap <strong className="text-white font-bold">Add</strong> at top right. The Taskora AI icon will appear on your phone home screen!
                </li>
              </ol>
            </>
          )}

          {activeTab === 'android' && (
            <>
              <div className="text-[11px] font-semibold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#06B6D4]" />
                <span>Android Chrome Installation</span>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-neutral-300 text-[11px] leading-relaxed">
                <li>
                  Open this site in <strong className="text-white">Chrome</strong> on your Android device.
                </li>
                <li>
                  Tap the <strong className="text-white">three dots menu (⋮)</strong> at the top right of Chrome.
                </li>
                <li>
                  Select <strong className="text-white font-semibold">"Install app"</strong> or <strong className="text-white font-semibold">"Add to Home screen"</strong>.
                </li>
                <li>
                  Confirm by tapping <strong className="text-[#06B6D4] font-bold">Install</strong>. The full-screen terminal app is now installed!
                </li>
              </ol>
            </>
          )}

          {activeTab === 'desktop' && (
            <>
              <div className="text-[11px] font-semibold text-white flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#10B981]" />
                <span>Desktop Chrome / Edge / Windows / Mac</span>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-neutral-300 text-[11px] leading-relaxed">
                <li>
                  Look at the right side of your browser URL bar for the <strong className="text-white">Install (⊕ / 📥)</strong> icon.
                </li>
                <li>
                  Click the install icon and select <strong className="text-white font-bold">Install</strong>.
                </li>
                <li>
                  Taskora AI runs in its own dedicated, clean window with zero browser bars or clutter!
                </li>
              </ol>
            </>
          )}
        </div>

        {/* Direct Data Backup / Offline Package Download Option */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/5 text-[#06B6D4]">
              <HardDriveDownload className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Offline Data Package</span>
              <span className="text-[10px] font-mono text-neutral-400">Download current ledger & batches to device</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadOfflineData}
            className="px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-neutral-200 hover:text-white font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[#10B981]">Downloaded</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </>
            )}
          </button>
        </div>

        {/* Footer note */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-neutral-400 hover:text-white underline underline-offset-4 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};