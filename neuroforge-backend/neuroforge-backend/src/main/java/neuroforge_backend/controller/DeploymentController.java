package neuroforge_backend.controller;

import neuroforge_backend.entity.Deployment;
import neuroforge_backend.repository.DeploymentRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deployments")
@CrossOrigin(origins = "http://localhost:5173") // <-- CRITICAL FOR REACT
public class DeploymentController {
    private final DeploymentRepository deploymentRepository;

    public DeploymentController(DeploymentRepository deploymentRepository) {
        this.deploymentRepository = deploymentRepository;
    }

    @GetMapping
    public List<Deployment> getAllDeployments() {
        return deploymentRepository.findAllByOrderByDeploymentDateDesc();
    }

    @PostMapping
    public Deployment createDeployment(@RequestBody Deployment deployment) {
        if (deployment.getStatus() == null) deployment.setStatus("Running");
        return deploymentRepository.save(deployment);
    }

    @PutMapping("/{id}")
    public Deployment updateDeployment(@PathVariable Integer id, @RequestBody Deployment details) {
        Deployment existing = deploymentRepository.findById(id).orElseThrow(() -> new RuntimeException("Deployment not found"));
        existing.setVersion(details.getVersion());
        existing.setEnvironment(details.getEnvironment());
        existing.setStatus(details.getStatus());
        existing.setNotes(details.getNotes());
        if (details.getProject() != null) existing.setProject(details.getProject());
        if (details.getDeployedBy() != null) existing.setDeployedBy(details.getDeployedBy());
        return deploymentRepository.save(existing);
    }

    // <-- NEW ENDPOINT: Quick status update for our UI buttons -->
    @PutMapping("/{id}/status")
    public Deployment updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> payload) {
        Deployment deployment = deploymentRepository.findById(id).orElseThrow(() -> new RuntimeException("Deployment not found"));
        deployment.setStatus(payload.get("status"));
        return deploymentRepository.save(deployment);
    }

    @DeleteMapping("/{id}")
    public String deleteDeployment(@PathVariable Integer id) {
        deploymentRepository.deleteById(id);
        return "Deployment with ID " + id + " deleted successfully!";
    }
}