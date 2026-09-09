package neuroforge_backend.controller;

import neuroforge_backend.entity.Notification;
import neuroforge_backend.repository.NotificationRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public List<Notification> getAllNotifications() { return notificationRepository.findAll(); }

    @PostMapping
    public Notification createNotification(@RequestBody Notification notification) { return notificationRepository.save(notification); }

    @PutMapping("/{id}")
    public Notification updateNotification(@PathVariable Integer id, @RequestBody Notification details) {
        Notification existing = notificationRepository.findById(id).orElseThrow(() -> new RuntimeException("Notification not found"));
        existing.setMessage(details.getMessage());
        existing.setType(details.getType());
        existing.setIsRead(details.getIsRead());
        if (details.getUser() != null) existing.setUser(details.getUser());
        return notificationRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteNotification(@PathVariable Integer id) {
        notificationRepository.deleteById(id);
        return "Notification with ID " + id + " deleted successfully!";
    }
}