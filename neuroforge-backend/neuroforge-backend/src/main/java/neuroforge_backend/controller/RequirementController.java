package neuroforge_backend.controller;

import neuroforge_backend.entity.Requirement;
import neuroforge_backend.repository.RequirementRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/requirements")
public class RequirementController {
    private final RequirementRepository requirementRepository;

    public RequirementController(RequirementRepository requirementRepository) {
        this.requirementRepository = requirementRepository;
    }

    @GetMapping
    public List<Requirement> getAllRequirements() { return requirementRepository.findAll(); }

    @PostMapping
    public Requirement createRequirement(@RequestBody Requirement requirement) {
        return requirementRepository.save(requirement);
    }

    @PutMapping("/{id}")
    public Requirement updateRequirement(@PathVariable Integer id, @RequestBody Requirement details) {
        Requirement existing = requirementRepository.findById(id).orElseThrow(() -> new RuntimeException("Requirement not found"));
        existing.setTitle(details.getTitle());
        existing.setDescription(details.getDescription());
        existing.setStatus(details.getStatus());
        if (details.getProject() != null) existing.setProject(details.getProject());
        return requirementRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteRequirement(@PathVariable Integer id) {
        requirementRepository.deleteById(id);
        return "Requirement with ID " + id + " deleted successfully!";
    }
}