package neuroforge_backend.repository;

import neuroforge_backend.entity.Testing;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestingRepository extends JpaRepository<Testing, Integer> {
}