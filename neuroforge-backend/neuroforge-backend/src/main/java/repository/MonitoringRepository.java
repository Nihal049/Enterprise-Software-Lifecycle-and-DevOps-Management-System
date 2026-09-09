package neuroforge_backend.repository;

import neuroforge_backend.entity.Monitoring;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MonitoringRepository extends JpaRepository<Monitoring, Integer> {
}