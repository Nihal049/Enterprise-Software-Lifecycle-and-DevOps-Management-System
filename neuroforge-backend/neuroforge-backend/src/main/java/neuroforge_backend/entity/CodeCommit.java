package neuroforge_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "CODE_COMMITS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeCommit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "commit_id")
    private Integer commitId;

    @Column(nullable = false, length = 40)
    private String commitHash;

    @Column(nullable = false, length = 255)
    private String message;

    @Column(nullable = false, length = 100)
    private String author;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    // Links the commit to the specific SourceRepo we built earlier
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "repo_id", nullable = false)
    private SourceRepo repository;
}