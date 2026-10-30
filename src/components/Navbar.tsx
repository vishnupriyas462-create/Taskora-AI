import React, { useState, useEffect, useRef } from 'react';
import { UserRole, AuthUser } from '../types';
import { TaskoraLogo } from './TaskoraLogo';
import { DEFAULT_USERS, getAllUsers, getRoleBadgeColor, UserPreset } from '../utils/storage';
import { 
  Scissors, 
  AlertTriangle, 
  Shield, 
  RotateCcw, 
  BarChart3, 
  FileText, 
  Package, 
  Download,
  BellRing,
  LogOut,
  User,
  UserPlus,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onSwitchUser?: (user: AuthUser) => void;
  onOpenCreateAccount?: () => void;
  onResetData: () => void;
  alertCount: number;
  discrepancyCount?: number;
  onOpenAlerts: () => void;
  activeTab: 'tracker' | 'dashboard' | 'master' | 'reports';
  onTabChange: (tab: 'tracker' | 'dashboard' | 'master' | 'reports') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentUser,
  onLogout,
  onSwitchUser,
  onOpenCreateAccount,
  onResetData,
  alertCount,
  discrepancyCount = 0,
  onOpenAlerts,
  activeTab,
  onTabChange
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const allUsers = getAllUsers();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      {/* TASKORA AI FLOATING GLASS NAVIGATION PILL */}
      <header className="sticky top-4 z-40 px-3 sm:px-6 w-full pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-6xl mx-auto rounded-full px-4 sm:px-6 py-2.5 glass-panel shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex items-center justify-between border border-white/10 transition-all transition-snappy">
          
          {/* Left: Taskora AI Brand Logo & Name */}
          <div 
            onClick={() => onTabChange('tracker')}
            className="flex items-center space-x-2.5 sm:space-x-3 shrink-0 cursor-pointer group"
            title="Taskora AI — Garment Production Neural OS"
          >
            <TaskoraLogo size={32} />
            {isInstalled && (
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded-md">
                APP
              </span>
            )}
          </div>

          {/* Center: Desktop Nav Tabs (12px uppercase Inter, neutral-400) */}
          <nav className="hidden lg:flex items-center space-x-1 font-inter">
            <button
              onClick={() => onTabChange('tracker')}
              className={`px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-wider rounded-full transition-all transition-snappy cursor-pointer ${
                activeTab === 'tracker'
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              Stage Tracker
            </button>
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-wider rounded-full transition-all transition-snappy cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              Live Dashboard
            </button>
            <button
              onClick={() => onTabChange('reports')}
              className={`px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-wider rounded-full transition-all transition-snappy cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              Reports & Audit
            </button>
            <button
              onClick={() => onTabChange('master')}
              className={`px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-wider rounded-full transition-all transition-snappy cursor-pointer ${
                activeTab === 'master'
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              Products & Batches
            </button>
          </nav>

          {/* Right: Actions, Alerts & Role Selector */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Install PWA Prompt */}
            {deferredPrompt && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6] text-xs font-semibold hover:bg-[#8B5CF6]/25 transition-colors cursor-pointer"
                title="Install Taskora AI App"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}

            {/* Discrepancy Alert Pill */}
            {discrepancyCount > 0 && (
              <button
                type="button"
                onClick={onOpenAlerts}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#F43F5E]/15 border border-[#F43F5E]/30 text-[#F43F5E] text-xs font-mono font-bold shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:bg-[#F43F5E]/25 transition-colors cursor-pointer"
                title="Open Discrepancy Reports"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E] animate-ping" />
                <span>{discrepancyCount}</span>
                <span className="hidden sm:inline font-sans text-[11px] font-semibold uppercase tracking-wider text-rose-300">Shortage</span>
              </button>
            )}

            {/* General Alerts Bell */}
            <button
              onClick={onOpenAlerts}
              className="relative p-2 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="View Alerts & Audit Warnings"
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${alertCount > 0 ? 'text-[#F59E0B]' : 'text-neutral-400'}`} />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F59E0B] text-[10px] font-bold text-black ring-2 ring-[#030303]">
                  {alertCount}
                </span>
              )}
            </button>

            {/* Authenticated User Profile Menu & Create Account */}
            <div className="relative flex items-center space-x-2" ref={menuRef}>
              {/* "+ Create Account" Quick Action */}
              {onOpenCreateAccount && (
                <button
                  type="button"
                  onClick={onOpenCreateAccount}
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 hover:text-white transition-all text-xs font-mono cursor-pointer"
                  title="Register new operator / supervisor account"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Create Account</span>
                </button>
              )}

              {/* Profile Pill Trigger */}
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-full px-2.5 py-1 text-xs shadow-xs transition-colors cursor-pointer"
                title="Account menu: Switch role or view default entries"
              >
                <div 
                  className={`w-2 h-2 rounded-full mr-2 shrink-0 ${
                    currentRole === 'Admin' 
                      ? 'bg-[#8B5CF6] shadow-[0_0_8px_rgba(139,92,246,0.8)]' 
                      : currentRole === 'Stage Supervisor'
                      ? 'bg-[#06B6D4] shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                      : currentRole === 'Operator'
                      ? 'bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                      : currentRole === 'QC Inspector'
                      ? 'bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                      : 'bg-neutral-400'
                  }`} 
                />
                <span className="hidden sm:inline text-white font-medium text-xs mr-2 max-w-[110px] truncate">
                  {currentUser?.name || currentRole}
                </span>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                  currentRole === 'Admin'
                    ? 'bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30'
                    : currentRole === 'Stage Supervisor'
                    ? 'bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30'
                    : currentRole === 'Operator'
                    ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                    : currentRole === 'QC Inspector'
                    ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                    : 'bg-neutral-500/15 text-neutral-400 border border-neutral-500/30'
                }`}>
                  {currentRole === 'Stage Supervisor' ? 'SUPERVISOR' : currentRole.toUpperCase()}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-400 ml-1.5" />
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.03] hover:bg-[#F43F5E]/15 border border-white/10 hover:border-[#F43F5E]/40 text-neutral-400 hover:text-[#F43F5E] transition-all duration-200 cursor-pointer"
                title="Log out of Terminal session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px] font-mono tracking-tight font-semibold">Exit</span>
              </button>

              {/* Account Dropdown Menu */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl glass-panel border border-white/15 bg-[#0a0a0c]/95 backdrop-blur-2xl p-3 shadow-2xl animate-fadeIn">
                  <div className="pb-2.5 mb-2.5 border-b border-white/10">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                      Active Session
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5 truncate">
                      {currentUser?.name || currentRole}
                    </div>
                    <div className="text-[11px] font-mono text-neutral-400 flex items-center justify-between mt-0.5">
                      <span>{currentUser?.employeeId || 'ID: Default'}</span>
                      <span className="text-[#06B6D4]">{currentRole}</span>
                    </div>
                  </div>

                  {/* Switch to Default Entries */}
                  <div className="space-y-1 mb-2.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold px-2 pb-1">
                      Default Entries (Quick Switch)
                    </div>
                    {DEFAULT_USERS.map((preset) => {
                      const isCurrent = currentUser?.username === preset.username;
                      return (
                        <button
                          key={preset.username}
                          type="button"
                          onClick={() => {
                            if (onSwitchUser) {
                              onSwitchUser({
                                username: preset.username,
                                name: preset.name,
                                role: preset.role,
                                employeeId: preset.employeeId,
                                department: preset.department,
                                lastLogin: new Date().toISOString()
                              });
                            }
                            setIsAccountMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                            isCurrent ? 'bg-white/15 text-white font-bold' : 'hover:bg-white/5 text-neutral-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.badgeColor }} />
                            <span className="text-xs truncate">{preset.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {preset.role === 'Stage Supervisor' ? 'Supervisor' : preset.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions inside dropdown */}
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    {onOpenCreateAccount && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onOpenCreateAccount();
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-[#10B981]/15 text-[#10B981] text-xs font-mono font-semibold transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>+ Create New Account</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-[#F43F5E]/15 text-[#F43F5E] text-xs font-mono font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out to Login Screen</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Reset button (Desktop) */}
            <button
              onClick={onResetData}
              className="hidden xl:flex items-center space-x-1 p-2 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Reset factory demo records"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* SYNAPSE MOBILE FLOATING BOTTOM NAVIGATION PILL */}
      <nav aria-label="Mobile Navigation" className="lg:hidden fixed bottom-4 left-4 right-4 z-40 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="max-w-md mx-auto grid grid-cols-4 h-14 rounded-full glass-panel border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-2xl px-2">
          <button
            onClick={() => onTabChange('tracker')}
            className={`flex flex-col items-center justify-center space-y-1 transition-all transition-snappy cursor-pointer ${
              activeTab === 'tracker'
                ? 'text-[#06B6D4] font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <div className={`p-1 rounded-full ${activeTab === 'tracker' ? 'bg-[#06B6D4]/15 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : ''}`}>
              <Scissors className="w-3.5 h-3.5 transform -rotate-45" />
            </div>
            <span className="text-[9px] font-mono uppercase tracking-wider">Tracker</span>
          </button>

          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center justify-center space-y-1 transition-all transition-snappy cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-[#8B5CF6] font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <div className={`p-1 rounded-full ${activeTab === 'dashboard' ? 'bg-[#8B5CF6]/15 shadow-[0_0_10px_rgba(139,92,246,0.4)]' : ''}`}>
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono uppercase tracking-wider">Dashboard</span>
          </button>

          <button
            onClick={() => onTabChange('reports')}
            className={`flex flex-col items-center justify-center space-y-1 transition-all transition-snappy cursor-pointer ${
              activeTab === 'reports'
                ? 'text-[#10B981] font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <div className={`p-1 rounded-full ${activeTab === 'reports' ? 'bg-[#10B981]/15 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : ''}`}>
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono uppercase tracking-wider">Reports</span>
          </button>

          <button
            onClick={() => onTabChange('master')}
            className={`flex flex-col items-center justify-center space-y-1 transition-all transition-snappy cursor-pointer ${
              activeTab === 'master'
                ? 'text-white font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <div className={`p-1 rounded-full ${activeTab === 'master' ? 'bg-white/15' : ''}`}>
              <Package className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono uppercase tracking-wider">Batches</span>
          </button>
        </div>
      </nav>
    </>
  );
};
