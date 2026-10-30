import React, { useState } from 'react';
import { UserRole, AuthUser } from '../types';
import { DEFAULT_USERS, UserPreset } from '../utils/storage';
import { TaskoraLogo } from './TaskoraLogo';
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
  AlertCircle
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('Admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [customName, setCustomName] = useState('Elena Rostova');
  const [employeeId, setEmployeeId] = useState('ADM-101');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberTerminal, setRememberTerminal] = useState(true);

  // When clicking a preset role profile card
  const handleSelectPreset = (preset: UserPreset) => {
    setSelectedRole(preset.role);
    setUsername(preset.username);
    setPassword(preset.password || '123456');
    setCustomName(preset.name);
    setEmployeeId(preset.employeeId);
    setErrorMessage('');
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    const matched = DEFAULT_USERS.find(u => u.role === role);
    if (matched) {
      setUsername(matched.username);
      setPassword(matched.password || '123456');
      setCustomName(matched.name);
      setEmployeeId(matched.employeeId);
    }
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Please enter an Employee ID or Username.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter a password.');
      return;
    }

    setIsLoading(true);

    // Smooth futuristic terminal authentication delay
    setTimeout(() => {
      const authUser: AuthUser = {
        username: username.trim(),
        name: customName.trim() || username.trim(),
        role: selectedRole,
        employeeId: employeeId.trim() || `EMP-${Math.floor(100 + Math.random() * 900)}`,
        department: DEFAULT_USERS.find(u => u.role === selectedRole)?.department || 'Manufacturing Floor',
        lastLogin: new Date().toISOString()
      };

      setIsLoading(false);
      onLogin(authUser);
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
        {/* Top Floating Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-300">
              Terminal Node 01 &bull; Zero-Loss Pipeline
            </span>
          </div>
        </div>

        {/* Main Glassmorphic Card */}
        <div className="rounded-3xl glass-panel border border-white/10 p-6 sm:p-8 md:p-10 shadow-[0_16px_64px_rgba(0,0,0,0.85)]">
          {/* Header & Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <TaskoraLogo size={44} textClassName="text-2xl sm:text-3xl" />
            </div>
            <p className="font-mono text-xs text-neutral-400 max-w-md mx-auto mt-1 tracking-tight">
              Authenticate with your assigned operator or manager credentials to enter the production line tracking terminal.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-3 rounded-2xl bg-[#F43F5E]/10 border border-[#F43F5E]/30 text-[#F43F5E] text-xs font-mono flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Role Preset Cards */}
          <div className="mb-7">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
                Select Role Account Type
              </label>
              <span className="text-[10px] font-mono text-neutral-500">
                Quick-switch profiles
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {DEFAULT_USERS.map((preset) => {
                const isSelected = selectedRole === preset.role;
                return (
                  <button
                    key={preset.role}
                    type="button"
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
                          style={{ backgroundColor: preset.badgeColor }} 
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
                    <div className="text-[9px] font-mono text-neutral-500 mt-2">
                      {preset.employeeId}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Employee ID / Username */}
              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1.5">
                  Employee ID / User
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
                    placeholder="e.g. ADM-101 or username"
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
                  Demo key: pre-filled
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
                    {DEFAULT_USERS.find(u => u.role === selectedRole)?.employeeId}
                  </span>
                </div>
                <p className="text-neutral-400 text-[11px] font-mono mt-0.5 leading-relaxed">
                  {DEFAULT_USERS.find(u => u.role === selectedRole)?.description}
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

              <span className="text-[11px] text-neutral-500">
                v2.4 Production OS
              </span>
            </div>

            {/* Shiny Conic Border Submit Action */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group p-[1px] rounded-full overflow-hidden transition-all duration-300 disabled:opacity-60 cursor-pointer shadow-[0_0_25px_rgba(139,92,246,0.35)]"
              >
                {/* Rotating Conic Neon Border */}
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
    </div>
  );
};
