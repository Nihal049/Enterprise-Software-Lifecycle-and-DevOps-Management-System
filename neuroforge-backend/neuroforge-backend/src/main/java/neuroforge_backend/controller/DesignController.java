package neuroforge_backend.controller;

import neuroforge_backend.entity.Design;
import neuroforge_backend.repository.DesignRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/designs")
public class DesignController {
    private final DesignRepository designRepository;

    public DesignController(DesignRepository designRepository) {
        this.designRepository = designRepository;
    }

    @GetMapping
    public List<Design> getAllDesigns() { return designRepository.findAll(); }

    @PostMapping
    public Design createDesign(@RequestBody Design design) { return designRepository.save(design); }

    @PutMapping("/{id}")
    public Design updateDesign(@PathVariable Integer id, @RequestBody Design details) {
        Design existing = designRepository.findById(id).orElseThrow(() -> new RuntimeException("Design not found"));
        existing.setArchitecture(details.getArchitecture());
        if (details.getProject() != null) existing.setProject(details.getProject());
        return designRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteDesign(@PathVariable Integer id) {
        designRepository.deleteById(id);
        return "Design with ID " + id + " deleted successfully!";
    }
}