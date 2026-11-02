import React, { useState, useEffect } from 'react';
import { UserRole, AuthUser } from '../types';
import { DEFAULT_USERS, UserPreset, getAllUsers, saveNewUser, getRoleBadgeColor } from '../utils/storage';
import { TaskoraLogo } from './TaskoraLogo';
import { InstallAppModal } from './InstallAppModal';
import { 
  Shield, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  KeyRound,
  AlertCircle,
  UserPlus,
  LogIn,
  Building2,
  BadgeCheck,
  Check,
  Download
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [activeMode, setActiveMode] = useState<'signin' | 'signup'>('signin');
  const [allUsersList, setAllUsersList] = useState<UserPreset[]>(() => getAllUsers());

  // Sign In Form State
  const [selectedRole, setSelectedRole] = useState<UserRole>('Admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [customName, setCustomName] = useState('Elena Rostova');
  const [employeeId, setEmployeeId] = useState('ADM-101');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Sign Up / Create Account Form State
  const [regFullName, setRegFullName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Operator');
  const [regUsername, setRegUsername] = useState('');
  const [regEmployeeId, setRegEmployeeId] = useState('');
  const [regDepartment, setRegDepartment] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Auto-suggest employee ID and department when role changes in registration
  useEffect(() => {
    if (activeMode === 'signup' && !regEmployeeId) {
      const prefix = regRole === 'Admin' ? 'ADM' 
        : regRole === 'Stage Supervisor' ? 'SUP' 
        : regRole === 'Operator' ? 'OPR' 
        : regRole === 'QC Inspector' ? 'QC' 
        : 'AUD';
      const randomNum = Math.floor(100 + Math.random() * 900);
      setRegEmployeeId(`${prefix}-${randomNum}`);
    }

    if (activeMode === 'signup' && !regDepartment) {
      const defaultDept = regRole === 'Admin' ? 'Plant Governance & Operations'
        : regRole === 'Stage Supervisor' ? 'Production Line Floor'
        : regRole === 'Operator' ? 'Cutting & Sewing Workstation'
        : regRole === 'QC Inspector' ? 'Quality Audit & Inspection'
        : 'Auditor & External Review';
      setRegDepartment(defaultDept);
    }
  }, [regRole, activeMode]);

  // When clicking a preset role profile card in Sign In
  const handleSelectPreset = (preset: UserPreset) => {
    setSelectedRole(preset.role);
    setUsername(preset.username);
    setPassword(preset.password || '123456');
    setCustomName(preset.name);
    setEmployeeId(preset.employeeId);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Quick instant login for default entries
  const handleInstantLogin = (preset: UserPreset) => {
    setIsLoading(true);
    setTimeout(() => {
      const authUser: AuthUser = {
        username: preset.username,
        name: preset.name,
        role: preset.role,
        employeeId: preset.employeeId,
        department: preset.department,
        lastLogin: new Date().toISOString()
      };
      setIsLoading(false);
      onLogin(authUser);
    }, 350);
  };

  // Sign In Submission
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim()) {
      setErrorMessage('Please enter an Employee ID or Username.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter a password.');
      return;
    }

    setIsLoading(true);

    // Futuristic terminal authentication delay
    setTimeout(() => {
      // Check if user exists in registered or default users
      const existingUser = allUsersList.find(
        u => u.username.toLowerCase() === username.trim().toLowerCase()
      );

      const authUser: AuthUser = {
        username: username.trim(),
        name: existingUser?.name || customName.trim() || username.trim(),
        role: existingUser?.role || selectedRole,
        employeeId: existingUser?.employeeId || employeeId.trim() || `EMP-${Math.floor(100 + Math.random() * 900)}`,
        department: existingUser?.department || DEFAULT_USERS.find(u => u.role === selectedRole)?.department || 'Manufacturing Floor',
        lastLogin: new Date().toISOString()
      };

      setIsLoading(false);
      onLogin(authUser);
    }, 550);
  };

  // Create Account Submission
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regFullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!regUsername.trim()) {
      setErrorMessage('Please choose a username.');
      return;
    }

    if (!regPassword.trim()) {
      setErrorMessage('Please enter a password.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    if (regPassword.length < 3) {
      setErrorMessage('Password must be at least 3 characters.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const newPreset: UserPreset = {
        username: regUsername.trim().toLowerCase(),
        name: regFullName.trim(),
        role: regRole,
        employeeId: regEmployeeId.trim() || `EMP-${Math.floor(100 + Math.random() * 900)}`,
        department: regDepartment.trim() || 'Floor Workstation',
        password: regPassword,
        description: `Registered ${regRole} account created for ${regFullName.trim()}.`,
        badgeColor: getRoleBadgeColor(regRole)
      };

      // Save to localStorage
      saveNewUser(newPreset);
      const updatedList = getAllUsers();
      setAllUsersList(updatedList);

      setIsLoading(false);

      // Authenticate immediately
      const newAuthUser: AuthUser = {
        username: newPreset.username,
        name: newPreset.name,
        role: newPreset.role,
        employeeId: newPreset.employeeId,
        department: newPreset.department,
        lastLogin: new Date().toISOString()
      };

      onLogin(newAuthUser);
    }, 600);
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-white flex flex-col justify-center items-center px-4 py-8 overflow-hidden select-none">
      {/* FLOATING AMBIENT ORBS & BACKGROUND GRADIENTS */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[650px] h-[550px] rounded-full bg-[rgba(139,92,246,0.30)] blur-[120px] animate-float-orb1" />
        <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[rgba(6,182,212,0.14)] blur-[110px] animate-float-orb2" />
        <div className="absolute -bottom-[10%] -right-[5%] w-[450px] h-[450px] rounded-full bg-[rgba(16,185,129,0.15)] blur-[110px] animate-float-orb1" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* LOGIN CARD CONTAINER */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Top Floating Badge & Download Option */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-neutral-300">
              Terminal Node 01 &bull; Zero-Loss Pipeline
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsInstallModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/40 text-[#8B5CF6] hover:text-white text-xs font-mono font-semibold transition-all shadow-[0_0_12px_rgba(139,92,246,0.3)] active:scale-95 cursor-pointer shrink-0"
            title="Download & Install Taskora AI on this device"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download App</span>
          </button>
        </div>

        {/* Main Glassmorphic Card */}
        <div className="rounded-3xl glass-panel border border-white/10 p-6 sm:p-8 md:p-10 shadow-[0_16px_64px_rgba(0,0,0,0.85)]">
          {/* Header & Logo */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <TaskoraLogo size={44} textClassName="text-2xl sm:text-3xl" />
            </div>
            <p className="font-mono text-xs text-neutral-400 max-w-md mx-auto mt-1 tracking-tight">
              {activeMode === 'signin' 
                ? 'Authenticate with your assigned operator or manager credentials to enter the production line terminal.'
                : 'Create a new operator, supervisor, or inspector profile for the production line system.'}
            </p>
          </div>

          {/* Mode Switcher Tabs: Sign In vs Create Account */}
          <div className="flex justify-center mb-6">
            <div className="p-1 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('signin');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                  activeMode === 'signin'
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In Terminal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMode('signup');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                  activeMode === 'signup'
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-3 rounded-2xl bg-[#F43F5E]/10 border border-[#F43F5E]/30 text-[#F43F5E] text-xs font-mono flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-6 p-3 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-mono flex items-center gap-2.5 animate-fadeIn">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ======================= MODE 1: SIGN IN ======================= */}
          {activeMode === 'signin' && (
            <div>
              {/* Quick Role Preset Cards (Keeps default entries & custom accounts) */}
              <div className="mb-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-300 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
                      Default Entries & Quick Access Profiles
                    </label>
                    <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                      Click any default entry to auto-fill or use "Login &rarr;" for instant access
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMode('signup')}
                    className="self-start sm:self-auto flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 hover:bg-[#10B981]/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Create Account</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {allUsersList.map((preset) => {
                    const isSelected = selectedRole === preset.role && username === preset.username;
                    return (
                      <div
                        key={`${preset.role}-${preset.username}`}
                        onClick={() => handleSelectPreset(preset)}
                        className={`relative p-2.5 rounded-2xl text-left transition-all duration-200 border cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-white/10 border-white/40 shadow-[0_0_20px_rgba(139,92,246,0.35)] scale-[1.02]'
                            : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: preset.badgeColor || getRoleBadgeColor(preset.role) }} 
                            />
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                            )}
                          </div>
                          <div className="text-xs font-bold text-white tracking-tight truncate">
                            {preset.role}
                          </div>
                          <div className="text-[10px] font-mono text-neutral-400 truncate mt-0.5">
                            {preset.name.split(' ')[0]}
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[9px] font-mono text-neutral-500">
                            {preset.employeeId}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInstantLogin(preset);
                            }}
                            className="text-[9px] font-mono font-bold text-white bg-white/10 hover:bg-white/25 px-2 py-0.5 rounded-full border border-white/15 transition-all cursor-pointer"
                            title={`Instant login as ${preset.name} (${preset.role})`}
                          >
                            Login &rarr;
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Employee ID / Username */}
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1.5">
                      Employee ID / Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. admin or employee ID"
                        className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-2xl text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1.5">
                      Full Name / Shift Operator
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                        <Shield className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="e.g. Elena Rostova"
                        className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-2xl text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider">
                      Terminal Key / Password
                    </label>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Default demo passwords pre-filled
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter security key"
                      className="w-full pl-10 pr-10 py-2.5 bg-black/50 border border-white/10 rounded-2xl text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Role Type Permissions Info Box */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
                  <KeyRound className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>Authorized Role: {selectedRole}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#06B6D4]">
                        {employeeId}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-[11px] font-mono mt-0.5 leading-relaxed">
                      {DEFAULT_USERS.find(u => u.role === selectedRole)?.description || 'Verified production terminal user profile.'}
                    </p>
                  </div>
                </div>

                {/* Remember Terminal Checkbox */}
                <div className="flex items-center justify-between pt-1 text-xs font-mono text-neutral-400">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberTerminal}
                      onChange={(e) => setRememberTerminal(e.target.checked)}
                      className="w-4 h-4 rounded bg-black/40 border-white/20 text-[#8B5CF6] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-[11px]">Remember terminal on this workstation</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setActiveMode('signup')}
                    className="text-[11px] text-[#06B6D4] hover:underline font-semibold cursor-pointer"
                  >
                    Need a new account? Create one &rarr;
                  </button>
                </div>

                {/* Shiny Conic Border Submit Action */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full relative group p-[1px] rounded-full overflow-hidden transition-all duration-300 disabled:opacity-60 cursor-pointer shadow-[0_0_25px_rgba(139,92,246,0.35)]"
                  >
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#8B5CF6,#06B6D4,#10B981,#8B5CF6)] animate-spin-conic opacity-90 group-hover:opacity-100" />
                    
                    <div className="relative px-6 py-3 rounded-full bg-[#030303] flex items-center justify-center space-x-3 transition-colors group-hover:bg-[#070707]">
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span className="font-mono text-xs uppercase tracking-wider text-white">
                            Verifying Credentials...
                          </span>
                        </div>
                      ) : (
                        <>
                          <span className="font-inter text-sm font-semibold tracking-wide text-white">
                            Authenticate Terminal as {selectedRole}
                          </span>
                          <ArrowRight className="w-4 h-4 text-[#06B6D4] transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================= MODE 2: CREATE ACCOUNT ======================= */}
          {activeMode === 'signup' && (
            <div>
              {/* Step 1: Select Role Assignment */}
              <div className="mb-6">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5 mb-2.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  Select Role Assignment For New Account
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['Admin', 'Stage Supervisor', 'Operator', 'QC Inspector', 'Viewer'] as UserRole[]).map((r) => {
                    const isSelected = regRole === r;
                    const color = getRoleBadgeColor(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRegRole(r)}
                        className={`p-2.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-white/10 border-white/40 shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-[1.02]'
                            : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />}
                        </div>
                        <div className="text-xs font-bold text-white tracking-tight truncate">
                          {r}
                        </div>
                        <div className="text-[9px] font-mono text-neutral-400 mt-1 truncate">
                          {r === 'Admin' ? 'Director' : r === 'Stage Supervisor' ? 'Shift Lead' : r === 'Operator' ? 'Station Line' : r === 'QC Inspector' ? 'Inspector' : 'Read-Only'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Account Details Form */}
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1.5">
                      Full Operator / Manager Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-2xl text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1.5">
                      Username / Terminal Handle *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                        <Shield className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="e.g. sjenkins"
                        className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-2xl text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Employee ID */}
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1.5">
                      Employee ID / Badge No.
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                        <BadgeCheck className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={regEmployeeId}
                        onChange={(e) => setRegEmployeeId(e.target.value)}
                        placeholder="e.g. OPR-502"
                        className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-2xl text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Department / Station */}
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1.5">
                      Department / Workstation Line
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        placeholder="e.g. Sewing Line 2"
                        className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-2xl text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1.5">
                      Security Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Create password"
                        className="w-full pl-10 pr-10 py-2.5 bg-black/50 border border-white/10 rounded-2xl text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-white transition-colors cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-2xl text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Switch back link */}
                <div className="flex items-center justify-between pt-1 text-xs font-mono text-neutral-400">
                  <span className="text-[11px] text-neutral-500">
                    Account is saved in workstation storage
                  </span>

                  <button
                    type="button"
                    onClick={() => setActiveMode('signin')}
                    className="text-[11px] text-[#8B5CF6] hover:underline font-semibold cursor-pointer"
                  >
                    Already have an account? Sign in &rarr;
                  </button>
                </div>

                {/* Shiny Conic Border Register Action */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full relative group p-[1px] rounded-full overflow-hidden transition-all duration-300 disabled:opacity-60 cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                  >
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#10B981,#06B6D4,#8B5CF6,#10B981)] animate-spin-conic opacity-90 group-hover:opacity-100" />
                    
                    <div className="relative px-6 py-3 rounded-full bg-[#030303] flex items-center justify-center space-x-3 transition-colors group-hover:bg-[#070707]">
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span className="font-mono text-xs uppercase tracking-wider text-white">
                            Registering Account & Node...
                          </span>
                        </div>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 text-[#10B981]" />
                          <span className="font-inter text-sm font-semibold tracking-wide text-white">
                            Create {regRole} Account & Enter Terminal
                          </span>
                          <ArrowRight className="w-4 h-4 text-[#10B981] transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Footer Security Badges */}
          <div className="mt-8 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-neutral-500">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>TLS Encrypted &bull; ISO 9001 Garment Quality Standard</span>
            </div>
            <div>
              &copy; {new Date().getFullYear()} Taskora AI &bull; Garment Neural Systems
            </div>
          </div>
        </div>
      </div>

      {/* Download / Install App Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
      />
    </div>
  );
};
