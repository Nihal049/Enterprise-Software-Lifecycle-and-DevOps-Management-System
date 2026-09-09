import { useState, useEffect } from 'react';
import { Bug, Search, Filter, Plus, AlertCircle, AlertTriangle, Info, Loader2, CheckCircle2, Clock, ShieldAlert, Trash2 } from 'lucide-react';
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

export default function Bugs() {
  // --- RESTORED: RBAC AUTHENTICATION ---
  const currentUser = getAuthUser();
  const isDevOps = currentUser?.role?.toLowerCase() === 'devops engineer';

  const [bugs, setBugs] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [reporterId, setReporterId] = useState('');
  const [testCaseId, setTestCaseId] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [bugsRes, usersRes, testCasesRes] = await Promise.all([
        api.get('/bugs').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/test-cases').catch(() => ({ data: [] }))
      ]);

      setBugs(Array.isArray(bugsRes.data) ? bugsRes.data : []);
      setTeamMembers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setTestCases(Array.isArray(testCasesRes.data) ? testCasesRes.data : []);

      if (usersRes.data && usersRes.data.length > 0) {
        setReporterId(usersRes.data[0].userId || usersRes.data[0].id);
      }

      if (testCasesRes.data && testCasesRes.data.length > 0) {
        setTestCaseId(testCasesRes.data[0].testcaseId || testCasesRes.data[0].id);
      }

      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch data from the database.");
      setLoading(false);
    }
  };

  const handleReportBug = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const payload = {
        title,
        description,
        severity,
        status: 'Open',
        reportedBy: reporterId ? { userId: parseInt(reporterId) } : null,
        testCase: testCaseId ? { testcaseId: parseInt(testCaseId) } : null
      };

      const response = await api.post('/bugs', payload);

      setBugs([response.data, ...bugs]);
      setTitle('');
      setDescription('');
      setSeverity('Medium');
      setError(null);
    } catch (err) {
      console.error("Failed to report bug:", err);
      setError("Failed to create defect in the database.");
    }
  };

  const handleStatusChange = async (bugId, newStatus) => {
    const fullBug = bugs.find(b => (b.bugId || b.id) === bugId);
    if (!fullBug) return;

    // Optimistic update
    setBugs(bugs.map(b => (b.bugId || b.id) === bugId ? { ...b, status: newStatus } : b));

    try {
      await api.put(`/bugs/${bugId}/status`, { status: newStatus });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      try {
        // Spring Boot Fallback
        await api.put(`/bugs/${bugId}`, { ...fullBug, status: newStatus });
      // eslint-disable-next-line no-unused-vars
      } catch (fallbackErr) {
        alert("Database Error: Failed to update defect status.");
        fetchInitialData();
      }
    }
  };

  const handleDeleteBug = async (bugId) => {
    if (!window.confirm("Are you sure you want to delete this defect permanently?")) return;
    try {
      await api.delete(`/bugs/${bugId}`);
      setBugs(bugs.filter(b => (b.bugId || b.id) !== bugId));
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Failed to delete defect.");
    }
  };

  const filteredBugs = bugs.filter(bug => {
    const matchesSearch =
      (bug.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((bug.description || '').toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || bug.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalBugs = filteredBugs.length;
  const openBugs = filteredBugs.filter(bug => bug.status === 'Open').length;
  const inProgressBugs = filteredBugs.filter(bug => bug.status === 'In Progress').length;
  const resolvedBugs = filteredBugs.filter(bug => bug.status === 'Resolved').length;

  const getSeverityBadge = (level) => {
    switch (level) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-red-100">
            <AlertCircle size={12} /> Critical
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-orange-100">
            <AlertTriangle size={12} /> High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-amber-100">
            <Info size={12} /> Medium
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-500 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-slate-100">
            Low
          </span>
        );
      default:
        return <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-500 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-slate-100">{level}</span>;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Resolved') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (status === 'In Progress') return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  if (loading) return <div className="p-8 flex justify-center mt-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500 bg-slate-50/50 min-h-screen">
      <header className="mb-8 flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Bug className="text-red-500" size={28} />
            Defect Tracking
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Log, track, and resolve application defects</p>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 mb-6 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Defects" value={totalBugs} subtext="Filtered defects"
          icon={Bug} gradientFrom="from-blue-400" gradientTo="to-blue-500" shadowColor="shadow-blue-200"
        />
        <StatCard
          title="Open Defects" value={openBugs} subtext="Requires attention"
          icon={ShieldAlert} gradientFrom="from-red-400" gradientTo="to-red-500" shadowColor="shadow-red-200"
        />
        <StatCard
          title="In Progress" value={inProgressBugs} subtext="Currently being fixed"
          icon={Clock} gradientFrom="from-amber-400" gradientTo="to-amber-500" shadowColor="shadow-amber-200"
        />
        <StatCard
          title="Resolved" value={resolvedBugs} subtext="Successfully closed"
          icon={CheckCircle2} gradientFrom="from-emerald-400" gradientTo="to-emerald-500" shadowColor="shadow-emerald-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:col-span-1 h-fit">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <Plus size={18} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Report Defect</h2>
              <p className="text-xs text-slate-400">Add a new issue to the backlog</p>
            </div>
          </div>

          <form onSubmit={handleReportBug} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Short summary..." className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Severity</label>
              <select value={severity} onChange={e => setSeverity(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all">
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assign To / Reporter</label>
              <select value={reporterId} onChange={e => setReporterId(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all">
                {teamMembers.length === 0 ? <option value="">No Users Found</option> : <option value="">Select User...</option>}
                {teamMembers.map(user => (
                  <option key={user.userId || user.id} value={user.userId || user.id}>{user.name || user.email}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Failed Test Case (Optional)</label>
              <select value={testCaseId} onChange={e => setTestCaseId(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all">
                <option value="">None / Standalone Bug</option>
                {testCases.map(tc => (
                  <option key={tc.testcaseId || tc.id} value={tc.testcaseId || tc.id}>{tc.title || `Test Case ${tc.testcaseId || tc.id}`}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows="5" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none" placeholder="Steps to reproduce..." />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
              <Plus size={17} /> Submit Defect
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col min-w-0 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-3 justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Reported Defects</h2>
              <p className="text-xs text-slate-400 mt-0.5">{filteredBugs.length} defect{filteredBugs.length !== 1 ? 's' : ''} shown</p>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search defects..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
              </div>

              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                <Filter size={14} className="text-slate-400" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-xs font-semibold text-slate-600 border-none bg-transparent focus:ring-0 cursor-pointer outline-none">
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                <tr className="text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="px-5 py-4 font-bold">Issue ID</th>
                  <th className="px-5 py-4 font-bold">Defect</th>
                  <th className="px-5 py-4 font-bold">Severity</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold text-right">Logged</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {filteredBugs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                          <CheckCircle2 size={22} className="text-emerald-500" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">No defects found</p>
                        <p className="text-xs text-slate-400 mt-1">System is stable for the selected filters.</p>
                      </div>
                    </td>
                  </tr>
                )}

                {filteredBugs.map(bug => {
                  const safeId = bug.bugId || bug.id;
                  return (
                    <tr key={safeId} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-5 py-4">
                        <span className="text-xs font-mono font-semibold text-slate-400">DEF-{safeId}</span>
                      </td>

                      <td className="px-5 py-4 min-w-[240px]">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{bug.title}</p>
                        {bug.description && <p className="text-xs text-slate-400 truncate max-w-[280px] mt-1">{bug.description}</p>}
                      </td>

                      <td className="px-5 py-4">{getSeverityBadge(bug.severity)}</td>

                      <td className="px-5 py-4">
                        <select
                          value={bug.status}
                          onChange={e => handleStatusChange(safeId, e.target.value)}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md cursor-pointer border focus:ring-0 outline-none ${getStatusBadge(bug.status)}`}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span>{bug.createdAt || bug.reportedDate ? new Date(bug.createdAt || bug.reportedDate).toLocaleDateString() : 'Just now'}</span>
                          {isDevOps && (
                            <button onClick={() => handleDeleteBug(safeId)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 bg-white hover:bg-red-50 p-1.5 rounded-md transition-all border border-transparent hover:border-red-100" title="Delete Defect">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}