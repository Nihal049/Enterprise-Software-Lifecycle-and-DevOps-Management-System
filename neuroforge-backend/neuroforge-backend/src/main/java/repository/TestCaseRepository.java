package neuroforge_backend.repository;

import neuroforge_backend.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestCaseRepository extends JpaRepository<TestCase, Integer> {
}