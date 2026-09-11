import { useState, useEffect } from 'react';
import { X, Loader2, Users, UserCheck, Shield, UserPlus, Trash2, Mail, Key, ShieldAlert, Check } from 'lucide-react';
import api from '../api/axios';
import { getAuthUser } from '../App';
import Swal from 'sweetalert2';

const StatCard = ({ title, value, subtext, icon: Icon, gradientFrom, gradientTo, shadowColor }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity text-slate-900 group-hover:scale-110 duration-300">
      <Icon size={100} />
    </div>
    <div className={`p-3 rounded-xl shrink-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white shadow-lg ${shadowColor}`}>
      <Icon size={24} strokeWidth={2.5} />
    </div>
    <div className="z-10">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{title}</p>
      <h3 className="text-2xl font-extrabold text-slate-800 leading-none mb-1">{value}</h3>
      {subtext && <p className="text-[9px] font-semibold text-slate-500">{subtext}</p>}
    </div>
  </div>
);

export default function Team() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = getAuthUser();
  const isDevOps = currentUser?.role?.toLowerCase() === 'devops engineer';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '', email: '', password: '', status: 'Active', roleId: 2
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to fetch team members from database.");
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        status: newUser.status,
        role: { roleId: parseInt(newUser.roleId) }
      });

      // Force a fresh fetch so roleNames are completely loaded, preventing crashes!
      await fetchUsers();
      
      setIsModalOpen(false);
      setNewUser({ name: '', email: '', password: '', status: 'Active', roleId: 2 });
    } catch (err) {
      Swal.fire('Error!', 'Failed to create user. Ensure the selected Role ID exists in your backend database.', 'error');
    }
  };

  const handleDeleteUser = (id) => {
    Swal.fire({
      title: 'Remove this team member?',
      text: "This cannot be undone and may affect assigned tasks.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', 
      cancelButtonColor: '#94a3b8', 
      confirmButtonText: 'Yes, remove them!',
      cancelButtonText: 'Cancel',
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/users/${id}`);
          setUsers(users.filter(u => (u.userId || u.id) !== id));
          Swal.fire('Removed!', 'The team member has been removed.', 'success');
        } catch (error) {
          Swal.fire('Error!', 'Could not remove user. They might have active tasks assigned to them.', 'error');
        }
      }
    });
  };

  const devOpsCount = users.filter(user => {
    const roleName = (user.role && user.role.roleName) ? user.role.roleName : '';
    return roleName.toLowerCase() === 'devops engineer';
  }).length;

  const developerCount = users.filter(user => {
    const roleName = (user.role && user.role.roleName) ? user.role.roleName : '';
    // UPDATED: Now specifically counts Developers instead of just "Not DevOps"
    return roleName.toLowerCase() === 'developer';
  }).length;

  const activeCount = users.filter(user => user.status === 'Active').length;

  if (loading) {
    return (
      <div className="p-8 flex justify-center mt-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500 min-h-screen">
      <header className="mb-8 flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Users className="text-blue-600" size={28} />
            Team Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage system access and role-based permissions.</p>
        </div>
        {isDevOps && (
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all font-semibold flex items-center gap-2">
            <UserPlus size={18} />
            Provision New User
          </button>
        )}
      </header>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 mb-6 text-sm font-medium">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Members" value={users.length} subtext="Registered users" icon={Users} gradientFrom="from-blue-400" gradientTo="to-blue-500" shadowColor="shadow-blue-200" />
        <StatCard title="Active Members" value={activeCount} subtext="Currently active" icon={UserCheck} gradientFrom="from-emerald-400" gradientTo="to-emerald-500" shadowColor="shadow-emerald-200" />
        <StatCard title="Developers" value={developerCount} subtext="Standard Development team" icon={UserPlus} gradientFrom="from-purple-400" gradientTo="to-purple-500" shadowColor="shadow-purple-200" />
        <StatCard title="DevOps Engineers" value={devOpsCount} subtext="Platform administrators" icon={Shield} gradientFrom="from-amber-400" gradientTo="to-amber-500" shadowColor="shadow-amber-200" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Status</th>
                {isDevOps && <th className="p-4 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">No team members found.</td>
                </tr>
              ) : (
                users.map((user) => {
                  const safeId = user.userId || user.id;
                  
                  const roleName = (user.role && user.role.roleName) ? user.role.roleName : 'Developer';
                  const isUserDevOps = roleName.toLowerCase() === 'devops engineer';
                  const initials = (user.name || user.email || '?').charAt(0).toUpperCase();

                  return (
                    <tr key={safeId} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isUserDevOps ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{user.name}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isUserDevOps ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                          {isUserDevOps ? <ShieldAlert size={12} /> : <Shield size={12} />}
                          {roleName}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-sm font-semibold ${user.status === 'Active' ? 'text-emerald-600' : 'text-red-500'}`}>
                          <Check size={16} /> {user.status}
                        </span>
                      </td>
                      {isDevOps && (
                        <td className="p-4 text-right">
                          <button onClick={() => handleDeleteUser(safeId)} className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Delete User">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in zoom-in duration-200 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <UserPlus size={20} className="text-blue-600" />
                Provision New Account
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Users size={18} /></div>
                  <input type="text" required value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Name" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Work Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Mail size={18} /></div>
                  <input type="email" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Email" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Temporary Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Key size={18} /></div>
                  <input type="password" required value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="••••••••" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">System Role</label>
                  
                  <select value={newUser.roleId} onChange={(e) => setNewUser({...newUser, roleId: e.target.value})} className="...">
                      <option value="1">DevOps Engineer</option>
                       <option value="2">Frontend Developer</option>
                       <option value="3">QA Engineer</option>
                       <option value="4">Admin</option>
                       <option value="5">Business Analyst</option>
                       <option value="6">Project Manager</option>
                    </select>

                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                  <select value={newUser.status} onChange={(e) => setNewUser({...newUser, status: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700">
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}