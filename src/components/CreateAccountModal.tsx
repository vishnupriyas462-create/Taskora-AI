import React, { useState, useEffect } from 'react';
import { UserRole, AuthUser } from '../types';
import { saveNewUser, getAllUsers, getRoleBadgeColor, UserPreset } from '../utils/storage';
import { 
  X, 
  UserPlus, 
  Shield, 
  User, 
  BadgeCheck, 
  Building2, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: (user: AuthUser) => void;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onAccountCreated
}) => {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('Operator');
  const [username, setUsername] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setFullName('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      const prefix = role === 'Admin' ? 'ADM' 
        : role === 'Stage Supervisor' ? 'SUP' 
        : role === 'Operator' ? 'OPR' 
        : role === 'QC Inspector' ? 'QC' 
        : 'AUD';
      setEmployeeId(`${prefix}-${Math.floor(100 + Math.random() * 900)}`);
      setDepartment(
        role === 'Admin' ? 'Plant Governance' 
        : role === 'Stage Supervisor' ? 'Production Line Floor' 
        : role === 'Operator' ? 'Sewing & Assembly Station' 
        : role === 'QC Inspector' ? 'Quality Audit Station' 
        : 'Auditor & External Review'
      );
    }
  }, [isOpen, role]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please provide a full name.');
      return;
    }

    if (!username.trim()) {
      setError('Please provide a unique username.');
      return;
    }

    if (!password.trim()) {
      setError('Please set a security password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const newPreset: UserPreset = {
        username: username.trim().toLowerCase(),
        name: fullName.trim(),
        role,
        employeeId: employeeId.trim() || `EMP-${Math.floor(100 + Math.random() * 900)}`,
        department: department.trim() || 'Workstation Line',
        password,
        description: `Custom ${role} account created for ${fullName.trim()}.`,
        badgeColor: getRoleBadgeColor(role)
      };

      saveNewUser(newPreset);

      const authUser: AuthUser = {
        username: newPreset.username,
        name: newPreset.name,
        role: newPreset.role,
        employeeId: newPreset.employeeId,
        department: newPreset.department,
        lastLogin: new Date().toISOString()
      };

      setIsLoading(false);
      onAccountCreated(authUser);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl glass-panel border border-white/10 p-6 sm:p-8 shadow-[0_16px_64px_rgba(0,0,0,0.9)] text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-instrument text-2xl text-white">
                Create New Terminal Account
              </h3>
              <p className="text-xs font-mono text-neutral-400">
                Register a new operator or supervisor workstation profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-[#F43F5E]/15 border border-[#F43F5E]/30 text-[#F43F5E] text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Type Selection */}
        <div className="mb-5">
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2 font-semibold">
            Select Role Assignment *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(['Admin', 'Stage Supervisor', 'Operator', 'QC Inspector', 'Viewer'] as UserRole[]).map((r) => {
              const isSelected = role === r;
              const color = getRoleBadgeColor(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/10 border-white/40 shadow-sm scale-[1.02]'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-[#10B981]" />}
                  </div>
                  <div className="text-[11px] font-bold text-white truncate">{r}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-9 pr-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-[#10B981] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1">Username *</label>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. jdoe"
                  className="w-full pl-9 pr-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-[#10B981] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1">Employee / Badge ID</label>
              <div className="relative">
                <BadgeCheck className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-[#06B6D4] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1">Department / Station</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-[#06B6D4] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-9 pr-9 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-[#10B981] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-neutral-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-9 pr-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-[#10B981] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-black font-mono font-bold text-xs shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center gap-2"
            >
              {isLoading ? (
                <span>Registering...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account & Authenticate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
