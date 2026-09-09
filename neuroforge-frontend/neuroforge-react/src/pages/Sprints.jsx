import { useState, useEffect } from 'react';
import { Search, Loader2, Plus, X, Calendar, Timer, Activity, CheckCircle2, Folder } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { getAuthUser } from '../App';

// --- VIBRANT, ANIMATED STAT CARD ---
const StatCard = ({ title, value, subtext, icon: Icon, gradientFrom, gradientTo, shadowColor }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-lg transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 cursor-default">
    <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity text-slate-900 group-hover:scale-110 duration-300`}>
      <Icon size={120} />
    </div>
    <div className={`p-4 rounded-xl shrink-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white shadow-lg ${shadowColor}`}>
      <Icon size={28} strokeWidth={2.5} />
    </div>
    <div className="z-10">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-extrabold text-slate-800 leading-none mb-1">{value}</h3>
      {subtext && <p className="text-[10px] font-semibold text-slate-500">{subtext}</p>}
    </div>
  </div>
);

// --- INTERACTIVE SPRINT DONUT CHART ---
const InteractiveDonut = ({ planning, active, completed, total }) => {
  const [hovered, setHovered] = useState(null);
  if (total === 0) return <div className="text-slate-400 text-sm flex h-40 items-center justify-center">No sprints available</div>;

  const compPct = (completed / total) * 100;
  const actPct = (active / total) * 100;
  const planPct = (planning / total) * 100;

  const r = 15.9155; 
  const compAngle = 0;
  const actAngle = (compPct / 100) * 360;
  const planAngle = ((compPct + actPct) / 100) * 360;

  const getStrokeWidth = (section) => hovered === section ? "7" : "4.5";
  const getOpacity = (section) => hovered && hovered !== section ? "0.3" : "1";

  return (
    <div className="relative w-40 h-40 flex items-center justify-center mx-auto">
      <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90 overflow-visible drop-shadow-sm">
        {completed > 0 && (
          <circle cx="21" cy="21" r={r} fill="transparent" stroke="#22c55e" strokeWidth={getStrokeWidth('Completed')} opacity={getOpacity('Completed')}
            strokeDasharray={`${compPct} ${100 - compPct}`} transform={`rotate(${compAngle} 21 21)`}
            onMouseEnter={() => setHovered('Completed')} onMouseLeave={() => setHovered(null)}
            className="transition-all duration-300 cursor-pointer"
          />
        )}
        {active > 0 && (
          <circle cx="21" cy="21" r={r} fill="transparent" stroke="#3b82f6" strokeWidth={getStrokeWidth('Active')} opacity={getOpacity('Active')}
            strokeDasharray={`${actPct} ${100 - actPct}`} transform={`rotate(${actAngle} 21 21)`}
            onMouseEnter={() => setHovered('Active')} onMouseLeave={() => setHovered(null)}
            className="transition-all duration-300 cursor-pointer"
          />
        )}
        {planning > 0 && (
          <circle cx="21" cy="21" r={r} fill="transparent" stroke="#cbd5e1" strokeWidth={getStrokeWidth('Planning')} opacity={getOpacity('Planning')}
            strokeDasharray={`${planPct} ${100 - planPct}`} transform={`rotate(${planAngle} 21 21)`}
            onMouseEnter={() => setHovered('Planning')} onMouseLeave={() => setHovered(null)}
            className="transition-all duration-300 cursor-pointer"
          />
        )}
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
        {hovered ? (
          <>
            <span className="text-3xl font-black text-slate-800 leading-none transition-all">
              {hovered === 'Completed' ? completed : hovered === 'Active' ? active : planning}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{hovered}</span>
          </>
        ) : (
          <>
            <span className="text-3xl font-black text-slate-800 leading-none transition-all">{total}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Total Sprints</span>
          </>
        )}
      </div>
    </div>
  );
};

export default function Sprints() {
  const currentUser = getAuthUser();
  const isDevOps = currentUser?.role?.toLowerCase() === 'devops engineer';

  const [sprints, setSprints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sprintProgress, setSprintProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [chartData, setChartData] = useState({ planning: 0, active: 0, completed: 0, total: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSprint, setNewSprint] = useState({
    sprintName: '', projectId: '', startDate: '', endDate: '', status: 'Planning'
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sprintsRes, projectsRes, tasksRes] = await Promise.all([
        api.get('/sprints').catch(() => ({ data: [] })),
        api.get('/projects').catch(() => ({ data: [] })),
        api.get('/tasks').catch(() => ({ data: [] }))
      ]);

      const sprintsData = sprintsRes.data;
      setSprints(sprintsData);
      setProjects(projectsRes.data);

      // Calculate Progress for each Sprint
      const progressMap = {};
      sprintsData.forEach(sprint => {
         const sId = sprint.sprintId || sprint.id;
         const sprintTasks = tasksRes.data.filter(t => (t.sprint?.sprintId || t.sprint?.id) === sId);
         const total = sprintTasks.length;
         const done = sprintTasks.filter(t => t.status === 'Done').length;
         progressMap[sId] = { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
      });
      setSprintProgress(progressMap);

      // Calculate Chart Data
      let planning = 0, active = 0, completed = 0;
      sprintsData.forEach(s => {
        if (s.status === 'Completed') completed++;
        else if (s.status === 'Active') active++;
        else planning++;
      });
      setChartData({ planning, active, completed, total: sprintsData.length });

      setLoading(false);
    // eslint-disable-next-line no-unused-vars
    } catch(err) {
      setError("Failed to fetch data.");
      setLoading(false);
    }
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        sprintName: newSprint.sprintName,
        status: newSprint.status,
        startDate: newSprint.startDate,
        endDate: newSprint.endDate,
        project: { projectId: parseInt(newSprint.projectId) }
      };

      const res = await api.post('/sprints', payload);
      setSprints([...sprints, res.data]);
      setIsModalOpen(false);
      setNewSprint({ sprintName: '', projectId: '', startDate: '', endDate: '', status: 'Planning' });
      fetchData(); // Refresh chart & stats
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Failed to create Sprint. Did you select a project?");
    }
  };

  const handleDeleteSprint = async (sprintId) => {
    if (!window.confirm("Are you sure? This may fail if tasks are attached.")) return;
    try {
      await api.delete(`/sprints/${sprintId}`);
      setSprints(sprints.filter(s => (s.sprintId || s.id) !== sprintId));
      fetchData(); 
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Failed to delete. Remove attached tasks first!");
    }
  };

  const filteredSprints = sprints.filter(s => {
    const name = (s.sprintName || '').toLowerCase();
    const projName = (s.project?.projectName || s.project?.name || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || projName.includes(searchTerm.toLowerCase());
  });

  if (loading) return <div className="p-8 flex justify-center mt-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500 bg-slate-50/50 min-h-screen">
      <header className="mb-8 flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Sprint Management</h1>
          <p className="text-slate-500 mt-1 text-sm">Plan and track your agile development cycles</p>
        </div>
        {isDevOps && (
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-colors flex items-center gap-2">
            <Plus size={18} /> New Sprint
          </button>
        )}
      </header>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 mb-6">{error}</div>}

      {/* --- NEW: 4 VIBRANT STAT CARDS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Sprints" value={chartData.total} subtext="Across all projects" 
          icon={Timer} gradientFrom="from-blue-400" gradientTo="to-blue-500" shadowColor="shadow-blue-200" 
        />
        <StatCard 
          title="Active Sprints" value={chartData.active} subtext="Currently in progress" 
          icon={Activity} gradientFrom="from-amber-400" gradientTo="to-amber-500" shadowColor="shadow-amber-200" 
        />
        <StatCard 
          title="Completed Sprints" value={chartData.completed} subtext="Successfully finished" 
          icon={CheckCircle2} gradientFrom="from-emerald-400" gradientTo="to-emerald-500" shadowColor="shadow-emerald-200" 
        />
        <StatCard 
          title="Total Projects" value={projects.length} subtext="Workspace repositories" 
          icon={Folder} gradientFrom="from-purple-400" gradientTo="to-purple-500" shadowColor="shadow-purple-200" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Search Bar mapping directly to the left 2 columns */}
        <div className="lg:col-span-2">
          <div className="relative h-full flex items-end pb-2">
            <Search className="absolute left-4 bottom-5 text-slate-400" size={16} />
            <input 
              type="text" placeholder="Search sprints by name or project..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm shadow-sm"
            />
          </div>
        </div>

        {/* SPRINT OVERVIEW CHART */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Overview</h2>
            <div className="flex flex-col gap-2 text-sm font-medium mt-4">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> <span className="text-slate-600">Planning</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> <span className="text-blue-600">Active</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> <span className="text-green-600">Completed</span></div>
            </div>
          </div>
          <InteractiveDonut 
              planning={chartData.planning} 
              active={chartData.active} 
              completed={chartData.completed} 
              total={chartData.total} 
          />
        </div>
      </div>

      {/* SPRINT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
        {filteredSprints.length === 0 && <p className="text-slate-500 col-span-3 text-center p-8 bg-white rounded-xl border border-slate-200">No sprints found.</p>}
        
        {filteredSprints.map(sprint => {
          const safeId = sprint.sprintId || sprint.id;
          const projName = sprint.project?.projectName || sprint.project?.name || 'Unassigned Project';
          const sDate = sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : 'TBD';
          const eDate = sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'TBD';
          
          const stats = sprintProgress[safeId] || { total: 0, done: 0, pct: 0 };
          
          let statusBadge = 'bg-gray-100 text-gray-700';
          if (sprint.status === 'Active') statusBadge = 'bg-blue-50 text-blue-700';
          if (sprint.status === 'Completed') statusBadge = 'bg-green-50 text-green-700';

          return (
            <div key={safeId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-slate-800 pr-4 leading-tight group-hover:text-blue-600 transition-colors">{sprint.sprintName || 'Unnamed Sprint'}</h2>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`${statusBadge} px-3 py-1 rounded-full text-xs font-semibold tracking-wide`}>
                    {sprint.status || 'Planning'}
                  </span>
                  {isDevOps && (
                    <button onClick={() => handleDeleteSprint(safeId)} className="text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-full w-8 h-8 flex items-center justify-center transition" title="Delete Sprint">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-slate-500 text-sm mb-5 font-medium flex items-center gap-2">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-600 border border-slate-200">Project</span> 
                <span className="truncate">{projName}</span>
              </p>
              
              <div className="mb-6">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-500">{stats.done} / {stats.total} Tasks Done</span>
                  <span className="font-bold text-slate-700">{stats.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full transition-all duration-1000 ${stats.pct === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${stats.pct}%` }}></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-4 mt-auto">
                <div className="text-slate-400 text-xs font-medium flex items-center gap-1">
                  <Calendar size={12}/> {sDate} <span className="mx-1">➔</span> {eDate}
                </div>
                <Link to={`/tasks?sprintId=${safeId}`} className="text-blue-600 hover:text-blue-800 font-semibold transition-colors text-xs flex items-center gap-1 group-hover:translate-x-1 duration-300">
                  View Tasks <span className="text-[10px]">➔</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE SPRINT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Create New Sprint</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSprint} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sprint Name</label>
                  <input 
                    type="text" required placeholder="e.g. Sprint 14 - API Fixes"
                    value={newSprint.sprintName} onChange={e => setNewSprint({...newSprint, sprintName: e.target.value})} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Parent Project</label>
                  <select 
                    required value={newSprint.projectId} onChange={e => setNewSprint({...newSprint, projectId: e.target.value})} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                  >
                    <option value="">Select Project...</option>
                    {projects.map(p => (
                      <option key={p.projectId || p.id} value={p.projectId || p.id}>{p.projectName || p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date</label>
                    <input type="date" required value={newSprint.startDate} onChange={e => setNewSprint({...newSprint, startDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
                    <input type="date" required value={newSprint.endDate} onChange={e => setNewSprint({...newSprint, endDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                  <select value={newSprint.status} onChange={e => setNewSprint({...newSprint, status: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white">
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors">Save Sprint</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}