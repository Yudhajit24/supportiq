package com.supportiq.tickets.controller;

import com.supportiq.tickets.dto.*;
import com.supportiq.tickets.model.*;
import com.supportiq.tickets.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@Valid @RequestBody CreateTicketRequest request,
            @RequestHeader("X-Organization-Id") String orgId,
            @RequestHeader("X-User-Id") String userId) {
        Ticket ticket = ticketService.createTicket(request, UUID.fromString(orgId), UUID.fromString(userId));
        return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicket(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.getTicket(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable UUID id,
            @RequestBody UpdateTicketRequest request,
            @RequestHeader("X-User-Id") String userId) {
        Ticket ticket = ticketService.updateTicket(id, request, UUID.fromString(userId));
        return ResponseEntity.ok(ticket);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable UUID id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<Ticket>> getAllTickets(
            @RequestHeader("X-Organization-Id") String orgId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sortBy) {
        Page<Ticket> tickets = ticketService.getAllTickets(UUID.fromString(orgId),
                status, priority, category, page, size, sortBy);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<Page<Ticket>> getMyTickets(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ticketService.getMyTickets(UUID.fromString(userId), page, size));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Ticket>> searchTickets(
            @RequestHeader("X-Organization-Id") String orgId,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ticketService.searchTickets(UUID.fromString(orgId), q, page, size));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTicket(@PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @RequestHeader("X-User-Id") String userId) {
        UUID agentId = UUID.fromString(body.get("agentId"));
        return ResponseEntity.ok(ticketService.assignTicket(id, agentId, UUID.fromString(userId)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Ticket> updateStatus(@PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @RequestHeader("X-User-Id") String userId) {
        String newStatus = body.get("status");
        return ResponseEntity.ok(ticketService.updateStatus(id, newStatus, UUID.fromString(userId)));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketComment> addComment(@PathVariable UUID id,
            @Valid @RequestBody CreateCommentRequest request,
            @RequestHeader("X-User-Id") String userId) {
        TicketComment comment = ticketService.addComment(id, request, UUID.fromString(userId));
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketComment>> getComments(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.getComments(id));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<TicketHistory>> getHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.getHistory(id));
    }
}
