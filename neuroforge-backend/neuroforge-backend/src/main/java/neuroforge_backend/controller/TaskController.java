package neuroforge_backend.controller;

import neuroforge_backend.entity.Task;
import neuroforge_backend.repository.TaskRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @GetMapping("/sprint/{sprintId}")
    public List<Task> getTasksBySprint(@PathVariable Integer sprintId) {
        return taskRepository.findBySprint_SprintId(sprintId);
    }

    @GetMapping("/project/{projectId}")
    public List<Task> getTasksByProject(@PathVariable Integer projectId) {
        return taskRepository.findBySprint_Project_ProjectId(projectId);
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return taskRepository.save(task);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Integer id, @RequestBody Task details) {
        Task existing = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        existing.setTitle(details.getTitle());
        existing.setDescription(details.getDescription());
        existing.setPriority(details.getPriority());
        existing.setStatus(details.getStatus());
        existing.setStartDate(details.getStartDate());
        existing.setEndDate(details.getEndDate());
        if (details.getSprint() != null) existing.setSprint(details.getSprint());
        if (details.getAssignedTo() != null) existing.setAssignedTo(details.getAssignedTo());
        return taskRepository.save(existing);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Integer id, @RequestBody Map<String, String> payload) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        task.setStatus(payload.get("status"));
        taskRepository.save(task);
        return ResponseEntity.ok(task);
    }

    // --- ONLY DEVOPS CAN DELETE ---
    @PreAuthorize("hasAuthority('DevOps Engineer')")
    @DeleteMapping("/{id}")
    public String deleteTask(@PathVariable Integer id) {
        taskRepository.deleteById(id);
        return "Task with ID " + id + " deleted successfully!";
    }
}