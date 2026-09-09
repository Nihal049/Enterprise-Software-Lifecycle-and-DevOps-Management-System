package neuroforge_backend.controller;

import neuroforge_backend.entity.Monitoring;
import neuroforge_backend.repository.MonitoringRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/monitoring")
public class MonitoringController {
    private final MonitoringRepository monitoringRepository;

    public MonitoringController(MonitoringRepository monitoringRepository) {
        this.monitoringRepository = monitoringRepository;
    }

    @GetMapping
    public List<Monitoring> getAllMonitoring() { return monitoringRepository.findAll(); }

    @PostMapping
    public Monitoring createMonitoring(@RequestBody Monitoring monitoring) { return monitoringRepository.save(monitoring); }

    @PutMapping("/{id}")
    public Monitoring updateMonitoring(@PathVariable Integer id, @RequestBody Monitoring details) {
        Monitoring existing = monitoringRepository.findById(id).orElseThrow(() -> new RuntimeException("Monitoring record not found"));
        existing.setLogs(details.getLogs());
        existing.setPerformance(details.getPerformance());
        existing.setAlerts(details.getAlerts());
        if (details.getDeployment() != null) existing.setDeployment(details.getDeployment());
        return monitoringRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteMonitoring(@PathVariable Integer id) {
        monitoringRepository.deleteById(id);
        return "Monitoring record with ID " + id + " deleted successfully!";
    }
}