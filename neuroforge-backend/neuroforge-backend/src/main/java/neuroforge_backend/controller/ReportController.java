package neuroforge_backend.controller;

import neuroforge_backend.entity.Report;
import neuroforge_backend.repository.ReportRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportRepository reportRepository;

    public ReportController(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @GetMapping
    public List<Report> getAllReports() { return reportRepository.findAll(); }

    @PostMapping
    public Report createReport(@RequestBody Report report) { return reportRepository.save(report); }

    @PutMapping("/{id}")
    public Report updateReport(@PathVariable Integer id, @RequestBody Report details) {
        Report existing = reportRepository.findById(id).orElseThrow(() -> new RuntimeException("Report not found"));
        existing.setReportType(details.getReportType());
        existing.setFilePath(details.getFilePath());
        if (details.getProject() != null) existing.setProject(details.getProject());
        if (details.getGeneratedBy() != null) existing.setGeneratedBy(details.getGeneratedBy());
        return reportRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteReport(@PathVariable Integer id) {
        reportRepository.deleteById(id);
        return "Report with ID " + id + " deleted successfully!";
    }
}