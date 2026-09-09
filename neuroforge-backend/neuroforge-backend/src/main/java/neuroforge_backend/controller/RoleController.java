package neuroforge_backend.controller;

import neuroforge_backend.entity.Role;
import neuroforge_backend.repository.RoleRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
    private final RoleRepository roleRepository;

    public RoleController(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    // READ (GET)
    @GetMapping
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    // CREATE (POST)
    @PostMapping
    public Role createRole(@RequestBody Role role) {
        return roleRepository.save(role);
    }

    // UPDATE (PUT): Finds the existing role by ID, updates its fields, and saves it
    @PutMapping("/{id}")
    public Role updateRole(@PathVariable Integer id, @RequestBody Role roleDetails) {
        Role existingRole = roleRepository.findById(id).orElseThrow(() -> new RuntimeException("Role not found"));

        existingRole.setRoleName(roleDetails.getRoleName());
        existingRole.setDescription(roleDetails.getDescription());

        return roleRepository.save(existingRole);
    }

    // DELETE (DELETE): Finds the role by ID and removes it
    @DeleteMapping("/{id}")
    public String deleteRole(@PathVariable Integer id) {
        roleRepository.deleteById(id);
        return "Role with ID " + id + " has been deleted successfully!";
    }
}