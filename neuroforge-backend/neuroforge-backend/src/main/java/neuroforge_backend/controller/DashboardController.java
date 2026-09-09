package neuroforge_backend.controller;

import neuroforge_backend.repository.TaskRepository;
import neuroforge_backend.repository.BugRepository;
import neuroforge_backend.repository.ProjectRepository;
import org.springframework.web.bind.annotation.*;

import java.lang.management.ManagementFactory;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final TaskRepository taskRepository;
    private final BugRepository bugRepository;
    private final ProjectRepository projectRepository;

    // Spring automatically injects all three repositories here
    public DashboardController(TaskRepository taskRepository, BugRepository bugRepository, ProjectRepository projectRepository) {
        this.taskRepository = taskRepository;
        this.bugRepository = bugRepository;
        this.projectRepository = projectRepository;
    }

    @GetMapping("/metrics")
    public Map<String, Object> getDashboardMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // 1. Tasks Completed (Counts tasks where status = 'Done')
        long completedTasks = taskRepository.countByStatus("Done");
        metrics.put("tasksCompleted", completedTasks);

        // 2. Open Defects (Counts bugs where status = 'Open')
        long openBugs = bugRepository.countByStatus("Open");
        metrics.put("openDefects", openBugs);

        // 3. Active Projects (Counts all projects in the database)
        // Note: If you have a status field in your Project entity, you could change this to projectRepository.countByStatus("Active")
        long totalProjects = projectRepository.count();
        metrics.put("activeProjects", totalProjects);

        // 4. System Uptime (Calculates actual JVM uptime)
        long uptimeMillis = ManagementFactory.getRuntimeMXBean().getUptime();
        long uptimeHours = TimeUnit.MILLISECONDS.toHours(uptimeMillis);
        long uptimeMinutes = TimeUnit.MILLISECONDS.toMinutes(uptimeMillis) % 60;
        metrics.put("systemUptime", uptimeHours + "h " + uptimeMinutes + "m");

        return metrics;
    }
}