package com.supportiq.integrations.controller;

import com.supportiq.integrations.service.IntegrationManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class IntegrationController {

    private final IntegrationManager integrationManager;

    public IntegrationController(IntegrationManager integrationManager) {
        this.integrationManager = integrationManager;
    }

    @PostMapping("/integrations/zendesk/sync")
    public ResponseEntity<Map<String, Object>> syncZendesk(
            @RequestHeader(value = "X-Organization-Id", required = false) String orgId) {
        return ResponseEntity.ok(integrationManager.syncZendesk(orgId));
    }

    @PostMapping("/webhooks/ticket-created")
    public ResponseEntity<Map<String, Object>> handleTicketWebhook(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(integrationManager.handleWebhook("ticket-created", payload));
    }

    @GetMapping("/integrations/status")
    public ResponseEntity<Map<String, Object>> getIntegrationStatus(
            @RequestHeader(value = "X-Organization-Id", required = false) String orgId) {
        return ResponseEntity.ok(integrationManager.getStatus(orgId));
    }

    @PostMapping("/integrations/email/process")
    public ResponseEntity<Map<String, Object>> processEmail(@RequestBody Map<String, Object> emailData) {
        return ResponseEntity.ok(integrationManager.processEmail(emailData));
    }
}
