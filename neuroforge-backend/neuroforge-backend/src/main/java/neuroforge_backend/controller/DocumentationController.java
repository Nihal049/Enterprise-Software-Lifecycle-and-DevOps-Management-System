package neuroforge_backend.controller;

import neuroforge_backend.entity.Documentation;
import neuroforge_backend.repository.DocumentationRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/documentation")
public class DocumentationController {
    private final DocumentationRepository documentationRepository;

    public DocumentationController(DocumentationRepository documentationRepository) {
        this.documentationRepository = documentationRepository;
    }

    @GetMapping
    public List<Documentation> getAllDocumentation() { return documentationRepository.findAll(); }

    @PostMapping
    public Documentation createDocumentation(@RequestBody Documentation documentation) { return documentationRepository.save(documentation); }

    @PutMapping("/{id}")
    public Documentation updateDocumentation(@PathVariable Integer id, @RequestBody Documentation details) {
        Documentation existing = documentationRepository.findById(id).orElseThrow(() -> new RuntimeException("Documentation not found"));
        existing.setDocumentType(details.getDocumentType());
        existing.setVersion(details.getVersion());
        if (details.getProject() != null) existing.setProject(details.getProject());
        return documentationRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteDocumentation(@PathVariable Integer id) {
        documentationRepository.deleteById(id);
        return "Documentation with ID " + id + " deleted successfully!";
    }
}