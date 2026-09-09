import { useState, useEffect } from 'react';
import { FileCheck2, Plus, Loader2, CheckCircle2, XCircle, CircleDashed, Play, Trash2, Search, Activity, Target } from 'lucide-react';
import api from '../api/axios';
import { getAuthUser } from '../App'; // RESTORED: Authentication import

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

export default function TestCases() {
  // --- RESTORED: RBAC AUTHENTICATION ---
  const currentUser = getAuthUser();
  const isDevOps = currentUser?.role?.toLowerCase() === 'devops engineer';

  const [testCases, setTestCases] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const [newTest, setNewTest] = useState({
    title: '', testSteps: '', expectedResult: '', taskId: ''
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [testsRes, tasksRes] = await Promise.all([
        api.get('/test-cases').catch(() => ({ data: [] })),
        api.get('/tasks').catch(() => ({ data: [] }))
      ]);

      // RESTORED: Secure array fallback handling to prevent crashes
      const loadedTests = Array.isArray(testsRes.data) ? testsRes.data : [];
      const loadedTasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];

      setTestCases(loadedTests);
      setAvailableTasks(loadedTasks);

      if (loadedTasks.length > 0) {
        setNewTest(prev => ({
          ...prev,
          taskId: loadedTasks[0].taskId || loadedTasks[0].id
        }));
      }

      setLoading(false);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to fetch data from the database.");
      setLoading(false);
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!newTest.title.trim()) return;

    try {
      const payload = {
        title: newTest.title,
        testSteps: newTest.testSteps,
        expectedResult: newTest.expectedResult,
        status: 'Pending',
        task: newTest.taskId ? { taskId: parseInt(newTest.taskId) } : null
      };

      const response = await api.post('/test-cases', payload);

      // RESTORED: Add new tests to the TOP of the list, not the bottom
      setTestCases([response.data, ...testCases]);
      setNewTest(prev => ({
        ...prev,
        title: '',
        testSteps: '',
        expectedResult: ''
      }));
      setError(null);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to create test case. Ensure the selected Task exists.");
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const fullTestCase = testCases.find(
      tc => (tc.testcaseId || tc.id) === id
    );

    if (!fullTestCase) return;

    setTestCases(prev =>
      prev.map(tc =>
        (tc.testcaseId || tc.id) === id
          ? { ...tc, status: newStatus }
          : tc
      )
    );

    try {
      await api.put(`/test-cases/${id}/status`, { status: newStatus });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      console.warn("Custom /status endpoint missing, attempting full entity PUT fallback...");

      try {
        await api.put(`/test-cases/${id}`, {
          ...fullTestCase,
          status: newStatus
        });
      } catch (fallbackErr) {
        console.error("Both update methods failed:", fallbackErr);
        alert("Database Error: Failed to update test case status.");
        fetchInitialData();
      }
    }
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm("Delete this test case forever?")) return;

    try {
      await api.delete(`/test-cases/${id}`);
      setTestCases(prev =>
        prev.filter(tc => (tc.testcaseId || tc.id) !== id)
      );
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Failed to delete test case.");
    }
  };

  const handleRunAllTests = async () => {
    const pendingTests = testCases.filter(tc => tc.status === 'Pending');

    if (pendingTests.length === 0) {
      alert("No pending tests available to run in the suite.");
      return;
    }

    setIsExecuting(true);

    for (let i = 0; i < pendingTests.length; i++) {
      const test = pendingTests[i];
      const safeId = test.testcaseId || test.id;

      await new Promise(resolve => setTimeout(resolve, 600));

      const simulatedResult = Math.random() > 0.15 ? 'Passed' : 'Failed';

      await handleUpdateStatus(safeId, simulatedResult);
    }

    setIsExecuting(false);
  };

  const getStatusUI = (status) => {
    if (status === 'Passed') {
      return (
        <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-emerald-100">
          <CheckCircle2 size={13} />
          Passed
        </span>
      );
    }

    if (status === 'Failed') {
      return (
        <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-red-100">
          <XCircle size={13} />
          Failed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-slate-100">
        <CircleDashed
          size={13}
          className={isExecuting ? "animate-spin text-blue-500" : ""}
        />
        Pending
      </span>
    );
  };

  const filteredTestCases = testCases.filter(tc => {
    const searchStr = searchTerm.toLowerCase();

    return (
      (tc.title || '').toLowerCase().includes(searchStr) ||
      (tc.testSteps || '').toLowerCase().includes(searchStr)
    );
  });

  const totalTests = testCases.length;
  const passedCount = testCases.filter(t => t.status === 'Passed').length;
  const failedCount = testCases.filter(t => t.status === 'Failed').length;
  const pendingCount = testCases.filter(t => t.status === 'Pending').length;

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
            <FileCheck2 className="text-emerald-500" size={28} />
            Test Cases
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Design, execute, and track quality assurance tests
          </p>
        </div>

        <button
          onClick={handleRunAllTests}
          disabled={isExecuting || pendingCount === 0}
          className={`px-5 py-2.5 rounded-lg shadow-sm font-semibold transition-all flex items-center gap-2 text-sm ${
            isExecuting || pendingCount === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
          }`}
        >
          {isExecuting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Play size={16} />
          )}
          {isExecuting ? 'Executing Suite...' : 'Run All Pending'}
        </button>
      </header>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 mb-6 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Suite"
          value={totalTests}
          subtext="Test cases registered"
          icon={Target}
          gradientFrom="from-blue-400"
          gradientTo="to-blue-500"
          shadowColor="shadow-blue-200"
        />

        <StatCard
          title="Passed Tests"
          value={passedCount}
          subtext="Successfully completed"
          icon={CheckCircle2}
          gradientFrom="from-emerald-400"
          gradientTo="to-emerald-500"
          shadowColor="shadow-emerald-200"
        />

        <StatCard
          title="Failed Tests"
          value={failedCount}
          subtext="Require investigation"
          icon={XCircle}
          gradientFrom="from-red-400"
          gradientTo="to-red-500"
          shadowColor="shadow-red-200"
        />

        <StatCard
          title="Pending Run"
          value={pendingCount}
          subtext="Waiting for execution"
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
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Plus size={18} className="text-emerald-600" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  New Test Case
                </h2>
                <p className="text-xs text-slate-400">
                  Add a quality assurance test
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateTest} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Test Title
                </label>

                <input
                  type="text"
                  value={newTest.title}
                  onChange={e =>
                    setNewTest({
                      ...newTest,
                      title: e.target.value
                    })
                  }
                  placeholder="e.g. JWT expiration limits"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Linked Task
                </label>

                <select
                  value={newTest.taskId}
                  onChange={e =>
                    setNewTest({
                      ...newTest,
                      taskId: e.target.value
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  {availableTasks.length === 0 ? (
                    <option value="">No Tasks Found</option>
                  ) : (
                    <option value="">Select Task...</option>
                  )}

                  {availableTasks.map(task => (
                    <option
                      key={task.taskId || task.id}
                      value={task.taskId || task.id}
                    >
                      T-{task.taskId || task.id}: {task.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Test Steps
                </label>

                <textarea
                  value={newTest.testSteps}
                  onChange={e =>
                    setNewTest({
                      ...newTest,
                      testSteps: e.target.value
                    })
                  }
                  rows="5"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                  placeholder="1. Login...&#10;2. Wait 10h..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Expected Result
                </label>

                <input
                  type="text"
                  value={newTest.expectedResult}
                  onChange={e =>
                    setNewTest({
                      ...newTest,
                      expectedResult: e.target.value
                    })
                  }
                  placeholder="User is logged out"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex justify-center items-center gap-2"
              >
                <Plus size={17} />
                Save Test Case
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Test Suite
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {filteredTestCases.length} test case{filteredTestCases.length !== 1 ? 's' : ''} shown
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />

                <input
                  type="text"
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-slate-400 text-[10px] uppercase tracking-wider">
                    <th className="px-5 py-4 font-bold">Status</th>
                    <th className="px-5 py-4 font-bold">Test Case</th>
                    <th className="px-5 py-4 font-bold">Steps & Expected Result</th>
                    <th className="px-5 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {filteredTestCases.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-5 py-14 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                            <FileCheck2 size={22} className="text-slate-400" />
                          </div>
                          <p className="text-sm font-semibold text-slate-700">
                            No test cases found
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Try changing your search or create a new test case.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}

                  {filteredTestCases.map(tc => {
                    const safeId = tc.testcaseId || tc.id;
                    const taskId = tc.task?.taskId || tc.task?.id || '?';

                    return (
                      <tr
                        key={safeId}
                        className={`hover:bg-slate-50/70 transition-colors group ${
                          tc.status === 'Failed' ? 'bg-red-50/20' : ''
                        }`}
                      >
                        <td className="px-5 py-4 align-top">
                          {getStatusUI(tc.status)}
                        </td>

                        <td className="px-5 py-4 align-top min-w-[190px]">
                          <p
                            className={`text-sm font-bold leading-snug ${
                              tc.status === 'Passed'
                                ? 'text-slate-500'
                                : 'text-slate-800'
                            }`}
                          >
                            TC-{safeId}: {tc.title}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                              Linked Task
                            </span>

                            <span className="font-mono bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-500">
                              T-{taskId}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 align-top min-w-[240px]">
                          <p className="text-xs text-slate-600 leading-relaxed max-w-md">
                            {tc.testSteps || 'No test steps provided.'}
                          </p>

                          {tc.expectedResult && (
                            <div className="mt-2 flex items-start gap-1.5">
                              <span
                                className={`text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                                  tc.status === 'Failed'
                                    ? 'text-red-500'
                                    : 'text-emerald-600'
                                }`}
                              >
                                Expect:
                              </span>

                              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                                {tc.expectedResult}
                              </p>
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 align-top">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                handleUpdateStatus(safeId, 'Passed')
                              }
                              disabled={isExecuting}
                              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all disabled:opacity-50"
                            >
                              Pass
                            </button>

                            <button
                              onClick={() =>
                                handleUpdateStatus(safeId, 'Failed')
                              }
                              disabled={isExecuting}
                              className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all disabled:opacity-50"
                            >
                              Fail
                            </button>

                            {/* RESTORED: Delete button protected by DevOps role */}
                            {isDevOps && (
                              <button
                                onClick={() => handleDeleteTest(safeId)}
                                disabled={isExecuting}
                                className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all disabled:opacity-50"
                                title="Delete test case"
                              >
                                <Trash2 size={15} />
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
    </div>
  );
}