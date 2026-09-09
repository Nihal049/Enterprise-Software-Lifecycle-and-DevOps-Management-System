package neuroforge_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "DOCUMENTATION")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Documentation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Integer documentId;

    @Column(name = "document_type", length = 100)
    private String documentType;

    @Column(length = 20)
    private String version;

    // Links the documentation to the overall Project
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
}