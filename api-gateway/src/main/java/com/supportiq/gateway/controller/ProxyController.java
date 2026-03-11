package com.supportiq.gateway.controller;

import com.supportiq.gateway.model.User;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Enumeration;

@RestController
@RequestMapping("/api/v1")
public class ProxyController {

    private final RestTemplate restTemplate;

    @Value("${services.ticket-service.url}")
    private String ticketServiceUrl;

    @Value("${services.analytics-service.url}")
    private String analyticsServiceUrl;

    @Value("${services.integration-service.url}")
    private String integrationServiceUrl;

    @Value("${services.ai-service.url}")
    private String aiServiceUrl;

    public ProxyController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // Ticket Service proxy
    @RequestMapping(value = "/tickets/**", method = { RequestMethod.GET, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE })
    public ResponseEntity<String> proxyTickets(HttpServletRequest request,
            @RequestBody(required = false) String body,
            Authentication auth) {
        return proxyRequest(request, body, ticketServiceUrl, auth);
    }

    // Analytics Service proxy
    @RequestMapping(value = "/analytics/**", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<String> proxyAnalytics(HttpServletRequest request,
            @RequestBody(required = false) String body,
            Authentication auth) {
        return proxyRequest(request, body, analyticsServiceUrl, auth);
    }

    // Integration Service proxy
    @RequestMapping(value = "/integrations/**", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<String> proxyIntegrations(HttpServletRequest request,
            @RequestBody(required = false) String body,
            Authentication auth) {
        return proxyRequest(request, body, integrationServiceUrl, auth);
    }

    @RequestMapping(value = "/webhooks/**", method = { RequestMethod.POST })
    public ResponseEntity<String> proxyWebhooks(HttpServletRequest request,
            @RequestBody(required = false) String body,
            Authentication auth) {
        return proxyRequest(request, body, integrationServiceUrl, auth);
    }

    // AI Service proxy
    @RequestMapping(value = "/ai/**", method = { RequestMethod.POST })
    public ResponseEntity<String> proxyAI(HttpServletRequest request,
            @RequestBody(required = false) String body,
            Authentication auth) {
        String path = request.getRequestURI().replace("/api/v1/ai", "/ai");
        String targetUrl = aiServiceUrl + path;
        if (request.getQueryString() != null) {
            targetUrl += "?" + request.getQueryString();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (auth != null) {
            User user = (User) auth.getPrincipal();
            headers.set("X-User-Id", user.getId().toString());
            headers.set("X-Organization-Id", user.getOrganizationId().toString());
        }

        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        try {
            return restTemplate.exchange(targetUrl, HttpMethod.valueOf(request.getMethod()),
                    entity, String.class);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("{\"error\": \"AI service unavailable: " + e.getMessage() + "\"}");
        }
    }

    private ResponseEntity<String> proxyRequest(HttpServletRequest request, String body,
            String serviceUrl, Authentication auth) {
        String path = request.getRequestURI();
        String targetUrl = serviceUrl + path;
        if (request.getQueryString() != null) {
            targetUrl += "?" + request.getQueryString();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (auth != null) {
            User user = (User) auth.getPrincipal();
            headers.set("X-User-Id", user.getId().toString());
            headers.set("X-Organization-Id", user.getOrganizationId().toString());
            headers.set("X-User-Role", user.getRole());
        }

        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        try {
            return restTemplate.exchange(targetUrl, HttpMethod.valueOf(request.getMethod()),
                    entity, String.class);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("{\"error\": \"Service unavailable: " + e.getMessage() + "\"}");
        }
    }
}
