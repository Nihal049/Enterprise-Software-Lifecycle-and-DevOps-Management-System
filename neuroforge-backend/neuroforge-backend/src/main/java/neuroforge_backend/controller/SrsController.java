package neuroforge_backend.controller;

import neuroforge_backend.entity.Srs;
import neuroforge_backend.repository.SrsRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/srs")
public class SrsController {
    private final SrsRepository srsRepository;

    public SrsController(SrsRepository srsRepository) {
        this.srsRepository = srsRepository;
    }

    @GetMapping
    public List<Srs> getAllSrs() { return srsRepository.findAll(); }

    @PostMapping
    public Srs createSrs(@RequestBody Srs srs) { return srsRepository.save(srs); }

    @PutMapping("/{id}")
    public Srs updateSrs(@PathVariable Integer id, @RequestBody Srs details) {
        Srs existing = srsRepository.findById(id).orElseThrow(() -> new RuntimeException("SRS not found"));
        existing.setVersion(details.getVersion());
        if (details.getRequirement() != null) existing.setRequirement(details.getRequirement());
        return srsRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteSrs(@PathVariable Integer id) {
        srsRepository.deleteById(id);
        return "SRS with ID " + id + " deleted successfully!";
    }
}