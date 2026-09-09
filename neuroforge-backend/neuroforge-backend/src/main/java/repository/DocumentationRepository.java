package neuroforge_backend.repository;

import neuroforge_backend.entity.Documentation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentationRepository extends JpaRepository<Documentation, Integer> {
}