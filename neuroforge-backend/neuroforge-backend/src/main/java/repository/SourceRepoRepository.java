package neuroforge_backend.repository;

import neuroforge_backend.entity.SourceRepo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SourceRepoRepository extends JpaRepository<SourceRepo, Integer> {
}