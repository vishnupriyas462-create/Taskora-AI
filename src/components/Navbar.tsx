import React, { useState, useEffect, useRef } from 'react';
import { UserRole, AuthUser } from '../types';
import { TaskoraLogo } from './TaskoraLogo';
import { DEFAULT_USERS, getAllUsers, getRoleBadgeColor, UserPreset } from '../utils/storage';
import { InstallAppModal } from './InstallAppModal';
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
  CheckCircle2,
  Sparkles,
  Menu,
  X,
  ChevronRight
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
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isLeftNavbarOpen, setIsLeftNavbarOpen] = useState(false);
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
      {/* ========================================================================= */}
      {/* SYNAPSE FUTURISTIC LEFT VERTICAL NAVBAR (OPENED BY CLICKING LOGO)        */}
      {/* ========================================================================= */}
      {isLeftNavbarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Blur */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn"
            onClick={() => setIsLeftNavbarOpen(false)}
          />

          {/* Vertical Drawer Container */}
          <aside className="relative z-50 w-84 max-w-[88vw] h-full bg-[#070709] border-r border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.95)] flex flex-col justify-between p-5 overflow-y-auto animate-slideInLeft text-white select-none">
            {/* Ambient Top Glow */}
            <div className="pointer-events-none absolute -top-16 left-0 right-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.35),transparent_70%)] blur-2xl" />

            <div>
              {/* Drawer Header with Logo & Close Button */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <TaskoraLogo size={32} />
                  {isInstalled && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded-md shrink-0">
                      APP
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsLeftNavbarOpen(false)}
                  className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="Close Navigation Drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Modules Section */}
              <div className="mb-6">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 font-semibold px-2 mb-2.5">
                  Production Modules
                </div>
                <div className="space-y-1.5">
                  {[
                    { id: 'tracker', label: 'Stage Tracker', desc: 'Cutting → Sewing → Finishing → Packing', icon: Scissors, color: '#06B6D4' },
                    { id: 'dashboard', label: 'Live Dashboard', desc: 'Real-time telemetry & yield efficiency', icon: BarChart3, color: '#8B5CF6' },
                    { id: 'reports', label: 'Reports & Audit', desc: 'Zero-loss ledger & inspection logs', icon: FileText, color: '#10B981' },
                    { id: 'master', label: 'Products & Batches', desc: 'Garment specs, SKUs & batch orders', icon: Package, color: '#F59E0B' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onTabChange(item.id as any);
                          setIsLeftNavbarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer text-left ${
                          isActive
                            ? 'bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                            : 'hover:bg-white/[0.05] text-neutral-300 hover:text-white border border-transparent hover:border-white/5'
                        }`}
                      >
                        <div className="flex items-center space-x-3 truncate">
                          <div 
                            className={`p-2 rounded-xl shrink-0 ${
                              isActive ? 'bg-black text-white' : 'bg-white/[0.04] text-neutral-300 border border-white/5'
                            }`}
                          >
                            <Icon className="w-4 h-4" style={{ color: isActive ? '#FFFFFF' : item.color }} />
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-semibold block leading-tight truncate">{item.label}</span>
                            <span className={`text-[10px] font-mono block truncate mt-0.5 ${isActive ? 'text-neutral-700' : 'text-neutral-500'}`}>
                              {item.desc}
                            </span>
                          </div>
                        </div>
                        {isActive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 ml-2" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-600 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* System Tools Section */}
              <div className="mb-6">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 font-semibold px-2 mb-2">
                  System Tools & Quick Actions
                </div>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftNavbarOpen(false);
                      setIsInstallModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/5 text-neutral-300 hover:text-white transition-colors cursor-pointer text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[#8B5CF6]/15 text-[#8B5CF6]">
                        <Download className="w-3.5 h-3.5" />
                      </div>
                      <span>Download / Install App</span>
                    </div>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#8B5CF6]/20 text-[#8B5CF6] font-bold">PWA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftNavbarOpen(false);
                      onOpenAlerts();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/5 text-neutral-300 hover:text-white transition-colors cursor-pointer text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <span>Audit Alerts & Shortages</span>
                    </div>
                    {alertCount > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F59E0B] text-black">
                        {alertCount}
                      </span>
                    )}
                  </button>

                  {onOpenCreateAccount && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsLeftNavbarOpen(false);
                        onOpenCreateAccount();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-[#10B981]/10 text-[#10B981] transition-colors cursor-pointer text-xs font-mono"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[#10B981]/15 text-[#10B981]">
                          <UserPlus className="w-3.5 h-3.5" />
                        </div>
                        <span>+ Register New Account</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Active Operator Session & Role Switcher */}
              <div className="mb-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 font-semibold px-2 mb-2">
                  Active Operator Session
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: getRoleBadgeColor(currentRole) }}
                      />
                      <span className="font-semibold text-xs text-white truncate">{currentUser?.name || currentRole}</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/10 text-[#06B6D4] font-bold shrink-0">
                      {currentRole}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400 mt-1 flex justify-between">
                    <span>ID: {currentUser?.employeeId || 'Default'}</span>
                    <span className="text-neutral-500 truncate ml-2">{currentUser?.department || 'Plant Operations'}</span>
                  </div>
                </div>

                {/* Default entries fast switch */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase px-2 block">Quick Switch Account:</span>
                  {DEFAULT_USERS.map((preset) => {
                    const isCur = currentUser?.username === preset.username;
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
                          setIsLeftNavbarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                          isCur ? 'bg-white/15 text-white font-bold' : 'hover:bg-white/5 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: preset.badgeColor }} />
                          <span className="truncate">{preset.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                          {preset.role === 'Stage Supervisor' ? 'Sup' : preset.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsLeftNavbarOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#F43F5E]/10 hover:bg-[#F43F5E]/20 border border-[#F43F5E]/30 text-[#F43F5E] text-xs font-mono font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of Terminal</span>
              </button>

              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1">
                <span>Taskora AI &bull; Garment OS</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsLeftNavbarOpen(false);
                    onResetData();
                  }}
                  className="hover:text-white underline underline-offset-2 cursor-pointer"
                >
                  Reset Demo
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* TASKORA AI FLOATING GLASS NAVIGATION PILL */}
      <header className="sticky top-4 z-40 px-3 sm:px-6 w-full pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-7xl mx-auto rounded-full px-3 sm:px-5 py-2 glass-panel shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex items-center justify-between border border-white/10 transition-all transition-snappy gap-2 sm:gap-4">
          
          {/* Left: Taskora AI Brand Logo & Vertical Navbar Trigger */}
          <button 
            type="button"
            onClick={() => setIsLeftNavbarOpen(true)}
            className="flex items-center space-x-2 sm:space-x-2.5 shrink-0 cursor-pointer group p-1 sm:px-2 sm:py-1 rounded-full hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all select-none text-left"
            title="Click to open Left Vertical Navigation Menu"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:border-[#8B5CF6]/50 group-hover:shadow-[0_0_12px_rgba(139,92,246,0.3)] transition-all shrink-0">
              <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <TaskoraLogo size={30} />
            <span className="hidden sm:inline-block font-mono text-[9px] uppercase tracking-wider text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/25 px-2 py-0.5 rounded-full group-hover:bg-[#06B6D4]/20 transition-colors">
              Menu
            </span>
          </button>

          {/* Center: Desktop Nav Tabs (11px uppercase Inter, neutral-400) */}
          <nav className="hidden xl:flex items-center p-1 rounded-full bg-white/[0.03] border border-white/5 space-x-1 shrink-0 font-inter">
            <button
              type="button"
              onClick={() => onTabChange('tracker')}
              className={`h-8 px-3.5 flex items-center justify-center text-[11px] font-semibold uppercase tracking-wider rounded-full transition-all transition-snappy cursor-pointer whitespace-nowrap leading-none select-none ${
                activeTab === 'tracker'
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)] font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              Stage Tracker
            </button>
            <button
              type="button"
              onClick={() => onTabChange('dashboard')}
              className={`h-8 px-3.5 flex items-center justify-center text-[11px] font-semibold uppercase tracking-wider rounded-full transition-all transition-snappy cursor-pointer whitespace-nowrap leading-none select-none ${
                activeTab === 'dashboard'
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)] font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              Live Dashboard
            </button>
            <button
              type="button"
              onClick={() => onTabChange('reports')}
              className={`h-8 px-3.5 flex items-center justify-center text-[11px] font-semibold uppercase tracking-wider rounded-full transition-all transition-snappy cursor-pointer whitespace-nowrap leading-none select-none ${
                activeTab === 'reports'
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)] font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              Reports & Audit
            </button>
            <button
              type="button"
              onClick={() => onTabChange('master')}
              className={`h-8 px-3.5 flex items-center justify-center text-[11px] font-semibold uppercase tracking-wider rounded-full transition-all transition-snappy cursor-pointer whitespace-nowrap leading-none select-none ${
                activeTab === 'master'
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)] font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              Products & Batches
            </button>
          </nav>

          {/* Right: Actions, Alerts & Role Selector */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Always Visible Download / Install App Button */}
            <button
              type="button"
              onClick={() => {
                if (deferredPrompt) {
                  handleInstallClick();
                } else {
                  setIsInstallModalOpen(true);
                }
              }}
              className="h-8 px-2.5 sm:px-3 flex items-center space-x-1 sm:space-x-1.5 rounded-full bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/40 text-[#8B5CF6] hover:text-white text-xs font-mono font-semibold transition-all shadow-[0_0_12px_rgba(139,92,246,0.3)] active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
              title="Download & Install Taskora AI App"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
              <span className="sm:hidden text-[11px]">App</span>
            </button>

            {/* Discrepancy Alert Pill */}
            {discrepancyCount > 0 && (
              <button
                type="button"
                onClick={onOpenAlerts}
                className="h-8 px-2 sm:px-2.5 flex items-center space-x-1 sm:space-x-1.5 rounded-full bg-[#F43F5E]/15 border border-[#F43F5E]/30 text-[#F43F5E] text-xs font-mono font-bold shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:bg-[#F43F5E]/25 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                title="Open Discrepancy Reports"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E] animate-ping" />
                <span>{discrepancyCount}</span>
                <span className="hidden md:inline font-sans text-[11px] font-semibold uppercase tracking-wider text-rose-300">Shortage</span>
              </button>
            )}

            {/* General Alerts Bell */}
            <button
              onClick={onOpenAlerts}
              className="h-8 w-8 flex items-center justify-center relative rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title="View Alerts & Audit Warnings"
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${alertCount > 0 ? 'text-[#F59E0B]' : 'text-neutral-400'}`} />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F59E0B] text-[10px] font-bold text-black ring-2 ring-[#030303]">
                  {alertCount}
                </span>
              )}
            </button>

            {/* Authenticated User Profile Menu Trigger */}
            <div className="relative flex items-center shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="h-8 flex items-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-full px-2 sm:px-2.5 text-xs shadow-xs transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                title="Account menu: Switch role or view default entries"
              >
                <div 
                  className={`w-2 h-2 rounded-full mr-1.5 sm:mr-2 shrink-0 ${
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
                <span className="hidden md:inline text-white font-medium text-xs mr-2 max-w-[100px] truncate">
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
                  {currentRole === 'Stage Supervisor' ? 'SUP' : currentRole.slice(0, 5).toUpperCase()}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-400 ml-1 sm:ml-1.5" />
              </button>

              {/* Account Dropdown Menu */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 top-11 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-2xl glass-panel border border-white/15 bg-[#0a0a0c]/98 backdrop-blur-2xl p-3 shadow-2xl animate-fadeIn">
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
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: preset.badgeColor }} />
                            <span className="text-xs truncate">{preset.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                            {preset.role === 'Stage Supervisor' ? 'Supervisor' : preset.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions inside dropdown */}
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    {/* Open Navigation Drawer */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        setIsLeftNavbarOpen(true);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 text-neutral-300 text-xs font-mono font-semibold transition-colors cursor-pointer"
                    >
                      <Menu className="w-3.5 h-3.5 text-[#06B6D4]" />
                      <span>Open Full Navigation Drawer</span>
                    </button>

                    {/* Direct Install Option inside dropdown */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        setIsInstallModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-[#8B5CF6]/15 text-[#8B5CF6] text-xs font-mono font-semibold transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download & Install App</span>
                    </button>

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
                        onResetData();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 text-neutral-400 text-xs font-mono transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Demo Records</span>
                    </button>

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
          </div>
        </div>
      </header>

      {/* Download / Install App Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallSuccess={() => setIsInstalled(true)}
      />

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
