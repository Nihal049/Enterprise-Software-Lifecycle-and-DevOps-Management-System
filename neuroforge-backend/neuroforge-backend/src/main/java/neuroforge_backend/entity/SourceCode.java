package neuroforge_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "SOURCE_CODE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SourceCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "code_id")
    private Integer codeId;

    // Links the committed code directly back to the Task it belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Column(name = "file_name", nullable = false, length = 150)
    private String fileName;

    @Column(name = "file_path", length = 255)
    private String filePath;

    @Column(length = 50)
    private String language;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "commit_id", length = 100)
    private String commitId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}