package neuroforge_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "SOURCE_REPOS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SourceRepo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "repo_id")
    private Integer repoId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 255)
    private String url;

    @Column(length = 50)
    private String defaultBranch = "main";

    @Column(length = 20)
    private String status = "Synced";

    @CreationTimestamp
    @Column(name = "last_synced")
    private LocalDateTime lastSynced;
}