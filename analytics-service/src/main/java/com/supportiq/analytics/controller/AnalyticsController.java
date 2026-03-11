package com.supportiq.analytics.controller;

import com.supportiq.analytics.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard-metrics")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics(
            @RequestHeader("X-Organization-Id") String orgId) {
        return ResponseEntity.ok(analyticsService.getDashboardMetrics(UUID.fromString(orgId)));
    }

    @GetMapping("/agent-performance")
    public ResponseEntity<List<Map<String, Object>>> getAgentPerformance(
            @RequestHeader("X-Organization-Id") String orgId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        return ResponseEntity.ok(analyticsService.getAgentPerformance(UUID.fromString(orgId), from, to));
    }

    @GetMapping("/ticket-trends")
    public ResponseEntity<List<Map<String, Object>>> getTicketTrends(
            @RequestHeader("X-Organization-Id") String orgId,
            @RequestParam(required = false, defaultValue = "30d") String period) {
        return ResponseEntity.ok(analyticsService.getTicketTrends(UUID.fromString(orgId), period));
    }

    @GetMapping("/category-distribution")
    public ResponseEntity<List<Map<String, Object>>> getCategoryDistribution(
            @RequestHeader("X-Organization-Id") String orgId) {
        return ResponseEntity.ok(analyticsService.getCategoryDistribution(UUID.fromString(orgId)));
    }

    @GetMapping("/sla-compliance")
    public ResponseEntity<List<Map<String, Object>>> getSlaCompliance(
            @RequestHeader("X-Organization-Id") String orgId) {
        return ResponseEntity.ok(analyticsService.getSlaCompliance(UUID.fromString(orgId)));
    }

    @GetMapping("/trending-issues")
    public ResponseEntity<List<Map<String, Object>>> getTrendingIssues(
            @RequestHeader("X-Organization-Id") String orgId) {
        return ResponseEntity.ok(analyticsService.getTrendingIssues(UUID.fromString(orgId)));
    }
}
