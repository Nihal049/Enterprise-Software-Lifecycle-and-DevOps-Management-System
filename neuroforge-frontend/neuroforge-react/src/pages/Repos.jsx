import { useState, useEffect } from 'react';
import { FolderGit2, Plus, Loader2, GitBranch, Link as LinkIcon, Trash2, CheckCircle2, Server } from 'lucide-react';
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

export default function Repos() {
  // --- RESTORED: RBAC AUTHENTICATION ---
  const currentUser = getAuthUser();
  const isDevOps = currentUser?.role?.toLowerCase() === 'devops engineer';

  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('main');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      const response = await api.get('/repos');
      // RESTORED: Safe Array handling
      setRepos(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to fetch repositories.");
      setLoading(false);
    }
  };

  const handleConnectRepo = async (e) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    try {
      // RESTORED: Appended default status to satisfy backend constraints
      const payload = { 
        name, 
        url, 
        defaultBranch,
        status: 'Connected' 
      };
      
      const response = await api.post('/repos', payload);
      setRepos([...repos, response.data]);
      setName('');
      setUrl('');
      setDefaultBranch('main');
    } catch (err) {
      console.error("Error connecting repo:", err);
      alert("Failed to connect repository.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Disconnect this repository?")) return;

    try {
      await api.delete(`/repos/${id}`);
      // RESTORED: Safe ID mapping
      setRepos(repos.filter(r => (r.repoId || r.id) !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete repository.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center mt-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500 bg-slate-50/50 min-h-screen">
      <header className="mb-8 border-b border-gray-200 pb-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
              <FolderGit2 className="text-blue-600" size={28} />
              Connected Repositories
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Manage source code repositories and CI/CD triggers
            </p>
          </div>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 mb-6 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Repositories"
          value={repos.length}
          subtext="Connected to workspace"
          icon={FolderGit2}
          gradientFrom="from-blue-400"
          gradientTo="to-blue-500"
          shadowColor="shadow-blue-200"
        />

        <StatCard
          title="Active Sources"
          value={repos.filter(r => r.status && r.status.toLowerCase() === 'connected').length || repos.length}
          subtext="Available repositories"
          icon={CheckCircle2}
          gradientFrom="from-emerald-400"
          gradientTo="to-emerald-500"
          shadowColor="shadow-emerald-200"
        />

        <StatCard
          title="Branches"
          value={new Set(repos.map(r => r.defaultBranch).filter(Boolean)).size}
          subtext="Default branches"
          icon={GitBranch}
          gradientFrom="from-purple-400"
          gradientTo="to-purple-500"
          shadowColor="shadow-purple-200"
        />

        <StatCard
          title="Source Control"
          value={repos.length > 0 ? 'Ready' : 'Idle'}
          subtext={repos.length > 0 ? 'Repositories connected' : 'No sources connected'}
          icon={Server}
          gradientFrom="from-amber-400"
          gradientTo="to-amber-500"
          shadowColor="shadow-amber-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <LinkIcon size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Connect Repository
                </h2>
                <p className="text-xs text-slate-400">
                  Add a source code repository
                </p>
              </div>
            </div>

            <form onSubmit={handleConnectRepo} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Repository Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. neuroforge-frontend"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Git URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://github.com/org/repo.git"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Default Branch
                </label>
                <input
                  type="text"
                  value={defaultBranch}
                  onChange={e => setDefaultBranch(e.target.value)}
                  placeholder="main"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex justify-center items-center gap-2"
              >
                <Plus size={17} />
                Connect Source
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Repository Sources
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {repos.length} connected source{repos.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <FolderGit2 size={18} className="text-blue-600" />
              </div>
            </div>

            <div className="p-5">
              {repos.length === 0 && (
                <div className="p-10 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                    <FolderGit2 size={22} className="text-blue-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    No repositories connected
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Connect your first source repository using the form.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repos.map(repo => {
                  const safeId = repo.repoId || repo.id;
                  
                  return (
                    <div
                      key={safeId}
                      className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <FolderGit2 className="text-blue-600" size={20} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-800 truncate">
                              {repo.name}
                            </h3>
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mt-0.5">
                              Repository
                            </p>
                          </div>
                        </div>

                        {/* RESTORED: DevOps protection for deletion */}
                        {isDevOps && (
                          <button
                            onClick={() => handleDelete(safeId)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                            title="Disconnect repository"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 mb-4">
                        <p className="text-[11px] text-slate-500 font-mono truncate">
                          {repo.url}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                            <GitBranch size={13} className="text-slate-500" />
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                              Branch
                            </p>
                            <p className="text-xs font-semibold text-slate-600">
                              {repo.defaultBranch}
                            </p>
                          </div>
                        </div>

                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2.5 py-1.5 rounded-md border border-emerald-100">
                          <CheckCircle2 size={12} />
                          {repo.status || 'Connected'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}