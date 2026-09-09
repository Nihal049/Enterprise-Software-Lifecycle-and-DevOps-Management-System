package neuroforge_backend.repository;

import neuroforge_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    // NEW: Magic Spring Boot method to find a user by their email!
    Optional<User> findByEmail(String email);

}