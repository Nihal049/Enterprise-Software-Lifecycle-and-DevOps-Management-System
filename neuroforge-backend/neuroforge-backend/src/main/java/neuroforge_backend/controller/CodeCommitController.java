package neuroforge_backend.controller;

import neuroforge_backend.entity.CodeCommit;
import neuroforge_backend.repository.CodeCommitRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/commits")
@CrossOrigin(origins = "http://localhost:5173")
public class CodeCommitController {

    private final CodeCommitRepository commitRepository;

    public CodeCommitController(CodeCommitRepository commitRepository) {
        this.commitRepository = commitRepository;
    }

    @GetMapping
    public List<CodeCommit> getAllCommits() {
        return commitRepository.findAllByOrderByTimestampDesc();
    }

    @PostMapping
    public CodeCommit addCommit(@RequestBody CodeCommit commit) {
        return commitRepository.save(commit);
    }
}