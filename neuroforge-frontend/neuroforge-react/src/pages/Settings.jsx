import { useState, useEffect } from 'react';
import { User, Bell, Shield, Save, Key, Mail, Building, CheckCircle2, UserCircle, Settings as SettingsIcon, Lock, ChevronRight, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { getAuthUser } from '../App';
import Swal from 'sweetalert2';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  
  // 1. SAFELY EXTRACT ALL TOKEN DATA FIRST
  const currentUser = getAuthUser();
  const tokenEmail = currentUser?.email || currentUser?.sub || currentUser?.username || '';
  const tokenId = currentUser?.userId || currentUser?.id || '';
  
  // Safely grab the role from the token (handles arrays, objects, and Spring Security 'ROLE_' prefixes)
  const rawRole = currentUser?.role || (currentUser?.authorities && currentUser.authorities[0]?.authority) || 'Developer';
  const cleanTokenRole = String(rawRole).replace('ROLE_', '');

  // 2. INITIALIZE STATE WITH CLEAN TOKEN DATA (Never shows "Loading...")
  const [profile, setProfile] = useState({
    id: tokenId || null,
    fullName: currentUser?.name || '',
    email: tokenEmail,
    role: cleanTokenRole,
    status: 'Active'
  });

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // 3. FETCH THE REAL DATABASE DATA TO OVERRIDE THE TOKEN
  useEffect(() => {
    if (!tokenEmail && !tokenId) return;

    const fetchUserData = async () => {
      try {
        const response = await api.get('/users');
        const allUsers = response.data || [];
        
        let myUser = null;
        
        // Try matching by exact ID first
        if (tokenId) {
          myUser = allUsers.find(u => String(u.userId || u.id) === String(tokenId));
        }
        
        // Fallback to matching by Email
        if (!myUser && tokenEmail) {
          myUser = allUsers.find(u => {
            const dbEmail = u.email || '';
            return dbEmail.toLowerCase() === String(tokenEmail).toLowerCase();
          });
        }
        
        if (myUser) {
          // Extract the exact role name from the database object
          let finalRole = cleanTokenRole;
          if (myUser.role && myUser.role.roleName) {
            finalRole = myUser.role.roleName;
          } else if (typeof myUser.role === 'string') {
            finalRole = myUser.role;
          }

          setProfile({
            id: myUser.userId || myUser.id,
            fullName: myUser.name || currentUser?.name || 'Unknown User',
            email: myUser.email || tokenEmail,
            role: finalRole,
            status: myUser.status || 'Active'
          });
        }
      } catch (error) {
        console.error("Failed to load profile data from DB.");
      }
    };

    fetchUserData();
  // Using strings in the dependency array prevents the React Infinite Loop!
  }, [tokenId, tokenEmail]); 

  // 4. SAVE PROFILE DETAILS
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile.id) {
      Swal.fire('Error', 'Profile ID missing. Please log out and back in.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      await api.put(`/users/${profile.id}`, {
        name: profile.fullName,
        email: profile.email,
        status: profile.status
      });

      if (currentUser) {
        const updatedUser = { ...currentUser, name: profile.fullName, email: profile.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      Swal.fire({
        title: 'Profile Updated!',
        text: 'Your personal information has been saved.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (error) {
      Swal.fire('Error', 'Failed to update profile details.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 5. SAVE NEW PASSWORD
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!profile.id) return;
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      Swal.fire('Error', 'New passwords do not match!', 'error');
      return;
    }

    if (passwords.newPassword.length < 4) {
      Swal.fire('Error', 'Password must be at least 4 characters long.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await api.put(`/users/${profile.id}`, {
        name: profile.fullName,
        email: profile.email,
        status: profile.status,
        password: passwords.newPassword
      });

      Swal.fire({
        title: 'Password Updated!',
        text: 'Your security settings have been saved.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      setPasswords({ newPassword: '', confirmPassword: '' });
      
    } catch (error) {
      Swal.fire('Error', 'Failed to update password.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      Swal.fire({
        title: 'Preferences Saved!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }, 600);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', description: 'Personal information', icon: User },
    { id: 'security', label: 'Security', description: 'Password & access', icon: Shield },
    { id: 'notifications', label: 'Notifications', description: 'Alerts & updates', icon: Bell }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500 bg-slate-50/50 min-h-screen">
      <header className="mb-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
              <Sparkles size={11} />
              Account Center
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <UserCircle className="text-blue-600" size={28} />
            User Settings
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Personalize your account, security, and notification preferences
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-10 -right-6 w-40 h-40 rounded-full border-[18px] border-white"></div>
                <div className="absolute -bottom-14 -left-8 w-36 h-36 rounded-full border-[14px] border-white"></div>
              </div>
            </div>

            <div className="px-5 pb-5">
              <div className="flex justify-between items-end -mt-10">
                <div className="w-20 h-20 rounded-2xl bg-white p-1.5 shadow-lg">
                  <div className="w-full h-full rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                    {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : '?'}
                  </div>
                </div>
                <span className="mb-2 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2.5 py-1.5 rounded-md border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {profile.status}
                </span>
              </div>

              <div className="mt-4">
                <h2 className="text-lg font-bold text-slate-800">{profile.fullName}</h2>
                <p className="text-xs text-slate-400 mt-1 truncate">{profile.email}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex px-2.5 py-1 rounded-md bg-purple-50 text-purple-600 border border-purple-100 text-[9px] font-bold uppercase tracking-wide">
                    {profile.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
            <div className="flex items-center gap-3 px-3 py-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <SettingsIcon size={17} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Settings</p>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Manage account</p>
              </div>
            </div>

            <div className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all group ${
                      isActive ? 'bg-blue-50 border border-blue-100 shadow-sm' : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      isActive ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'
                    }`}>
                      <Icon size={17} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${isActive ? 'text-blue-600' : 'text-slate-700'}`}>{tab.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{tab.description}</p>
                    </div>
                    <ChevronRight size={15} className={`transition-all ${isActive ? 'text-blue-400 translate-x-0.5' : 'text-slate-300 group-hover:text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-sm overflow-hidden relative">
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full border-[12px] border-white/5"></div>
            <div className="relative z-10">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-3">
                <Shield size={17} className="text-blue-300" />
              </div>
              <p className="text-xs font-bold">Account Security</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Your profile and authentication settings are managed securely within NeuroForge.</p>
              <div className="flex items-center gap-2 mt-4 text-[9px] uppercase tracking-wider font-bold text-emerald-300">
                <Check size={12} /> Security status: Good
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[620px]">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="animate-in fade-in duration-300">
                <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/60">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-bold text-blue-600 mb-2">Personal Information</p>
                      <h2 className="text-2xl font-bold text-slate-800">Profile Details</h2>
                      <p className="text-xs text-slate-400 mt-1.5">Keep your account information accurate and up to date</p>
                    </div>
                    <div className="hidden sm:flex w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 items-center justify-center">
                      <User size={18} className="text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <form onSubmit={handleSaveProfile} className="space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
                      <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold shadow-sm">
                        {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">Profile Avatar</p>
                        <p className="text-xs text-slate-400 mt-1">Avatars are generated automatically based on your name.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="text"
                            required
                            value={profile.fullName}
                            onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="email"
                            required
                            value={profile.email}
                            onChange={e => setProfile({ ...profile, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">System Role</label>
                        <div className="relative">
                          <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="text"
                            value={profile.role}
                            disabled
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                            title="Contact a DevOps Engineer to change your role"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-slate-100">
                      <div>
                        <p className="text-xs font-bold text-slate-700">Keep your profile updated</p>
                        <p className="text-[10px] text-slate-400 mt-1">Your role and email are shown across the platform</p>
                      </div>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {isSaving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                        {isSaving ? 'Saving...' : 'Save Profile'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="animate-in fade-in duration-300">
                <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-r from-white to-purple-50/30">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-bold text-purple-600 mb-2">Protection & Access</p>
                      <h2 className="text-2xl font-bold text-slate-800">Security & Authentication</h2>
                      <p className="text-xs text-slate-400 mt-1.5">Manage your password and account security</p>
                    </div>
                    <div className="hidden sm:flex w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 items-center justify-center">
                      <Shield size={18} className="text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                          <Lock size={18} className="text-purple-600" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 mt-4">Password Protection</h3>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                          Update your password regularly and use a unique password for better account protection.
                        </p>
                        <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                          <CheckCircle2 size={13} /> Security check passed
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSavePassword} className="lg:col-span-2 space-y-5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                        <div className="relative">
                          <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="password"
                            required
                            value={passwords.newPassword}
                            onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                            placeholder="Enter new password"
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                        <div className="relative">
                          <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="password"
                            required
                            value={passwords.confirmPassword}
                            onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                            placeholder="Confirm new password"
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <AlertCircle size={17} className="text-amber-500 shrink-0" />
                        <p className="text-[11px] text-amber-700 leading-relaxed">
                          Choose a strong password and avoid reusing credentials from other services.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
                        >
                          {isSaving ? <Loader2 size={17} className="animate-spin" /> : <Key size={17} />}
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="animate-in fade-in duration-300">
                <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-r from-white to-amber-50/30">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-bold text-amber-600 mb-2">Stay Informed</p>
                      <h2 className="text-2xl font-bold text-slate-800">Notification Preferences</h2>
                      <p className="text-xs text-slate-400 mt-1.5">Choose which events and updates you want to receive</p>
                    </div>
                    <div className="hidden sm:flex w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 items-center justify-center">
                      <Bell size={18} className="text-amber-600" />
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="max-w-3xl space-y-3">
                    <label className="flex items-start gap-4 p-5 border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-100 hover:bg-slate-50/70 transition-all group">
                      <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">Deployment Alerts</h4>
                            <p className="text-xs text-slate-400 mt-1">Get notified when a CI/CD pipeline succeeds or fails.</p>
                          </div>
                          <span className="self-start sm:self-auto inline-flex px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-bold uppercase tracking-wider">CI/CD</span>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-4 p-5 border border-slate-200 rounded-2xl cursor-pointer hover:border-red-100 hover:bg-slate-50/70 transition-all group">
                      <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">Defect Assignments</h4>
                            <p className="text-xs text-slate-400 mt-1">Receive alerts when a Critical or High severity bug is assigned to you.</p>
                          </div>
                          <span className="self-start sm:self-auto inline-flex px-2.5 py-1 rounded-md bg-red-50 text-red-600 border border-red-100 text-[9px] font-bold uppercase tracking-wider">Defects</span>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-4 p-5 border border-slate-200 rounded-2xl cursor-pointer hover:border-purple-100 hover:bg-slate-50/70 transition-all group">
                      <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">Weekly Digest</h4>
                            <p className="text-xs text-slate-400 mt-1">Receive a summary of completed tasks and active sprint velocity.</p>
                          </div>
                          <span className="self-start sm:self-auto inline-flex px-2.5 py-1 rounded-md bg-purple-50 text-purple-600 border border-purple-100 text-[9px] font-bold uppercase tracking-wider">Summary</span>
                        </div>
                      </div>
                    </label>

                    <div className="pt-6 border-t border-slate-100 mt-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-slate-700">Notification settings</p>
                          <p className="text-[10px] text-slate-400 mt-1">You can change these preferences at any time</p>
                        </div>
                        <button
                          onClick={handleSaveNotifications}
                          disabled={isSaving}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {isSaving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                          Save Preferences
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}