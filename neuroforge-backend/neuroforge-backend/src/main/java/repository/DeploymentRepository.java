package neuroforge_backend.repository;

import neuroforge_backend.entity.Deployment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeploymentRepository extends JpaRepository<Deployment, Integer> {
    // Automatically returns deployments ordered by newest first
    List<Deployment> findAllByOrderByDeploymentDateDesc();
}