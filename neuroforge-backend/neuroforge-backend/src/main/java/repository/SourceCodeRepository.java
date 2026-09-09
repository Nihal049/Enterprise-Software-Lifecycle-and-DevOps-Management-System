package neuroforge_backend.repository;

import neuroforge_backend.entity.SourceCode;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SourceCodeRepository extends JpaRepository<SourceCode, Integer> {
}