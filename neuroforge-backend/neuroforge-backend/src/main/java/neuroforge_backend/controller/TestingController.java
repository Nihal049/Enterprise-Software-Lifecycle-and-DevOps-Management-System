package neuroforge_backend.controller;

import neuroforge_backend.entity.Testing;
import neuroforge_backend.repository.TestingRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/testing")
public class TestingController {
    private final TestingRepository testingRepository;

    public TestingController(TestingRepository testingRepository) {
        this.testingRepository = testingRepository;
    }

    @GetMapping
    public List<Testing> getAllTesting() { return testingRepository.findAll(); }

    @PostMapping
    public Testing createTesting(@RequestBody Testing testing) { return testingRepository.save(testing); }

    @PutMapping("/{id}")
    public Testing updateTesting(@PathVariable Integer id, @RequestBody Testing details) {
        Testing existing = testingRepository.findById(id).orElseThrow(() -> new RuntimeException("Testing record not found"));
        existing.setTestType(details.getTestType());
        existing.setResult(details.getResult());
        existing.setTestDate(details.getTestDate());
        if (details.getTask() != null) existing.setTask(details.getTask());
        if (details.getTester() != null) existing.setTester(details.getTester());
        return testingRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteTesting(@PathVariable Integer id) {
        testingRepository.deleteById(id);
        return "Testing record with ID " + id + " deleted successfully!";
    }
}