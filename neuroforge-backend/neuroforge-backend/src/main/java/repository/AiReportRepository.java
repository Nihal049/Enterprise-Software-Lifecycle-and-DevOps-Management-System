package neuroforge_backend.repository;

import neuroforge_backend.entity.AiReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiReportRepository extends JpaRepository<AiReport, Integer> {
}