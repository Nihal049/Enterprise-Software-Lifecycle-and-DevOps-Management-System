import { useState, useEffect } from 'react';
import { GitCommit, GitBranch, Plus, Loader2, User, Clock, Terminal, ExternalLink, History, Database, GitBranch as BranchIcon } from 'lucide-react';
import api from '../api/axios';

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

export default function Commits() {
  const [commits, setCommits] = useState([]);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [message, setMessage] = useState('');
  const [author, setAuthor] = useState('devops_admin');
  const [selectedRepoId, setSelectedRepoId] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [commitsRes, reposRes] = await Promise.all([
        api.get('/commits').catch(() => ({ data: [] })),
        api.get('/repos').catch(() => ({ data: [] }))
      ]);

      // RESTORED: Secure array fallback handling
      const loadedCommits = Array.isArray(commitsRes.data) ? commitsRes.data : [];
      const loadedRepos = Array.isArray(reposRes.data) ? reposRes.data : [];

      setCommits(loadedCommits);
      setRepos(loadedRepos);

      if (loadedRepos.length > 0) {
        setSelectedRepoId(loadedRepos[0].repoId || loadedRepos[0].id);
      }

      setLoading(false);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to fetch data.");
      setLoading(false);
    }
  };

  const handleSimulateCommit = async (e) => {
    e.preventDefault();
    if (!message || !author || !selectedRepoId) return;

    const randomHash = Math.random().toString(16).substring(2, 9) + Math.random().toString(16).substring(2, 9);

    try {
      const response = await api.post('/commits', {
        commitHash: randomHash,
        message,
        author,
        repository: { repoId: parseInt(selectedRepoId) }
      });

      setCommits([response.data, ...commits]);
      setMessage('');
    } catch (err) {
      console.error("Failed to push commit:", err);
      alert("Failed to push commit. Ensure the selected repository exists in the database.");
    }
  };

  const uniqueAuthors = new Set(commits.map(commit => commit.author).filter(Boolean)).size;
  const uniqueRepos = new Set(
    commits.map(commit => commit.repository?.repoId || commit.repository?.name).filter(Boolean)
  ).size;

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
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <GitCommit className="text-slate-700" size={28} />
            Code Commits
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Review source code history across all connected repositories
          </p>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 mb-6 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Commits"
          value={commits.length}
          subtext="Recorded in platform"
          icon={GitCommit}
          gradientFrom="from-blue-400"
          gradientTo="to-blue-500"
          shadowColor="shadow-blue-200"
        />

        <StatCard
          title="Repositories"
          value={uniqueRepos}
          subtext="Sources with commits"
          icon={Database}
          gradientFrom="from-purple-400"
          gradientTo="to-purple-500"
          shadowColor="shadow-purple-200"
        />

        <StatCard
          title="Contributors"
          value={uniqueAuthors}
          subtext="Unique commit authors"
          icon={User}
          gradientFrom="from-amber-400"
          gradientTo="to-amber-500"
          shadowColor="shadow-amber-200"
        />

        <StatCard
          title="Latest Activity"
          value={commits.length > 0 ? 'Active' : 'Idle'}
          subtext={commits.length > 0 ? 'Commit history available' : 'No commits recorded'}
          icon={History}
          gradientFrom="from-emerald-400"
          gradientTo="to-emerald-500"
          shadowColor="shadow-emerald-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Terminal size={18} className="text-slate-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Simulate Webhook
                </h2>
                <p className="text-xs text-slate-400">
                  Add a commit event to the platform
                </p>
              </div>
            </div>

            {repos.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <BranchIcon size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-700">
                      No repositories connected
                    </p>
                    <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                      Connect a repository in the Repositories tab before creating a commit.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSimulateCommit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Target Repository
                  </label>
                  <select
                    value={selectedRepoId}
                    onChange={e => setSelectedRepoId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  >
                    {repos.map(repo => (
                      <option key={repo.repoId || repo.id} value={repo.repoId || repo.id}>
                        {repo.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Commit Message
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="e.g. Fix login API bug"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Author
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex justify-center items-center gap-2"
                >
                  <Plus size={17} />
                  Push Commit
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Commit History
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {commits.length} recorded commit{commits.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <GitCommit size={18} className="text-blue-600" />
              </div>
            </div>

            <div className="p-6">
              {commits.length === 0 ? (
                <div className="p-12 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                    <GitCommit size={22} className="text-blue-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    No commits found
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Push your first commit using the webhook simulator.
                  </p>
                </div>
              ) : (
                <div className="relative ml-3 border-l-2 border-slate-100 space-y-6">
                  {commits.map((commit, index) => (
                    <div
                      key={commit.commitId || commit.id}
                      className="relative pl-7"
                    >
                      <div className="absolute -left-[9px] top-5 w-4 h-4 rounded-full bg-blue-100 border-2 border-white shadow-sm">
                        <div className="w-full h-full rounded-full bg-blue-500 scale-[0.45]"></div>
                      </div>

                      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group">
                        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                                Commit {commits.length - index}
                              </span>
                            </div>

                            <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-blue-600 transition-colors">
                              {commit.message}
                            </h3>
                          </div>

                          <span className="font-mono text-[11px] font-semibold bg-slate-50 border border-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0">
                            {commit.commitHash.substring(0, 7)}
                            <ExternalLink size={11} />
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase">
                              {(commit.author || '?').charAt(0)}
                            </div>
                            <div>
                              <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                                Author
                              </p>
                              <p className="text-xs font-semibold text-slate-600">
                                {commit.author}
                              </p>
                            </div>
                          </div>

                          <div className="h-6 w-px bg-slate-100 hidden sm:block"></div>

                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center">
                              <GitBranch size={13} className="text-purple-600" />
                            </div>
                            <div>
                              <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                                Repository
                              </p>
                              <p className="text-xs font-semibold text-slate-600 max-w-[160px] truncate">
                                {commit.repository ? commit.repository.name : 'Unknown Repo'}
                              </p>
                            </div>
                          </div>

                          <div className="h-6 w-px bg-slate-100 hidden sm:block"></div>

                          <div className="flex items-center gap-2 sm:ml-auto">
                            <Clock size={14} className="text-slate-400" />
                            <span className="text-xs font-medium text-slate-400">
                              {commit.timestamp
                                ? new Date(commit.timestamp).toLocaleString()
                                : 'Just now'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}