package neuroforge_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.math.BigDecimal; // Add this new import!

@Entity
@Table(name = "AI_REPORTS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Integer reportId;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @Column(name = "accuracy_score")
    private BigDecimal accuracyScore; // Changed from Double to BigDecimal

    @CreationTimestamp
    @Column(name = "generated_date", updatable = false)
    private LocalDateTime generatedDate;

    // Links the AI Report back to the SRS document it analyzed
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "srs_id", nullable = false)
    private Srs srs;
}