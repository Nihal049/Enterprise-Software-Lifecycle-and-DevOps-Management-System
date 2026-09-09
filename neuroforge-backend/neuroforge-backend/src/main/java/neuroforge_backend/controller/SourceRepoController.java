package neuroforge_backend.controller;

import neuroforge_backend.entity.SourceRepo;
import neuroforge_backend.repository.SourceRepoRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/repos")
@CrossOrigin(origins = "http://localhost:5173")
public class SourceRepoController {

    private final SourceRepoRepository repoRepository;

    public SourceRepoController(SourceRepoRepository repoRepository) {
        this.repoRepository = repoRepository;
    }

    @GetMapping
    public List<SourceRepo> getAllRepos() {
        return repoRepository.findAll();
    }

    @PostMapping
    public SourceRepo addRepo(@RequestBody SourceRepo repo) {
        if (repo.getStatus() == null) repo.setStatus("Synced");
        if (repo.getDefaultBranch() == null) repo.setDefaultBranch("main");
        return repoRepository.save(repo);
    }

    @DeleteMapping("/{id}")
    public String deleteRepo(@PathVariable Integer id) {
        repoRepository.deleteById(id);
        return "Repository disconnected.";
    }
}