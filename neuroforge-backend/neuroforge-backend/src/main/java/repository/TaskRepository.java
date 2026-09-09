package neuroforge_backend.repository;

import neuroforge_backend.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Integer> {
    long countByStatus(String status);
    List<Task> findBySprint_SprintId(Integer sprintId);

    List<Task> findBySprint_Project_ProjectId(Integer projectId);
}