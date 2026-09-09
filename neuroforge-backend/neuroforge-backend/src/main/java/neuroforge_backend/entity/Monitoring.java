package neuroforge_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "MONITORING")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Monitoring {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "monitoring_id")
    private Integer monitoringId;

    @Column(columnDefinition = "TEXT")
    private String logs;

    @Column(length = 100)
    private String performance;

    @Column(columnDefinition = "TEXT")
    private String alerts;

    // Links the monitoring data to a specific Deployment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deployment_id", nullable = false)
    private Deployment deployment;
}