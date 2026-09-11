package neuroforge_backend.controller;

import neuroforge_backend.entity.User;
import neuroforge_backend.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder; // <-- ADDED IMPORT
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        // ENCRYPT PASSWORD BEFORE SAVING!
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Integer id, @RequestBody User userDetails) {
        User existingUser = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        existingUser.setName(userDetails.getName());
        existingUser.setEmail(userDetails.getEmail());
        existingUser.setStatus(userDetails.getStatus());

        if (userDetails.getRole() != null) {
            existingUser.setRole(userDetails.getRole());
        }

        // ENCRYPT PASSWORD IF IT IS BEING UPDATED!
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        return userRepository.save(existingUser);
    }

    // --- ONLY DEVOPS CAN DELETE ---
    @PreAuthorize("hasAuthority('DevOps Engineer')")
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Integer id) {
        userRepository.deleteById(id);
        return "User with ID " + id + " has been deleted successfully!";
    }
}