package neuroforge_backend.controller;

import neuroforge_backend.entity.Project;
import neuroforge_backend.repository.ProjectRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectRepository projectRepository;

    public ProjectController(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @PostMapping
    public Project createProject(@RequestBody Project project) {
        return projectRepository.save(project);
    }

    @PutMapping("/{id}")
    public Project updateProject(@PathVariable Integer id, @RequestBody Project projectDetails) {
        Project existingProject = projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
        existingProject.setProjectName(projectDetails.getProjectName());
        existingProject.setDescription(projectDetails.getDescription());
        existingProject.setStartDate(projectDetails.getStartDate());
        existingProject.setEndDate(projectDetails.getEndDate());
        existingProject.setStatus(projectDetails.getStatus());
        if (projectDetails.getManager() != null) {
            existingProject.setManager(projectDetails.getManager());
        }
        return projectRepository.save(existingProject);
    }

    // --- ONLY DEVOPS CAN DELETE ---
    @PreAuthorize("hasAuthority('DevOps Engineer')")
    @DeleteMapping("/{id}")
    public String deleteProject(@PathVariable Integer id) {
        projectRepository.deleteById(id);
        return "Project with ID " + id + " has been deleted successfully!";
    }
}