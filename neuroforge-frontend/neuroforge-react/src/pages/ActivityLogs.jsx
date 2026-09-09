import { useState, useEffect } from 'react';
import { Activity, Bug, GitCommit, Rocket, FileCheck2, Loader2, Clock, Filter, Layers } from 'lucide-react';
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

export default function ActivityLogs() {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); 

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    try {
      const [bugsRes, commitsRes, deployRes, testsRes] = await Promise.all([
        api.get('/bugs').catch(() => ({ data: [] })),
        api.get('/commits').catch(() => ({ data: [] })),
        api.get('/deployments').catch(() => ({ data: [] })),
        api.get('/test-cases').catch(() => ({ data: [] }))
      ]);

      const activities = [];

      // --- SECURED: Safe Array Parsing ---
      const bugs = Array.isArray(bugsRes.data) ? bugsRes.data : [];
      const commits = Array.isArray(commitsRes.data) ? commitsRes.data : [];
      const deploys = Array.isArray(deployRes.data) ? deployRes.data : [];
      const tests = Array.isArray(testsRes.data) ? testsRes.data : [];

      bugs.forEach(bug => {
        activities.push({
          id: `bug-${bug.bugId || bug.id}`,
          type: 'Defect',
          title: `Defect Logged: ${bug.title}`,
          subtitle: `Severity: ${bug.severity} | Status: ${bug.status}`,
          date: new Date(bug.createdAt || bug.reportedDate || Date.now()),
          icon: Bug,
          gradientFrom: 'from-red-400',
          gradientTo: 'to-red-500',
          shadowColor: 'shadow-red-200'
        });
      });

      commits.forEach(commit => {
        activities.push({
          id: `commit-${commit.commitId || commit.id}`,
          type: 'Commit',
          title: `Code Pushed by ${commit.author}`,
          subtitle: `${commit.commitHash?.substring(0,7) || 'sys'}: ${commit.message}`,
          date: new Date(commit.timestamp),
          icon: GitCommit,
          gradientFrom: 'from-blue-400',
          gradientTo: 'to-blue-500',
          shadowColor: 'shadow-blue-200'
        });
      });

      deploys.forEach(dep => {
        activities.push({
          id: `dep-${dep.deploymentId || dep.id}`,
          type: 'Deployment',
          title: `Deployment to ${dep.environment || 'Staging'}`,
          subtitle: `Release ${dep.releaseVersion || dep.name || 'v1.0'} - Status: ${dep.status}`,
          date: new Date(dep.deploymentDate || dep.startTime || Date.now()),
          icon: Rocket,
          gradientFrom: 'from-purple-400',
          gradientTo: 'to-purple-500',
          shadowColor: 'shadow-purple-200'
        });
      });

      tests.forEach(tc => {
        activities.push({
          id: `tc-${tc.testcaseId || tc.id}`,
          type: 'TestCase',
          title: `Test Case Authored`,
          subtitle: `TC-${tc.testcaseId || tc.id}: ${tc.title}`,
          date: new Date(tc.createdAt || Date.now()),
          icon: FileCheck2,
          gradientFrom: 'from-emerald-400',
          gradientTo: 'to-emerald-500',
          shadowColor: 'shadow-emerald-200'
        });
      });

      activities.sort((a, b) => b.date - a.date);
      setTimeline(activities);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch timeline:", err);
      setLoading(false);
    }
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

  const filteredTimeline = timeline.filter(event => filter === 'All' || event.type === filter);

  // Metrics
  const totalEvents = timeline.length;
  const totalCommits = timeline.filter(e => e.type === 'Commit').length;
  const totalDeploys = timeline.filter(e => e.type === 'Deployment').length;
  const totalDefects = timeline.filter(e => e.type === 'Defect').length;

  if (loading) return <div className="p-8 flex justify-center mt-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500 bg-slate-50/50 min-h-screen">
      
      <header className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <Layers className="text-blue-600" size={28} />
          Master Activity Log
        </h1>
        <p className="text-slate-500 mt-1 text-sm">A unified audit trail of all system events, commits, and defect changes.</p>
      </header>

      {/* VIBRANT STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Events" value={totalEvents} subtext="Across platform" 
          icon={Activity} gradientFrom="from-slate-600" gradientTo="to-slate-700" shadowColor="shadow-slate-200" 
        />
        <StatCard 
          title="Code Commits" value={totalCommits} subtext="Pushed to repositories" 
          icon={GitCommit} gradientFrom="from-blue-400" gradientTo="to-blue-500" shadowColor="shadow-blue-200" 
        />
        <StatCard 
          title="Deployments" value={totalDeploys} subtext="Pipeline executions" 
          icon={Rocket} gradientFrom="from-purple-400" gradientTo="to-purple-500" shadowColor="shadow-purple-200" 
        />
        <StatCard 
          title="Defects Logged" value={totalDefects} subtext="Reported bugs" 
          icon={Bug} gradientFrom="from-red-400" gradientTo="to-red-500" shadowColor="shadow-red-200" 
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
        
        {/* FILTER ROW */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 pb-4 border-b border-slate-100 gap-4">
          <h2 className="text-lg font-bold text-slate-800">Timeline</h2>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <Filter size={14} className="text-slate-400" />
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value)} 
              className="text-xs font-bold text-slate-600 border-none bg-transparent focus:ring-0 cursor-pointer outline-none uppercase tracking-wider"
            >
              <option value="All">All Activities</option>
              <option value="Commit">Commits</option>
              <option value="Deployment">Deployments</option>
              <option value="Defect">Defects</option>
              <option value="TestCase">Test Cases</option>
            </select>
          </div>
        </div>

        {filteredTimeline.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Activity size={24} className="text-slate-300" />
            </div>
            <h3 className="text-slate-700 font-bold text-lg">No Activity Found</h3>
            <p className="text-slate-400 text-sm mt-1">There are no events matching your current filter.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 ml-4 lg:ml-8 space-y-8 pb-4">
            {filteredTimeline.map((event) => {
              const Icon = event.icon;
              return (
                <div key={event.id} className="relative pl-8 lg:pl-10 group">
                  
                  {/* Glowing Timeline Node */}
                  <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center bg-gradient-to-br ${event.gradientFrom} ${event.gradientTo} text-white shadow-md ${event.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={12} strokeWidth={3} />
                  </div>
                  
                  {/* Interactive Event Card */}
                  <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group-hover:-translate-y-0.5">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                      <h3 className="font-bold text-slate-800 text-base">{event.title}</h3>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 shrink-0 w-fit">
                        <Clock size={12} /> {formatTimeAgo(event.date)}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{event.subtitle}</p>
                    
                    <div className="mt-4 pt-3 border-t border-slate-50">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                        event.type === 'Commit' ? 'bg-blue-50 text-blue-600' :
                        event.type === 'Defect' ? 'bg-red-50 text-red-600' :
                        event.type === 'Deployment' ? 'bg-purple-50 text-purple-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {event.type}
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
  );
}