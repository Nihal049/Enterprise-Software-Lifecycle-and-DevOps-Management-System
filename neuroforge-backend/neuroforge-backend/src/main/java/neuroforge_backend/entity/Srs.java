package neuroforge_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "SRS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Srs {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "srs_id")
    private Integer srsId;

    @Column(length = 20)
    private String version;

    @Column(name = "created_date")
    private LocalDate createdDate;

    // Links the SRS document directly back to the Requirement it details
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requirement_id", nullable = false)
    private Requirement requirement;
}