package neuroforge_backend.repository;

import neuroforge_backend.entity.Bug;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BugRepository extends JpaRepository<Bug, Integer> {
    // Automatically counts bugs by their status (e.g., "Open")
    long countByStatus(String status);
}