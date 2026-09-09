package neuroforge_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "DEPLOYMENTS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Deployment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "deployment_id")
    private Integer deploymentId;

    // Links the deployment to the overall Project
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(length = 50)
    private String version;

    @Column(length = 50)
    private String environment;

    // Links to the User who executed the deployment
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "deployed_by")
    private User deployedBy;

    @CreationTimestamp
    @Column(name = "deployment_date", updatable = false)
    private LocalDateTime deploymentDate;

    @Column(length = 20)
    private String status = "Success";

    @Column(columnDefinition = "TEXT")
    private String notes;
}