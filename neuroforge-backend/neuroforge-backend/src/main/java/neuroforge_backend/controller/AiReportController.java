package neuroforge_backend.controller;

import neuroforge_backend.entity.AiReport;
import neuroforge_backend.repository.AiReportRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ai-reports")
public class AiReportController {
    private final AiReportRepository aiReportRepository;

    public AiReportController(AiReportRepository aiReportRepository) {
        this.aiReportRepository = aiReportRepository;
    }

    @GetMapping
    public List<AiReport> getAllAiReports() { return aiReportRepository.findAll(); }

    @PostMapping
    public AiReport createAiReport(@RequestBody AiReport aiReport) { return aiReportRepository.save(aiReport); }

    @PutMapping("/{id}")
    public AiReport updateAiReport(@PathVariable Integer id, @RequestBody AiReport details) {
        AiReport existing = aiReportRepository.findById(id).orElseThrow(() -> new RuntimeException("AI Report not found"));
        existing.setRecommendations(details.getRecommendations());
        existing.setAccuracyScore(details.getAccuracyScore());
        if (details.getSrs() != null) existing.setSrs(details.getSrs());
        return aiReportRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteAiReport(@PathVariable Integer id) {
        aiReportRepository.deleteById(id);
        return "AI Report with ID " + id + " deleted successfully!";
    }
}