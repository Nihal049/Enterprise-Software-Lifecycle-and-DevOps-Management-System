package neuroforge_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "TESTING")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Testing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "testing_id")
    private Integer testingId;

    @Column(name = "test_type", length = 100)
    private String testType;

    @Column(length = 50)
    private String result;

    @Column(name = "test_date")
    private LocalDate testDate;

    // Links to the Task being tested
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    // Links to the User conducting the test
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tester_id", nullable = false)
    private User tester;
}