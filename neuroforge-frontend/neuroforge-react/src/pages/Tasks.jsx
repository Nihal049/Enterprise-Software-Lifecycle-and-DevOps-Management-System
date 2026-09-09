import { useState, useEffect } from 'react';
import { Plus, Search, X, Edit2, GripVertical, User, Loader2, Trash2, ClipboardList, ListTodo, Activity, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { getAuthUser } from '../App'; 
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

// --- VIBRANT, ANIMATED STAT CARD ---
const StatCard = ({ title, value, subtext, icon: Icon, gradientFrom, gradientTo, shadowColor }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-lg transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 cursor-default">
    <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity text-slate-900 group-hover:scale-110 duration-300`}>
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

export default function Tasks() {
  // --- CORE STATE ---
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [allSprints, setAllSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- ROUTING & RBAC ---
  const [searchParams] = useSearchParams();
  const projectFilterId = searchParams.get('projectId');
  const sprintFilterId = searchParams.get('sprintId');
  
  const currentUser = getAuthUser();
  const isDevOps = currentUser?.role?.toLowerCase() === 'devops engineer';
  const userEmail = currentUser?.email || '';

  // --- FILTERS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [justMyTasks, setJustMyTasks] = useState(false);

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'Low', status: 'To Do', sprintId: '', assigneeId: '' 
  });

  const columns = [
    { title: "To Do", status: "To Do", dotColor: "bg-slate-300", headerColor: "text-slate-800" },
    { title: "In Progress", status: "In Progress", dotColor: "bg-blue-500", headerColor: "text-blue-600" },
    { title: "Done", status: "Done", dotColor: "bg-green-500", headerColor: "text-emerald-600" }
  ];

  const availableSprints = projectFilterId 
    ? allSprints.filter(s => {
        const pId = s.project?.projectId || s.project?.id;
        return pId && pId.toString() === projectFilterId.toString();
      })
    : allSprints;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      let endpoint = '/tasks';
      if (sprintFilterId) endpoint = `/tasks/sprint/${sprintFilterId}`;
      else if (projectFilterId) endpoint = `/tasks/project/${projectFilterId}`;

      const [tasksRes, usersRes, sprintsRes] = await Promise.all([
        api.get(endpoint).catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/sprints').catch(() => ({ data: [] }))
      ]);
      
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      setTeamMembers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setAllSprints(Array.isArray(sprintsRes.data) ? sprintsRes.data : []);
      
      setLoading(false);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to connect to the database.");
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTaskForm({ 
      title: '', description: '', priority: 'Low', status: 'To Do', 
      sprintId: availableSprints.length > 0 ? (availableSprints[0].sprintId || availableSprints[0].id) : '', 
      assigneeId: '' 
    });
    setEditingTaskId(null);
    setIsModalOpen(false);
  };

  const openEditTask = (task) => {
    setEditingTaskId(task.taskId || task.id);
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'Low',
      status: task.status || 'To Do',
      sprintId: task.sprint ? (task.sprint.sprintId || task.sprint.id) : '',
      assigneeId: task.assignedTo ? (task.assignedTo.userId || task.assignedTo.id) : ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    const payload = {
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      status: taskForm.status,
      sprint: taskForm.sprintId ? { sprintId: parseInt(taskForm.sprintId) } : null,
      assignedTo: taskForm.assigneeId ? { userId: parseInt(taskForm.assigneeId) } : null
    };

    try {
      if (editingTaskId) {
        const response = await api.put(`/tasks/${editingTaskId}`, payload);
        setTasks(tasks.map(t => (t.taskId || t.id) === editingTaskId ? response.data : t));
      } else {
        const response = await api.post('/tasks', payload);
        setTasks([...tasks, response.data]);
      }
      resetForm();
      setError(null);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError(`Database Error: Failed to ${editingTaskId ? 'update' : 'create'} task. Ensure you selected a valid Sprint.`);
      setIsModalOpen(false);
    }
  };

  const handleDeleteTask = (id) => {
    Swal.fire({
      title: 'Delete this task?',
      text: "This cannot be undone and will remove it from the sprint.",
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
          await api.delete(`/tasks/${id}`);
          setTasks(tasks.filter(t => (t.taskId || t.id) !== id));
          Swal.fire('Deleted!', 'The task has been removed.', 'success');
        } catch (error) {
          Swal.fire('Error!', 'Something went wrong.', 'error');
        }
      }
    });
  };

  const handleDragStart = (e, taskId) => e.dataTransfer.setData('taskId', taskId);
  const handleDragOver = (e) => e.preventDefault(); 
  const handleDrop = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    setTasks(prevTasks => prevTasks.map(task => (task.taskId || task.id).toString() === taskId ? { ...task, status: newStatus } : task));
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
    // eslint-disable-next-line no-unused-vars
    } catch (err) { fetchInitialData(); } 
  };

  const filteredTasks = tasks.filter(task => {
    const safeTitle = (task.title || '').toLowerCase();
    const safeDesc = (task.description || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = safeTitle.includes(searchLower) || safeDesc.includes(searchLower);
    const taskAssigneeEmail = task.assignedTo?.email || '';
    const matchesUser = justMyTasks ? taskAssigneeEmail === userEmail : true;
    
    return matchesSearch && matchesUser;
  });

  // --- CALCULATE DYNAMIC METRICS FOR CARDS ---
  const totalCount = filteredTasks.length;
  const todoCount = filteredTasks.filter(t => t.status === 'To Do').length;
  const inProgCount = filteredTasks.filter(t => t.status === 'In Progress').length;
  const doneCount = filteredTasks.filter(t => t.status === 'Done').length;

  const TaskCard = ({ task }) => {
    const safeId = task.taskId || task.id;
    const assigneeName = task.assignedTo?.name || '?';

    return (
      <div 
        draggable
        onDragStart={(e) => handleDragStart(e, safeId)}
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all mb-3 group relative pointer-events-auto"
      >
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-10 transition-opacity">
          <GripVertical className="text-slate-300" size={16} />
        </div>

        <div className="flex justify-between items-start mb-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
            task.priority === 'High' || task.priority === 'Critical' ? 'bg-red-50 text-red-500' : 
            task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-500'
          }`}>
            {task.priority || 'Low'}
          </span>
          
          <div className="flex gap-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); openEditTask(task); }} className="hover:text-blue-500 transition-colors">
              <Edit2 size={14} />
            </button>
            {isDevOps && (
              <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(safeId); }} className="hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
        
        <h4 className={`text-sm font-bold leading-snug mb-1 ${task.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {task.title}
        </h4>
        {task.description && <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>}
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50 border-dashed">
          <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase" title={assigneeName}>
            {assigneeName.charAt(0)}
          </div>
          <span className="text-[10px] font-mono font-medium text-slate-400">T-{safeId}</span>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-8 flex justify-center mt-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col animate-in fade-in duration-500 relative bg-slate-50/50">
      
      <header className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {projectFilterId ? `Project #${projectFilterId} Board` : sprintFilterId ? `Sprint #${sprintFilterId} Board` : 'Task Board'}
          </h1>
          <p className="text-slate-500 mt-1">Drag and drop tasks to update their status</p>
        </div>
        {isDevOps && (
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-colors flex items-center gap-2">
            <Plus size={18} /> New Task
          </button>
        )}
      </header>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 mb-6 shrink-0">{error}</div>}

      {/* --- NEW: 4 VIBRANT STAT CARDS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 shrink-0">
        <StatCard 
          title="Total Tasks" value={totalCount} subtext="In current view" 
          icon={ClipboardList} gradientFrom="from-blue-400" gradientTo="to-blue-500" shadowColor="shadow-blue-200" 
        />
        <StatCard 
          title="To Do" value={todoCount} subtext="Pending pickup" 
          icon={ListTodo} gradientFrom="from-slate-400" gradientTo="to-slate-500" shadowColor="shadow-slate-200" 
        />
        <StatCard 
          title="In Progress" value={inProgCount} subtext="Actively worked on" 
          icon={Activity} gradientFrom="from-amber-400" gradientTo="to-amber-500" shadowColor="shadow-amber-200" 
        />
        <StatCard 
          title="Done" value={doneCount} subtext="Completed tasks" 
          icon={CheckCircle2} gradientFrom="from-emerald-400" gradientTo="to-emerald-500" shadowColor="shadow-emerald-200" 
        />
      </div>

      <div className="flex gap-4 mb-6 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" placeholder="Search tasks by title or description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm shadow-sm"
          />
        </div>
        <button 
          onClick={() => setJustMyTasks(!justMyTasks)}
          className={`px-5 py-3 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
            justMyTasks ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <User size={16} /> Just My Tasks
        </button>
      </div>

      <div className="flex gap-6 flex-1 overflow-x-auto custom-scrollbar pb-4 min-h-[400px]">
        {columns.map(col => (
          <div key={col.status} className="bg-transparent flex flex-col min-w-[320px] w-[320px] flex-shrink-0" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.status)}>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className={`font-bold text-lg ${col.headerColor}`}>{col.title}</h3>
              <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">
                {filteredTasks.filter(t => t.status === col.status).length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
              {filteredTasks.filter(t => t.status === col.status).map(task => (
                <TaskCard key={task.taskId || task.id} task={task} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* DYNAMIC MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingTaskId ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmitTask} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Task Title</label>
                  <input type="text" required value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                  <textarea rows="3" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Priority</label>
                    <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white">
                      <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                    <select value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white">
                      <option value="To Do">To Do</option><option value="In Progress">In Progress</option><option value="Done">Done</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sprint</label>
                    <select 
                      required 
                      value={taskForm.sprintId} 
                      onChange={e => setTaskForm({ ...taskForm, sprintId: e.target.value })} 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                    >
                      {availableSprints.length === 0 ? (
                        <option value="">No Sprints Available</option>
                      ) : (
                        <>
                          <option value="">Select Sprint...</option>
                          {availableSprints.map(sprint => (
                            <option key={sprint.sprintId || sprint.id} value={sprint.sprintId || sprint.id}>
                              {sprint.sprintName || `Sprint ${sprint.sprintId || sprint.id}`}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    {availableSprints.length === 0 && projectFilterId && (
                      <p className="text-[10px] text-red-500 mt-1.5 leading-tight">
                        You must create a Sprint for this project before adding tasks!
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assignee</label>
                    <select value={taskForm.assigneeId} onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white">
                      <option value="">Unassigned</option>
                      {teamMembers.map(member => (
                        <option key={member.userId || member.id} value={member.userId || member.id}>
                          {member.name || member.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={resetForm} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button 
                  type="submit" 
                  disabled={availableSprints.length === 0 && !editingTaskId}
                  className="px-5 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingTaskId ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}