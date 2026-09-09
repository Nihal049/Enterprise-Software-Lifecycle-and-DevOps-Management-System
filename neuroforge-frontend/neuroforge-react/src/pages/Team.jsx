import { useState, useEffect } from 'react';
import { Plus, X, Loader2, Users, UserCheck, Shield, UserPlus, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { getAuthUser } from '../App';

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
      // RESTORED: Safe array fallback to prevent map/filter crashes
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
      const response = await api.post('/users', {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        status: newUser.status,
        role: { roleId: parseInt(newUser.roleId) }
      });

      // RESTORED: Add new user to the TOP of the array
      setUsers([response.data, ...users]);
      setIsModalOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        status: 'Active',
        roleId: 2
      });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Failed to create user. Ensure Role ID exists in your database.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to remove this team member?")) return;

    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => (u.userId || u.id) !== id));
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Failed to delete. They might have tasks assigned to them.");
    }
  };

  const devOpsCount = users.filter(user =>
    (user.role?.roleName || '').toLowerCase() === 'devops engineer'
  ).length;

  const developerCount = users.filter(user =>
    (user.role?.roleName || '').toLowerCase() !== 'devops engineer'
  ).length;

  const activeCount = users.filter(user =>
    user.status === 'Active'
  ).length;

  if (loading) {
    return (
      <div className="p-8 flex justify-center mt-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500 bg-slate-50/50 min-h-screen">
      <header className="mb-8 flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Users className="text-blue-600" size={28} />
            Team Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage developers, DevOps engineers, and system access
          </p>
        </div>

        {isDevOps && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all font-semibold flex items-center gap-2"
          >
            <Plus size={18} />
            Add User
          </button>
        )}
      </header>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 mb-6 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Members"
          value={users.length}
          subtext="Registered users"
          icon={Users}
          gradientFrom="from-blue-400"
          gradientTo="to-blue-500"
          shadowColor="shadow-blue-200"
        />

        <StatCard
          title="Active Members"
          value={activeCount}
          subtext="Currently active"
          icon={UserCheck}
          gradientFrom="from-emerald-400"
          gradientTo="to-emerald-500"
          shadowColor="shadow-emerald-200"
        />

        <StatCard
          title="Developers"
          value={developerCount}
          subtext="Development team"
          icon={UserPlus}
          gradientFrom="from-purple-400"
          gradientTo="to-purple-500"
          shadowColor="shadow-purple-200"
        />

        <StatCard
          title="DevOps Engineers"
          value={devOpsCount}
          subtext="Platform administrators"
          icon={Shield}
          gradientFrom="from-amber-400"
          gradientTo="to-amber-500"
          shadowColor="shadow-amber-200"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Team Members
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {users.length} member{users.length !== 1 ? 's' : ''} registered
            </p>
          </div>

          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Users size={18} className="text-blue-600" />
          </div>
        </div>

        <div className="p-5">
          {users.length === 0 ? (
            <div className="p-12 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Users size={22} className="text-blue-500" />
              </div>

              <p className="text-sm font-semibold text-slate-700">
                No team members found
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Add your first team member to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {users.map(user => {
                const safeId = user.userId || user.id;
                const roleName = user.role
                  ? user.role.roleName
                  : 'No Role';

                const isUserDevOps =
                  roleName.toLowerCase() === 'devops engineer';

                const initials = (user.name || user.email || '?')
                  .charAt(0)
                  .toUpperCase();

                return (
                  <div
                    key={safeId}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md hover:border-blue-100 transition-all group"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold uppercase border shrink-0 ${
                            isUserDevOps
                              ? 'bg-purple-50 text-purple-600 border-purple-100'
                              : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}
                        >
                          {initials}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-800 truncate">
                            {user.name || 'Unnamed User'}
                          </h3>

                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {isDevOps && (
                        <button
                          onClick={() => handleDeleteUser(safeId)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                          title="Remove user"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                          isUserDevOps
                            ? 'bg-purple-50 text-purple-600 border-purple-100'
                            : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}
                      >
                        {roleName}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            user.status === 'Active'
                              ? 'bg-emerald-500'
                              : 'bg-red-500'
                          }`}
                        />

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide ${
                            user.status === 'Active'
                              ? 'text-emerald-600'
                              : 'text-red-500'
                          }`}
                        >
                          {user.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Add Team Member
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Create a new platform user
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>

                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={e =>
                      setNewUser({
                        ...newUser,
                        name: e.target.value
                      })
                    }
                    placeholder="Enter full name"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>

                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={e =>
                      setNewUser({
                        ...newUser,
                        email: e.target.value
                      })
                    }
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Temporary Password
                  </label>

                  <input
                    type="text"
                    required
                    value={newUser.password}
                    onChange={e =>
                      setNewUser({
                        ...newUser,
                        password: e.target.value
                      })
                    }
                    placeholder="Enter temporary password"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Role
                    </label>

                    <select
                      value={newUser.roleId}
                      onChange={e =>
                        setNewUser({
                          ...newUser,
                          roleId: e.target.value
                        })
                      }
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    >
                      <option value="2">Developer</option>
                      <option value="1">DevOps Engineer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Status
                    </label>

                    <select
                      value={newUser.status}
                      onChange={e =>
                        setNewUser({
                          ...newUser,
                          status: e.target.value
                        })
                      }
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                  <Plus size={16} />
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}