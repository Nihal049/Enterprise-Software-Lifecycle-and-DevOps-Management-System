import { useState, useEffect } from 'react';
import { PlaySquare, Loader2, CheckCircle2, XCircle, CircleDashed, Rocket, GitCommit, Trash2, ShieldAlert, FileCheck2, Clock, Activity, Server } from 'lucide-react';
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

export default function Deployments() {
  const [deployments, setDeployments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = getAuthUser();
  const isDevOps = currentUser?.role?.toLowerCase() === 'devops engineer';

  const [newDeployment, setNewDeployment] = useState({
    releaseVersion: '', environment: 'Staging', notes: '', projectId: ''
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [deployRes, projRes] = await Promise.all([
        api.get('/deployments').catch(() => ({ data: [] })),
        api.get('/projects').catch(() => ({ data: [] }))
      ]);

      setDeployments(Array.isArray(deployRes.data) ? deployRes.data : []);
      setProjects(Array.isArray(projRes.data) ? projRes.data : []);

      if (projRes.data.length > 0) {
        setNewDeployment(prev => ({
          ...prev,
          projectId: projRes.data[0].projectId || projRes.data[0].id
        }));
      }

      setLoading(false);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to fetch pipeline data.");
      setLoading(false);
    }
  };

  const handleTriggerPipeline = async (e) => {
    e.preventDefault();
    if (!newDeployment.releaseVersion.trim() || !newDeployment.projectId) return;

    try {
      const payload = {
        releaseVersion: newDeployment.releaseVersion,
        environment: newDeployment.environment,
        notes: newDeployment.notes,
        status: 'In Progress',
        project: { projectId: parseInt(newDeployment.projectId) }
      };

      const response = await api.post('/deployments', payload);
      // Add to the top of the list
      setDeployments([response.data, ...deployments]);
      setNewDeployment(prev => ({
        ...prev,
        releaseVersion: '',
        notes: ''
      }));
      setError(null);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to trigger pipeline. Ensure the selected project exists.");
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const fullDeploy = deployments.find(
      d => (d.deploymentId || d.id) === id
    );

    if (!fullDeploy) return;

    setDeployments(prev =>
      prev.map(d =>
        (d.deploymentId || d.id) === id
          ? { ...d, status: newStatus }
          : d
      )
    );

    try {
      await api.put(`/deployments/${id}/status`, { status: newStatus });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      try {
        await api.put(`/deployments/${id}`, {
          ...fullDeploy,
          status: newStatus
        });
      // eslint-disable-next-line no-unused-vars
      } catch (fallbackErr) {
        alert("Failed to update pipeline status in database.");
        fetchInitialData();
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this deployment record forever?")) return;

    try {
      await api.delete(`/deployments/${id}`);
      setDeployments(prev =>
        prev.filter(d => (d.deploymentId || d.id) !== id)
      );
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Failed to delete deployment record.");
    }
  };

  const renderPipelineStages = (status, environment) => {
    const stages = [
      { name: 'Build', icon: GitCommit },
      { name: 'Test', icon: FileCheck2 },
      { name: `Deploy ${environment}`, icon: Rocket }
    ];

    let states = [];

    if (status === 'Success' || status === 'Passed') {
      states = ['done', 'done', 'done'];
    } else if (status === 'Failed') {
      states = ['done', 'failed', 'pending'];
    } else {
      states = ['done', 'loading', 'pending'];
    }

    return (
      <div className="flex items-center mt-6 overflow-x-auto pb-1">
        {stages.map((stage, idx) => {
          const state = states[idx];
          const Icon = stage.icon;

          let bgClass = "bg-slate-50 border-slate-200 text-slate-400";
          let iconClass = "text-slate-400";

          if (state === 'done') {
            bgClass = "bg-emerald-50 border-emerald-200 text-emerald-700 font-medium";
            iconClass = "text-emerald-500";
          } else if (state === 'loading') {
            bgClass = "bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-sm ring-2 ring-blue-100";
            iconClass = "text-blue-500 animate-spin";
          } else if (state === 'failed') {
            bgClass = "bg-red-50 border-red-200 text-red-700 font-bold";
            iconClass = "text-red-500";
          }

          return (
            <div key={idx} className="flex items-center shrink-0">
              <div className={`flex items-center gap-2 px-4 py-2 border rounded-full text-xs transition-all ${bgClass}`}>
                {state === 'loading' ? (
                  <Loader2 size={14} className={iconClass} />
                ) : (
                  <Icon size={14} className={iconClass} />
                )}
                {stage.name}
              </div>

              {idx < stages.length - 1 && (
                <div
                  className={`h-[2px] w-8 sm:w-16 mx-1 sm:mx-2 rounded-full transition-colors ${
                    state === 'done' && states[idx + 1] !== 'pending'
                      ? 'bg-emerald-200'
                      : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const totalDeployments = deployments.length;
  const successfulDeployments = deployments.filter(
    d => d.status === 'Success' || d.status === 'Passed'
  ).length;
  const failedDeployments = deployments.filter(
    d => d.status === 'Failed'
  ).length;
  const runningDeployments = deployments.filter(
    d => d.status === 'In Progress'
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
      <header className="mb-8 border-b border-gray-200 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <PlaySquare className="text-blue-600" size={28} />
            CI/CD Pipelines
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Monitor automated builds, tests, and deployments
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
          title="Total Runs"
          value={totalDeployments}
          subtext="Deployment executions"
          icon={PlaySquare}
          gradientFrom="from-blue-400"
          gradientTo="to-blue-500"
          shadowColor="shadow-blue-200"
        />

        <StatCard
          title="Successful"
          value={successfulDeployments}
          subtext="Completed deployments"
          icon={CheckCircle2}
          gradientFrom="from-emerald-400"
          gradientTo="to-emerald-500"
          shadowColor="shadow-emerald-200"
        />

        <StatCard
          title="Failed"
          value={failedDeployments}
          subtext="Require investigation"
          icon={XCircle}
          gradientFrom="from-red-400"
          gradientTo="to-red-500"
          shadowColor="shadow-red-200"
        />

        <StatCard
          title="In Progress"
          value={runningDeployments}
          subtext="Currently executing"
          icon={Activity}
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
                <Rocket size={18} className="text-blue-600" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Trigger Pipeline
                </h2>
                <p className="text-xs text-slate-400">
                  Start a new deployment run
                </p>
              </div>
            </div>

            <form onSubmit={handleTriggerPipeline} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Target Project
                </label>

                <select
                  required
                  value={newDeployment.projectId}
                  onChange={e =>
                    setNewDeployment({
                      ...newDeployment,
                      projectId: e.target.value
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  {projects.length === 0 ? (
                    <option value="">No Projects Found</option>
                  ) : (
                    <option value="">Select Project...</option>
                  )}

                  {projects.map(p => (
                    <option
                      key={p.projectId || p.id}
                      value={p.projectId || p.id}
                    >
                      {p.projectName || p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Release Version
                </label>

                <input
                  type="text"
                  value={newDeployment.releaseVersion}
                  onChange={e =>
                    setNewDeployment({
                      ...newDeployment,
                      releaseVersion: e.target.value
                    })
                  }
                  placeholder="e.g. v2.1.0-beta"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Target Environment</span>

                  {!isDevOps && (
                    <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <ShieldAlert size={10} />
                      DevOps Only
                    </span>
                  )}
                </label>

                <select
                  value={newDeployment.environment}
                  onChange={e =>
                    setNewDeployment({
                      ...newDeployment,
                      environment: e.target.value
                    })
                  }
                  className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm outline-none transition-all ${
                    !isDevOps
                      ? 'opacity-75 cursor-not-allowed bg-slate-50'
                      : 'bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                >
                  <option value="Staging">Staging</option>
                  {isDevOps && <option value="Production">Production</option>}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Deployment Notes
                </label>

                <textarea
                  value={newDeployment.notes}
                  onChange={e =>
                    setNewDeployment({
                      ...newDeployment,
                      notes: e.target.value
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none h-24"
                  placeholder="Release notes..."
                />
              </div>

              <button
                type="submit"
                disabled={projects.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Rocket size={17} />
                Deploy Code
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Pipeline Runs
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {deployments.length} deployment run{deployments.length !== 1 ? 's' : ''} recorded
                </p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Activity size={18} className="text-blue-600" />
              </div>
            </div>

            <div className="p-5 space-y-4">
              {deployments.length === 0 && (
                <div className="p-12 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Rocket size={22} className="text-blue-500" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-700">
                    No Pipelines Run Yet
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    Trigger your first deployment from the form.
                  </p>
                </div>
              )}

              {deployments.map(deploy => {
                const safeId = deploy.deploymentId || deploy.id;
                const projName =
                  deploy.project?.projectName ||
                  deploy.project?.name ||
                  'Unknown Project';

                const isRunning = deploy.status === 'In Progress';

                let StatusIcon = CircleDashed;
                let statusColor = "text-slate-400";

                if (
                  deploy.status === 'Success' ||
                  deploy.status === 'Passed'
                ) {
                  StatusIcon = CheckCircle2;
                  statusColor = "text-emerald-500";
                }

                if (deploy.status === 'Failed') {
                  StatusIcon = XCircle;
                  statusColor = "text-red-500";
                }

                if (isRunning) {
                  StatusIcon = Loader2;
                  statusColor = "text-blue-500 animate-spin";
                }

                return (
                  <div
                    key={safeId}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative group overflow-hidden hover:shadow-md hover:border-blue-100 transition-all"
                  >
                    <div
                      className={`absolute top-0 left-0 w-full h-1 ${
                        deploy.status === 'Success' ||
                        deploy.status === 'Passed'
                          ? 'bg-emerald-400'
                          : deploy.status === 'Failed'
                          ? 'bg-red-400'
                          : 'bg-blue-400'
                      }`}
                    />

                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-4 min-w-0">
                        <div className="mt-1 shrink-0">
                          <StatusIcon
                            size={23}
                            className={statusColor}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-slate-800 leading-none">
                              {projName}
                            </h3>

                            <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider border border-slate-100">
                              RUN-{safeId}
                            </span>
                          </div>

                          <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                            {deploy.notes ||
                              `Deployment to ${deploy.environment}`}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <GitCommit size={13} />
                              {deploy.releaseVersion || 'latest'}
                            </span>

                            <span className="flex items-center gap-1.5">
                              <Server size={13} />
                              {deploy.environment || 'Staging'}
                            </span>

                            <span className="flex items-center gap-1.5">
                              <Clock size={13} />
                              {deploy.deploymentDate ||
                              deploy.startTime
                                ? new Date(
                                    deploy.deploymentDate ||
                                      deploy.startTime
                                  ).toLocaleString()
                                : 'Just now'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {isRunning && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(safeId, 'Success')
                              }
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-2.5 py-1.5 rounded-md text-[10px] font-bold border border-emerald-100 transition-colors"
                            >
                              Pass
                            </button>

                            <button
                              onClick={() =>
                                handleUpdateStatus(safeId, 'Failed')
                              }
                              className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-md text-[10px] font-bold border border-red-100 transition-colors"
                            >
                              Fail
                            </button>
                          </>
                        )}

                        {isDevOps && (
                          <button
                            onClick={() => handleDelete(safeId)}
                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete deployment"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    {renderPipelineStages(
                      deploy.status,
                      deploy.environment || 'Staging'
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}