package neuroforge_backend.controller;

import neuroforge_backend.entity.Organization;
import neuroforge_backend.repository.OrganizationRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {
    private final OrganizationRepository organizationRepository;

    public OrganizationController(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @GetMapping
    public List<Organization> getAllOrganizations() { return organizationRepository.findAll(); }

    @PostMapping
    public Organization createOrganization(@RequestBody Organization organization) { return organizationRepository.save(organization); }

    @PutMapping("/{id}")
    public Organization updateOrganization(@PathVariable Integer id, @RequestBody Organization details) {
        Organization existing = organizationRepository.findById(id).orElseThrow(() -> new RuntimeException("Organization not found"));
        existing.setOrganizationName(details.getOrganizationName());
        existing.setDescription(details.getDescription());
        return organizationRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteOrganization(@PathVariable Integer id) {
        organizationRepository.deleteById(id);
        return "Organization with ID " + id + " deleted successfully!";
    }
}