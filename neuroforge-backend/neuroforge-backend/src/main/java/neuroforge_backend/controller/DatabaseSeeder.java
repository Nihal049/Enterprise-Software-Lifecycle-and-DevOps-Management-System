package neuroforge_backend.config;

import neuroforge_backend.entity.User;
import neuroforge_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Injecting YOUR app's exact encoder instead of guessing
    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            //userRepository.deleteAll();

            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@neuroforge.com");

            // This is the fix. It encrypts using your SecurityConfig settings.
            admin.setPassword(passwordEncoder.encode("admin123"));

            admin.setStatus("ACTIVE");
            admin.setCreatedAt(LocalDateTime.now());

            userRepository.save(admin);

            System.out.println("✅ ==========================================");
            System.out.println("✅ PERFECT ADMIN CREATED WITH NATIVE ENCODER");
            System.out.println("✅ Email: admin@neuroforge.com");
            System.out.println("✅ Password: admin123");
            System.out.println("✅ ==========================================");
        } catch (Exception e) {
            System.out.println("⏳ SEEDER FAILED TO RUN.");
            e.printStackTrace();
        }
    }
}