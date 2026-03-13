import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authAPI } from '../api/endpoints';
import { User, Lock, Save } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const inputClass = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authAPI.updateMe(profile);
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
    finally { setSavingProfile(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await authAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setSavingPassword(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-6">
      {/* Profile */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Profile Settings</h3>
            <p className="text-xs text-slate-500">Update your account details</p>
          </div>
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
            <input type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              className={inputClass} />
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-sm text-slate-500">Role: <span className="font-semibold text-slate-700 capitalize">{user?.role}</span></p>
          </div>
          <button type="submit" disabled={savingProfile}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
            <Save className="w-4 h-4" />
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <Lock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Change Password</h3>
            <p className="text-xs text-slate-500">Ensure your account is secure</p>
          </div>
        </div>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          {[
            { label: 'Current Password', key: 'currentPassword' },
            { label: 'New Password', key: 'newPassword' },
            { label: 'Confirm New Password', key: 'confirmPassword' }
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
              <input type="password" value={passwords[key]} onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                className={inputClass} placeholder="••••••••" required />
            </div>
          ))}
          <button type="submit" disabled={savingPassword}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
            <Lock className="w-4 h-4" />
            {savingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default Settings;
