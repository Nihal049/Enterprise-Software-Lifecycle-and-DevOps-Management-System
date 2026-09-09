package neuroforge_backend.controller;

import neuroforge_backend.entity.TestCase;
import neuroforge_backend.repository.TestCaseRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test-cases")
@CrossOrigin(origins = "http://localhost:5173") // <-- Allows React to connect
public class TestCaseController {
    private final TestCaseRepository testCaseRepository;

    public TestCaseController(TestCaseRepository testCaseRepository) {
        this.testCaseRepository = testCaseRepository;
    }

    @GetMapping
    public List<TestCase> getAllTestCases() {
        return testCaseRepository.findAll();
    }

    @PostMapping
    public TestCase createTestCase(@RequestBody TestCase testCase) {
        if (testCase.getStatus() == null) testCase.setStatus("Pending");
        return testCaseRepository.save(testCase);
    }

    @PutMapping("/{id}")
    public TestCase updateTestCase(@PathVariable Integer id, @RequestBody TestCase details) {
        TestCase existing = testCaseRepository.findById(id).orElseThrow(() -> new RuntimeException("Test Case not found"));
        existing.setTitle(details.getTitle());
        existing.setDescription(details.getDescription());
        existing.setPreconditions(details.getPreconditions());
        existing.setTestSteps(details.getTestSteps());
        existing.setExpectedResult(details.getExpectedResult());
        existing.setStatus(details.getStatus());
        if (details.getTask() != null) existing.setTask(details.getTask());
        return testCaseRepository.save(existing);
    }

    // <-- NEW: Quick status update endpoint for the UI buttons -->
    @PutMapping("/{id}/status")
    public TestCase updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> payload) {
        TestCase existing = testCaseRepository.findById(id).orElseThrow(() -> new RuntimeException("Test Case not found"));
        existing.setStatus(payload.get("status"));
        return testCaseRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteTestCase(@PathVariable Integer id) {
        testCaseRepository.deleteById(id);
        return "Test Case with ID " + id + " deleted successfully!";
    }
}