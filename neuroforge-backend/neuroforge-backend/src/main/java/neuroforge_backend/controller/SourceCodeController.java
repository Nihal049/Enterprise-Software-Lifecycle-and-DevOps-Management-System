package neuroforge_backend.controller;

import neuroforge_backend.entity.SourceCode;
import neuroforge_backend.repository.SourceCodeRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/source-code")
public class SourceCodeController {
    private final SourceCodeRepository sourceCodeRepository;

    public SourceCodeController(SourceCodeRepository sourceCodeRepository) {
        this.sourceCodeRepository = sourceCodeRepository;
    }

    @GetMapping
    public List<SourceCode> getAllSourceCode() { return sourceCodeRepository.findAll(); }

    @PostMapping
    public SourceCode createSourceCode(@RequestBody SourceCode sourceCode) { return sourceCodeRepository.save(sourceCode); }

    @PutMapping("/{id}")
    public SourceCode updateSourceCode(@PathVariable Integer id, @RequestBody SourceCode details) {
        SourceCode existing = sourceCodeRepository.findById(id).orElseThrow(() -> new RuntimeException("Source Code not found"));
        existing.setFileName(details.getFileName());
        existing.setFilePath(details.getFilePath());
        existing.setLanguage(details.getLanguage());
        existing.setDescription(details.getDescription());
        existing.setCommitId(details.getCommitId());
        if (details.getTask() != null) existing.setTask(details.getTask());
        return sourceCodeRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteSourceCode(@PathVariable Integer id) {
        sourceCodeRepository.deleteById(id);
        return "Source Code with ID " + id + " deleted successfully!";
    }
}