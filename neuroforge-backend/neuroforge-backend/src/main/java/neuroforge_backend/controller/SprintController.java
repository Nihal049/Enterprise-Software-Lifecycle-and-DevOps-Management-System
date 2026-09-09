package neuroforge_backend.controller;

import neuroforge_backend.entity.Sprint;
import neuroforge_backend.repository.SprintRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sprints")
public class SprintController {

    private final SprintRepository sprintRepository;

    public SprintController(SprintRepository sprintRepository) {
        this.sprintRepository = sprintRepository;
    }

    @GetMapping
    public List<Sprint> getAllSprints() {
        return sprintRepository.findAll();
    }

    @PostMapping
    public Sprint createSprint(@RequestBody Sprint sprint) {
        return sprintRepository.save(sprint);
    }

    @PutMapping("/{id}")
    public Sprint updateSprint(@PathVariable Integer id, @RequestBody Sprint details) {
        Sprint existing = sprintRepository.findById(id).orElseThrow(() -> new RuntimeException("Sprint not found"));
        existing.setSprintName(details.getSprintName());
        existing.setStartDate(details.getStartDate());
        existing.setEndDate(details.getEndDate());
        existing.setStatus(details.getStatus());
        if (details.getProject() != null) existing.setProject(details.getProject());
        return sprintRepository.save(existing);
    }

    // --- ONLY DEVOPS CAN DELETE ---
    @PreAuthorize("hasAuthority('DevOps Engineer')")
    @DeleteMapping("/{id}")
    public String deleteSprint(@PathVariable Integer id) {
        sprintRepository.deleteById(id);
        return "Sprint with ID " + id + " deleted successfully!";
    }
}