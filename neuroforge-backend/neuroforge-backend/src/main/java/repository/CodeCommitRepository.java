package neuroforge_backend.repository;

import neuroforge_backend.entity.CodeCommit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CodeCommitRepository extends JpaRepository<CodeCommit, Integer> {
    // Automatically returns commits ordered by timestamp descending
    List<CodeCommit> findAllByOrderByTimestampDesc();
}