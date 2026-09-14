package neuroforge_backend.controller;

import neuroforge_backend.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiController {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // --- The 15 Verified Repositories in your Project ---
    private final AiReportRepository aiReportRepository;
    private final BugRepository bugRepository;
    private final CodeCommitRepository codeCommitRepository;
    private final DeploymentRepository deploymentRepository;
    private final DesignRepository designRepository;
    private final DocumentationRepository documentationRepository;
    private final MonitoringRepository monitoringRepository;
    private final NotificationRepository notificationRepository;
    private final ProjectRepository projectRepository;
    private final RequirementRepository requirementRepository;
    private final SprintRepository sprintRepository;
    private final SrsRepository srsRepository;
    private final TaskRepository taskRepository;
    private final TestCaseRepository testCaseRepository;
    private final UserRepository userRepository;

    public AiController(
            AiReportRepository aiReportRepository,
            BugRepository bugRepository,
            CodeCommitRepository codeCommitRepository,
            DeploymentRepository deploymentRepository,
            DesignRepository designRepository,
            DocumentationRepository documentationRepository,
            MonitoringRepository monitoringRepository,
            NotificationRepository notificationRepository,
            ProjectRepository projectRepository,
            RequirementRepository requirementRepository,
            SprintRepository sprintRepository,
            SrsRepository srsRepository,
            TaskRepository taskRepository,
            TestCaseRepository testCaseRepository,
            UserRepository userRepository
    ) {
        this.aiReportRepository = aiReportRepository;
        this.bugRepository = bugRepository;
        this.codeCommitRepository = codeCommitRepository;
        this.deploymentRepository = deploymentRepository;
        this.designRepository = designRepository;
        this.documentationRepository = documentationRepository;
        this.monitoringRepository = monitoringRepository;
        this.notificationRepository = notificationRepository;
        this.projectRepository = projectRepository;
        this.requirementRepository = requirementRepository;
        this.sprintRepository = sprintRepository;
        this.srsRepository = srsRepository;
        this.taskRepository = taskRepository;
        this.testCaseRepository = testCaseRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/ask")
    public ResponseEntity<?> askCopilot(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        if (prompt == null || prompt.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Prompt is required");
        }

        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" + apiKey;

        String dbContext = buildDatabaseContext(prompt.toLowerCase());

        String fullSystemPrompt = """
                You are NeuroForge Copilot, an enterprise-grade SDLC & DevOps intelligence assistant.
                You have direct access to the live MySQL database state of the application.
                Use the following real-time database context to answer the user accurately:

                --- CURRENT DATABASE CONTEXT ---
                %s
                --------------------------------

                User Query: %s
                """.formatted(dbContext, prompt);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", fullSystemPrompt)
                        ))
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String aiText = (String) parts.get(0).get("text");

            return ResponseEntity.ok(Map.of("reply", aiText));

        } catch (HttpClientErrorException e) {
            return ResponseEntity.ok(Map.of("reply", "⚠️ Google API Error: " + e.getResponseBodyAsString()));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("reply", "⚠️ Copilot is temporarily busy or experiencing network load. Please try again shortly."));
        }
    }

    private String buildDatabaseContext(String query) {
        StringBuilder sb = new StringBuilder();

        // 1. High-Level Summary (Always included)
        sb.append(String.format("Global Counts: Projects: %d, Sprints: %d, Tasks: %d, Bugs: %d, Users: %d, Deployments: %d, TestCases: %d\n",
                projectRepository.count(),
                sprintRepository.count(),
                taskRepository.count(),
                bugRepository.count(),
                userRepository.count(),
                deploymentRepository.count(),
                testCaseRepository.count()
        ));

        // 2. Tasks context
        if (query.contains("task") || query.contains("summary") || query.contains("all") || query.contains("board") || query.contains("work")) {
            sb.append("\nTasks:\n");
            taskRepository.findAll().stream().limit(25).forEach(t -> sb.append(String.format("- [Task #%s] %s (Status: %s)\n",
                    safeGet(t, "getId"), safeGet(t, "getTitle"), safeGet(t, "getStatus"))));
        }

        // 3. Sprints context
        if (query.contains("sprint") || query.contains("agile") || query.contains("summary") || query.contains("all")) {
            sb.append("\nSprints:\n");
            sprintRepository.findAll().stream().limit(10).forEach(s -> sb.append(String.format("- [Sprint #%s] %s (Status: %s)\n",
                    safeGet(s, "getId"), safeGet(s, "getName"), safeGet(s, "getStatus"))));
        }

        // 4. Bugs & Defects context
        if (query.contains("bug") || query.contains("defect") || query.contains("issue") || query.contains("error") || query.contains("all")) {
            sb.append("\nBugs & Defects:\n");
            bugRepository.findAll().stream().limit(15).forEach(b -> sb.append(String.format("- [Bug #%s] %s (Severity: %s, Status: %s)\n",
                    safeGet(b, "getId"), safeGet(b, "getTitle"), safeGet(b, "getSeverity"), safeGet(b, "getStatus"))));
        }

        // 5. Deployments & Pipelines context
        if (query.contains("deploy") || query.contains("pipeline") || query.contains("release") || query.contains("all")) {
            sb.append("\nDeployments:\n");
            deploymentRepository.findAll().stream().limit(10).forEach(d -> sb.append(String.format("- [Deploy #%s] %s (Environment: %s, Status: %s)\n",
                    safeGet(d, "getId"), safeGet(d, "getName"), safeGet(d, "getEnvironment"), safeGet(d, "getStatus"))));
        }

        // 6. Commits & Source Code context
        if (query.contains("commit") || query.contains("repo") || query.contains("code") || query.contains("git") || query.contains("all")) {
            sb.append("\nRecent Commits:\n");
            codeCommitRepository.findAll().stream().limit(10).forEach(c -> sb.append(String.format("- [Commit #%s] %s (Author: %s)\n",
                    safeGet(c, "getId"), safeGet(c, "getMessage"), safeGet(c, "getAuthor"))));
        }

        // 7. Users & Roles context
        if (query.contains("user") || query.contains("member") || query.contains("team") || query.contains("who") || query.contains("all")) {
            sb.append("\nTeam Members:\n");
            userRepository.findAll().stream().limit(20).forEach(u -> sb.append(String.format("- %s (%s, Status: %s)\n",
                    safeGet(u, "getName"), safeGet(u, "getEmail"), safeGet(u, "getStatus"))));
        }

        // 8. Test Cases & QA context
        if (query.contains("test") || query.contains("qa") || query.contains("case") || query.contains("all")) {
            sb.append("\nTest Cases:\n");
            testCaseRepository.findAll().stream().limit(15).forEach(tc -> sb.append(String.format("- [Test #%s] %s (Status: %s)\n",
                    safeGet(tc, "getId"), safeGet(tc, "getName"), safeGet(tc, "getStatus"))));
        }

        // 9. Documentation, SRS, Requirements & Designs
        if (query.contains("doc") || query.contains("requirement") || query.contains("srs") || query.contains("design")) {
            sb.append("\nDocumentation & Requirements:\n");
            requirementRepository.findAll().stream().limit(10).forEach(r -> sb.append(String.format("- [Req #%s] %s\n", safeGet(r, "getId"), safeGet(r, "getTitle"))));
            srsRepository.findAll().stream().limit(5).forEach(s -> sb.append(String.format("- [SRS #%s] %s\n", safeGet(s, "getId"), safeGet(s, "getTitle"))));
            documentationRepository.findAll().stream().limit(5).forEach(d -> sb.append(String.format("- [Doc #%s] %s\n", safeGet(d, "getId"), safeGet(d, "getTitle"))));
            designRepository.findAll().stream().limit(5).forEach(de -> sb.append(String.format("- [Design #%s] %s\n", safeGet(de, "getId"), safeGet(de, "getTitle"))));
        }

        // 10. Monitoring & Alerts
        if (query.contains("monitor") || query.contains("alert") || query.contains("notify")) {
            sb.append("\nMonitoring & Alerts:\n");
            monitoringRepository.findAll().stream().limit(5).forEach(m -> sb.append(String.format("- [Metric #%s] %s\n", safeGet(m, "getId"), safeGet(m, "getName"))));
            notificationRepository.findAll().stream().limit(5).forEach(n -> sb.append(String.format("- [Alert #%s] %s\n", safeGet(n, "getId"), safeGet(n, "getMessage"))));
        }

        return sb.toString();
    }

    private String safeGet(Object entity, String methodName) {
        if (entity == null) return "N/A";
        try {
            var method = entity.getClass().getMethod(methodName);
            Object res = method.invoke(entity);
            return res != null ? res.toString() : "N/A";
        } catch (Exception e) {
            return "N/A";
        }
    }
}