package neuroforge_backend.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import neuroforge_backend.entity.User;
import neuroforge_backend.repository.UserRepository;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            System.out.println("🔍 === LOCAL DATABASE DIAGNOSTIC === 🔍");
            List<User> users = userRepository.findAll();

            if (users.isEmpty()) {
                System.out.println("⚠️ WARNING: Your local users table is completely empty. Seeding default user...");
                
                User admin = new User();
                admin.setName("Alex Senior"); // Required by nullable=false
                admin.setEmail("alex.senior@neuroforge.local"); // Required by nullable=false
                admin.setPassword(passwordEncoder.encode("admin123")); // Required by nullable=false
                
                userRepository.save(admin);
                System.out.println("✅ SUCCESS: Created default user -> alex.senior@neuroforge.local / admin123");
            } else {
                System.out.println("✅ Found existing users. Here are their exact emails:");
                for (User u : users) {
                    System.out.println(" -> " + u.getEmail());

                    // Force reset the password for Alex just in case you forgot it
                    if (u.getEmail().contains("alex.senior")) {
                        u.setPassword(passwordEncoder.encode("admin123"));
                        userRepository.save(u);
                        System.out.println("✅ SUCCESS: Reset password for " + u.getEmail() + " to 'admin123'");
                    }
                }
            }
            System.out.println("===========================================");
        } catch (Exception e) {
            System.out.println("⏳ Diagnostics failed to run: " + e.getMessage());
        }
    }
}