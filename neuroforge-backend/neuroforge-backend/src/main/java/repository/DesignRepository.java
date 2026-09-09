package neuroforge_backend.repository;

import neuroforge_backend.entity.Design;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DesignRepository extends JpaRepository<Design, Integer> {
}