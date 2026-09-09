package neuroforge_backend.controller;

import neuroforge_backend.entity.Bug;
import neuroforge_backend.repository.BugRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bugs")
@CrossOrigin(origins = "http://localhost:5173") // <-- ALLOWS REACT TO CONNECT
public class BugController {
    private final BugRepository bugRepository;

    public BugController(BugRepository bugRepository) {
        this.bugRepository = bugRepository;
    }

    @GetMapping
    public List<Bug> getAllBugs() { return bugRepository.findAll(); }

    @PostMapping
    public Bug createBug(@RequestBody Bug bug) {
        if (bug.getStatus() == null) bug.setStatus("Open");
        return bugRepository.save(bug);
    }

    @PutMapping("/{id}")
    public Bug updateBug(@PathVariable Integer id, @RequestBody Bug details) {
        Bug existing = bugRepository.findById(id).orElseThrow(() -> new RuntimeException("Bug not found"));
        existing.setTitle(details.getTitle());
        existing.setDescription(details.getDescription());
        existing.setSeverity(details.getSeverity());
        existing.setStatus(details.getStatus());
        if (details.getTestCase() != null) existing.setTestCase(details.getTestCase());
        if (details.getReportedBy() != null) existing.setReportedBy(details.getReportedBy());
        return bugRepository.save(existing);
    }

    // <-- NEW ENDPOINT: specifically for our React dropdown -->
    @PutMapping("/{id}/status")
    public Bug updateBugStatus(@PathVariable Integer id, @RequestBody Map<String, String> payload) {
        Bug bug = bugRepository.findById(id).orElseThrow(() -> new RuntimeException("Bug not found"));
        bug.setStatus(payload.get("status"));
        return bugRepository.save(bug);
    }

    @DeleteMapping("/{id}")
    public String deleteBug(@PathVariable Integer id) {
        bugRepository.deleteById(id);
        return "Bug with ID " + id + " deleted successfully!";
    }
}