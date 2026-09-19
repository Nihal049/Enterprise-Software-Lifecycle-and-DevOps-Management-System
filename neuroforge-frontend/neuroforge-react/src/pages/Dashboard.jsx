import { useState, useEffect } from 'react';
import { Search, Loader2, Bug, GitCommit, Rocket, FileCheck2, Clock, Folder, CheckSquare, AlertCircle, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { getAuthUser } from '../App';
import Swal from 'sweetalert2';

// --- UPGRADED: VIBRANT, ANIMATED STAT CARD ---
const StatCard = ({ title, value, subtext, icon: Icon, gradientFrom, gradientTo, shadowColor }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-lg transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 cursor-default">
    {/* Subtle Background Watermark Icon */}
    <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity text-slate-900 group-hover:scale-110 duration-300`}>
      <Icon size={120} />
    </div>
    
    {/* Vibrant Gradient Icon Box */}
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

// --- INTERACTIVE DONUT CHART COMPONENT ---
const InteractiveDonut = ({ todo, inProgress, done, total }) => {
  const [hovered, setHovered] = useState(null);
  if (total === 0) return <div className="text-slate-400 text-sm flex h-40 items-center justify-center">No tasks available</div>;

  const donePct = (done / total) * 100;
  const progPct = (inProgress / total) * 100;
  const todoPct = (todo / total) * 100;

  const r = 15.9155; 
  const doneAngle = 0;
  const progAngle = (donePct / 100) * 360;
  const todoAngle = ((donePct + progPct) / 100) * 360;

  const getStrokeWidth = (section) => hovered === section ? "7" : "4.5";
  const getOpacity = (section) => hovered && hovered !== section ? "0.3" : "1";

  return (
    <div className="relative w-44 h-44 flex items-center justify-center mx-auto">
      <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90 overflow-visible drop-shadow-sm">
        {done > 0 && (
          <circle cx="21" cy="21" r={r} fill="transparent" stroke="#22c55e" strokeWidth={getStrokeWidth('Done')} opacity={getOpacity('Done')}
            strokeDasharray={`${donePct} ${100 - donePct}`} transform={`rotate(${doneAngle} 21 21)`}
            onMouseEnter={() => setHovered('Done')} onMouseLeave={() => setHovered(null)}
            className="transition-all duration-300 cursor-pointer"
          />
        )}
        {inProgress > 0 && (
          <circle cx="21" cy="21" r={r} fill="transparent" stroke="#3b82f6" strokeWidth={getStrokeWidth('In Progress')} opacity={getOpacity('In Progress')}
            strokeDasharray={`${progPct} ${100 - progPct}`} transform={`rotate(${progAngle} 21 21)`}
            onMouseEnter={() => setHovered('In Progress')} onMouseLeave={() => setHovered(null)}
            className="transition-all duration-300 cursor-pointer"
          />
        )}
        {todo > 0 && (
          <circle cx="21" cy="21" r={r} fill="transparent" stroke="#cbd5e1" strokeWidth={getStrokeWidth('To Do')} opacity={getOpacity('To Do')}
            strokeDasharray={`${todoPct} ${100 - todoPct}`} transform={`rotate(${todoAngle} 21 21)`}
            onMouseEnter={() => setHovered('To Do')} onMouseLeave={() => setHovered(null)}
            className="transition-all duration-300 cursor-pointer"
          />
        )}
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
        {hovered ? (
          <>
            <span className="text-3xl font-black text-slate-800 leading-none transition-all">
              {hovered === 'Done' ? done : hovered === 'In Progress' ? inProgress : todo}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{hovered}</span>
          </>
        ) : (
          <>
            <span className="text-3xl font-black text-slate-800 leading-none transition-all">{total}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Total Tasks</span>
          </>
        )}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const currentUser = getAuthUser();
  const isDevOps = currentUser?.role?.toLowerCase() === 'devops engineer';

  const [projects, setProjects] = useState([]);
  const [projectProgress, setProjectProgress] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectSearch, setProjectSearch] = useState('');

  const [metrics, setMetrics] = useState({ activeProjects: 0, totalTasks: 0, completedTasks: 0, openDefects: 0, totalUsers: 0 });
  const [chartData, setChartData] = useState({ todo: 0, inProgress: 0, done: 0, total: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    projectName: '', description: '', status: 'Planning', endDate: '', managerId: ''
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectsRes, bugsRes, commitsRes, deployRes, testsRes, tasksRes, usersRes] = await Promise.all([
          api.get('/projects').catch(() => ({ data: [] })),
          api.get('/bugs').catch(() => ({ data: [] })),
          api.get('/commits').catch(() => ({ data: [] })),
          api.get('/deployments').catch(() => ({ data: [] })),
          api.get('/test-cases').catch(() => ({ data: [] })),
          api.get('/tasks').catch(() => ({ data: [] })),
          api.get('/users').catch(() => ({ data: [] })) 
        ]);
        
        const projectsData = projectsRes.data;
        setProjects(projectsData);
        setTeamMembers(usersRes.data);

        const progressMap = {};
        await Promise.all(projectsData.map(async (p) => {
          const pId = p.projectId || p.id;
          try {
            const res = await api.get(`/tasks/project/${pId}`);
            const projTasks = res.data;
            const total = projTasks.length;
            const done = projTasks.filter(t => t.status === 'Done').length;
            progressMap[pId] = total === 0 ? 0 : Math.round((done / total) * 100);
          // eslint-disable-next-line no-unused-vars
          } catch(e) {
            progressMap[pId] = 0; 
          }
        }));
        setProjectProgress(progressMap);

        const liveOpenDefects = bugsRes.data.filter(b => b.status === 'Open').length;
        const liveDoneTasks = tasksRes.data.filter(t => t.status === 'Done').length;
        
        setMetrics({
          activeProjects: projectsData.length,
          totalTasks: tasksRes.data.length,
          completedTasks: liveDoneTasks,
          openDefects: liveOpenDefects,
          totalUsers: usersRes.data.length
        });

        let todo = 0, inProg = 0, done = 0;
        tasksRes.data.forEach(task => {
          if (task.status === 'Done') done++;
          else if (task.status === 'In Progress') inProg++;
          else todo++;
        });
        setChartData({ todo, inProgress: inProg, done, total: tasksRes.data.length });

        const activities = [];
        bugsRes.data.forEach(bug => activities.push({
          id: `bug-${bug.bugId || bug.id}`, title: `Defect Logged: ${bug.title}`, 
          date: new Date(bug.createdAt || bug.reportedDate || Date.now()), icon: Bug, color: 'text-red-500', bg: 'bg-red-50'
        }));
        commitsRes.data.forEach(commit => activities.push({
          id: `commit-${commit.commitId || commit.id}`, title: `Code Pushed by ${commit.author}`, 
          date: new Date(commit.timestamp), icon: GitCommit, color: 'text-slate-600', bg: 'bg-slate-100'
        }));
        deployRes.data.forEach(dep => activities.push({
          id: `dep-${dep.deploymentId || dep.id}`, title: `Deployed to ${dep.environment}`, 
          date: new Date(dep.deploymentDate || dep.startTime || Date.now()), icon: Rocket, color: 'text-purple-600', bg: 'bg-purple-50'
        }));
        testsRes.data.forEach(tc => activities.push({
          id: `tc-${tc.testcaseId || tc.id}`, title: `Test Case: ${tc.title}`, 
          date: new Date(tc.createdAt || Date.now()), icon: FileCheck2, color: 'text-emerald-500', bg: 'bg-emerald-50'
        }));

        activities.sort((a, b) => b.date - a.date);
        setRecentActivity(activities.slice(0, 5));
        setLoading(false);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Failed to connect to Spring Boot API.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.projectName.trim()) return;

    try {
      const payload = {
        projectName: newProject.projectName,
        description: newProject.description,
        status: newProject.status,
        endDate: newProject.endDate,
        manager: newProject.managerId ? { userId: parseInt(newProject.managerId) } : null
      };

      const response = await api.post('/projects', payload);
      const createdProject = response.data;
      
      setProjects([...projects, createdProject]);
      setProjectProgress(prev => ({ ...prev, [createdProject.projectId || createdProject.id]: 0 }));
      setMetrics(prev => ({ ...prev, activeProjects: prev.activeProjects + 1 }));
      
      setIsModalOpen(false);
      setNewProject({ projectName: '', description: '', status: 'Planning', endDate: '', managerId: '' });
      setError(null);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to create project in the database.");
      setIsModalOpen(false);
    }
  };

  const handleDeleteProject = (id) => {
    Swal.fire({
      title: 'Delete this project?',
      text: "This cannot be undone and will remove all associated tasks.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', 
      cancelButtonColor: '#94a3b8', 
      confirmButtonText: 'Yes, delete it!',
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
          await api.delete(`/projects/${id}`);
          setProjects(projects.filter(p => (p.projectId || p.id) !== id));
          setMetrics(prev => ({ ...prev, activeProjects: prev.activeProjects - 1 }));
          Swal.fire('Deleted!', 'The project has been removed.', 'success');
        } catch (error) {
          Swal.fire('Error!', 'Could not delete project. It might have active tasks attached.', 'error');
        }
      }
    });
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const filteredProjects = projects.filter(p => {
    const term = projectSearch.toLowerCase();
    const name = (p.name || p.projectName || p.title || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    return name.includes(term) || desc.includes(term);
  });

  if (loading) return <div className="p-8 flex justify-center mt-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500 bg-slate-50/50 min-h-screen">
      <header className="mb-8 flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">Welcome to the Enterprise SDLC Platform</p>
        </div>
        
        {isDevOps && (
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-colors">
            + New Project
          </button>
        )}
      </header>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 mb-6">{error}</div>}

      {/* --- UPGRADED: 4 VIBRANT STAT CARDS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Projects" value={metrics.activeProjects} subtext="Active across workspace" 
          icon={Folder} gradientFrom="from-amber-400" gradientTo="to-amber-500" shadowColor="shadow-amber-200" 
        />
        <StatCard 
          title="Task Progress" value={`${metrics.completedTasks}/${metrics.totalTasks}`} subtext="Tasks completed" 
          icon={CheckSquare} gradientFrom="from-emerald-400" gradientTo="to-emerald-500" shadowColor="shadow-emerald-200" 
        />
        <StatCard 
          title="Open Defects" value={metrics.openDefects} subtext="Requires immediate attention" 
          icon={AlertCircle} gradientFrom="from-red-400" gradientTo="to-red-500" shadowColor="shadow-red-200" 
        />
        <StatCard 
          title="Team Members" value={metrics.totalUsers} subtext="Registered across platform" 
          icon={Users} gradientFrom="from-blue-400" gradientTo="to-blue-500" shadowColor="shadow-blue-200" 
        />
      </div>

      {/* --- MAIN LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Projects */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" placeholder="Search projects by name or description..." value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
            {filteredProjects.length === 0 && <p className="text-slate-500 col-span-2 text-center p-8 bg-white rounded-xl border border-slate-200">No projects found.</p>}
            
            {filteredProjects.map(project => {
              const safeId = project.projectId || project.id;
              const managerName = project.manager?.name || 'Unassigned';
              const realPercent = projectProgress[safeId] || 0; 

              return (
                <div key={safeId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition flex flex-col group">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-slate-800 pr-4 leading-tight group-hover:text-blue-600 transition-colors">{project.projectName || project.name || project.title || 'Unnamed Project'}</h2>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                        {project.status || 'Active'}
                      </span>
                      {isDevOps && (
                        <button onClick={() => handleDeleteProject(safeId)} className="text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-full w-8 h-8 flex items-center justify-center transition" title="Delete Project">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-6 line-clamp-2 h-10">{project.description || 'Enterprise platform development.'}</p>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-500">Project Progress</span>
                      <span className="font-bold text-slate-700">{realPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-2 rounded-full transition-all duration-1000 ${realPercent === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${realPercent}%` }}></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-4 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase border border-blue-100">
                        {managerName.charAt(0)}
                      </div>
                      <span className="text-slate-500 text-xs font-medium">{managerName}</span>
                    </div>
                    <Link to={`/tasks?projectId=${safeId}`} className="text-blue-600 hover:text-blue-800 font-semibold transition-colors text-xs flex items-center gap-1 group-hover:translate-x-1 duration-300">
                      View Tasks <span className="text-[10px]">➔</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chart & Activity */}
        <div className="flex flex-col gap-6">
          
          {/* --- INTERACTIVE SYSTEM OVERVIEW CHART --- */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-slate-800 mb-1">System Overview</h2>
            <p className="text-slate-500 text-xs mb-6 border-b border-slate-100 pb-4">Task distribution across all active sprints</p>
            
            <InteractiveDonut 
              todo={chartData.todo} 
              inProgress={chartData.inProgress} 
              done={chartData.done} 
              total={chartData.total} 
            />

            <div className="flex justify-center gap-4 text-xs font-bold mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span><span className="text-slate-500 uppercase tracking-wider">To Do</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span className="text-blue-600 uppercase tracking-wider">In Progress</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span className="text-emerald-600 uppercase tracking-wider">Done</span></div>
            </div>
          </div>

          {/* --- RECENT ACTIVITY --- */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex-1">
            <h2 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-4">No recent activity found.</div>
            ) : (
              <div className="space-y-5">
                {recentActivity.map((event) => {
                  const Icon = event.icon;
                  return (
                    <div key={event.id} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${event.bg} ${event.color}`}>
                        <Icon size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{event.title}</p>
                        <p className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1">
                          <Clock size={10} /> {formatTimeAgo(event.date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* --- NEW PROJECT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Create New Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Name</label>
                  <input 
                    type="text" required 
                    value={newProject.projectName} 
                    onChange={e => setNewProject({...newProject, projectName: e.target.value})} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                  <textarea 
                    rows="2" required
                    value={newProject.description} 
                    onChange={e => setNewProject({...newProject, description: e.target.value})} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm resize-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                    <select 
                      value={newProject.status} 
                      onChange={e => setNewProject({...newProject, status: e.target.value})} 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                    >
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
                    <input 
                      type="date" required 
                      value={newProject.endDate} 
                      onChange={e => setNewProject({...newProject, endDate: e.target.value})} 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Manager</label>
                  <select 
                    required 
                    value={newProject.managerId} 
                    onChange={e => setNewProject({...newProject, managerId: e.target.value})} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                  >
                    <option value="">Select Manager...</option>
                    {teamMembers.map(user => (
                      <option key={user.userId || user.id} value={user.userId || user.id}>
                        {user.name || user.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}