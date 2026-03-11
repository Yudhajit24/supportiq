package com.supportiq.tickets.service;

import com.supportiq.tickets.dto.*;
import com.supportiq.tickets.kafka.TicketEventPublisher;
import com.supportiq.tickets.model.*;
import com.supportiq.tickets.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TicketService {

    private static final Logger log = LoggerFactory.getLogger(TicketService.class);

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final HistoryRepository historyRepository;
    private final TicketEventPublisher eventPublisher;

    public TicketService(TicketRepository ticketRepository, CommentRepository commentRepository,
            HistoryRepository historyRepository, TicketEventPublisher eventPublisher) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.historyRepository = historyRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Ticket createTicket(CreateTicketRequest request, UUID organizationId, UUID userId) {
        Ticket ticket = new Ticket();
        ticket.setOrganizationId(organizationId);
        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority() != null ? request.getPriority() : "medium");
        ticket.setCategory(request.getCategory());
        ticket.setSource(request.getSource() != null ? request.getSource() : "web");
        ticket.setChannel(request.getChannel() != null ? request.getChannel() : "email");
        ticket.setStatus("open");

        if (request.getCustomerId() != null) {
            ticket.setCustomerId(UUID.fromString(request.getCustomerId()));
        }
        if (request.getAssignedTo() != null) {
            ticket.setAssignedTo(UUID.fromString(request.getAssignedTo()));
        }
        if (request.getTeamId() != null) {
            ticket.setTeamId(UUID.fromString(request.getTeamId()));
        }

        // Set SLA deadline based on priority
        ticket.setSlaDeadline(calculateSlaDeadline(request.getPriority()));

        ticket = ticketRepository.save(ticket);
        log.info("Created ticket {} in org {}", ticket.getId(), organizationId);

        eventPublisher.publishTicketCreated(ticket);
        return ticket;
    }

    public Ticket getTicket(UUID ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));
    }

    @Transactional
    public Ticket updateTicket(UUID ticketId, UpdateTicketRequest request, UUID userId) {
        Ticket ticket = getTicket(ticketId);

        if (request.getSubject() != null) {
            recordHistory(ticketId, userId, "subject", ticket.getSubject(), request.getSubject());
            ticket.setSubject(request.getSubject());
        }
        if (request.getDescription() != null) {
            ticket.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            recordHistory(ticketId, userId, "status", ticket.getStatus(), request.getStatus());
            ticket.setStatus(request.getStatus());
            if ("resolved".equals(request.getStatus())) {
                ticket.setResolvedAt(ZonedDateTime.now());
            } else if ("closed".equals(request.getStatus())) {
                ticket.setClosedAt(ZonedDateTime.now());
            }
        }
        if (request.getPriority() != null) {
            recordHistory(ticketId, userId, "priority", ticket.getPriority(), request.getPriority());
            ticket.setPriority(request.getPriority());
        }
        if (request.getCategory() != null) {
            recordHistory(ticketId, userId, "category", ticket.getCategory(), request.getCategory());
            ticket.setCategory(request.getCategory());
        }
        if (request.getAssignedTo() != null) {
            String oldAssigned = ticket.getAssignedTo() != null ? ticket.getAssignedTo().toString() : null;
            recordHistory(ticketId, userId, "assigned_to", oldAssigned, request.getAssignedTo());
            ticket.setAssignedTo(UUID.fromString(request.getAssignedTo()));
        }

        ticket = ticketRepository.save(ticket);
        eventPublisher.publishTicketUpdated(ticket);
        return ticket;
    }

    @Transactional
    public void deleteTicket(UUID ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new RuntimeException("Ticket not found: " + ticketId);
        }
        ticketRepository.deleteById(ticketId);
        log.info("Deleted ticket {}", ticketId);
    }

    public Page<Ticket> getAllTickets(UUID organizationId, String status, String priority,
            String category, int page, int size, String sortBy) {
        Sort sort = Sort.by(Sort.Direction.DESC, sortBy != null ? sortBy : "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        if (status != null) {
            return ticketRepository.findByOrganizationIdAndStatus(organizationId, status, pageable);
        }
        if (priority != null) {
            return ticketRepository.findByOrganizationIdAndPriority(organizationId, priority, pageable);
        }
        if (category != null) {
            return ticketRepository.findByOrganizationIdAndCategory(organizationId, category, pageable);
        }

        return ticketRepository.findByOrganizationId(organizationId, pageable);
    }

    public Page<Ticket> getMyTickets(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ticketRepository.findByAssignedTo(userId, pageable);
    }

    public Page<Ticket> searchTickets(UUID organizationId, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ticketRepository.searchTickets(organizationId, query, pageable);
    }

    @Transactional
    public Ticket assignTicket(UUID ticketId, UUID agentId, UUID userId) {
        Ticket ticket = getTicket(ticketId);
        String oldAssigned = ticket.getAssignedTo() != null ? ticket.getAssignedTo().toString() : null;
        recordHistory(ticketId, userId, "assigned_to", oldAssigned, agentId.toString());
        ticket.setAssignedTo(agentId);
        if ("open".equals(ticket.getStatus())) {
            ticket.setStatus("in_progress");
        }
        ticket = ticketRepository.save(ticket);
        eventPublisher.publishTicketAssigned(ticket);
        return ticket;
    }

    @Transactional
    public Ticket updateStatus(UUID ticketId, String newStatus, UUID userId) {
        Ticket ticket = getTicket(ticketId);
        recordHistory(ticketId, userId, "status", ticket.getStatus(), newStatus);
        ticket.setStatus(newStatus);
        if ("resolved".equals(newStatus)) {
            ticket.setResolvedAt(ZonedDateTime.now());
            eventPublisher.publishTicketResolved(ticket);
        } else if ("closed".equals(newStatus)) {
            ticket.setClosedAt(ZonedDateTime.now());
        }
        return ticketRepository.save(ticket);
    }

    // Comments
    @Transactional
    public TicketComment addComment(UUID ticketId, CreateCommentRequest request, UUID userId) {
        Ticket ticket = getTicket(ticketId); // verify ticket exists

        TicketComment comment = new TicketComment();
        comment.setTicketId(ticketId);
        comment.setAuthorId(userId);
        comment.setContent(request.getContent());
        comment.setInternal(request.isInternal());
        comment.setAiGenerated(request.isAiGenerated());

        if (request.getCustomerId() != null) {
            comment.setCustomerId(UUID.fromString(request.getCustomerId()));
        }

        comment = commentRepository.save(comment);

        // Set first response time
        if (ticket.getFirstResponseAt() == null && userId != null) {
            ticket.setFirstResponseAt(ZonedDateTime.now());
            ticketRepository.save(ticket);
        }

        eventPublisher.publishTicketCommented(ticket);
        return comment;
    }

    public List<TicketComment> getComments(UUID ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public List<TicketHistory> getHistory(UUID ticketId) {
        return historyRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }

    // Helpers
    private void recordHistory(UUID ticketId, UUID userId, String field, String oldValue, String newValue) {
        TicketHistory history = new TicketHistory();
        history.setTicketId(ticketId);
        history.setUserId(userId);
        history.setFieldName(field);
        history.setOldValue(oldValue);
        history.setNewValue(newValue);
        historyRepository.save(history);
    }

    private ZonedDateTime calculateSlaDeadline(String priority) {
        ZonedDateTime now = ZonedDateTime.now();
        return switch (priority != null ? priority : "medium") {
            case "urgent" -> now.plusHours(4);
            case "high" -> now.plusHours(24);
            case "medium" -> now.plusHours(48);
            case "low" -> now.plusHours(72);
            default -> now.plusHours(48);
        };
    }
}
