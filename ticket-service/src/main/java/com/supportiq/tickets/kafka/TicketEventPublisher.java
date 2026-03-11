package com.supportiq.tickets.kafka;

import com.supportiq.tickets.model.Ticket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class TicketEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(TicketEventPublisher.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public TicketEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishTicketCreated(Ticket ticket) {
        publish("ticket.created", ticket);
    }

    public void publishTicketUpdated(Ticket ticket) {
        publish("ticket.updated", ticket);
    }

    public void publishTicketAssigned(Ticket ticket) {
        publish("ticket.assigned", ticket);
    }

    public void publishTicketResolved(Ticket ticket) {
        publish("ticket.resolved", ticket);
    }

    public void publishTicketCommented(Ticket ticket) {
        publish("ticket.commented", ticket);
    }

    private void publish(String topic, Ticket ticket) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("ticketId", ticket.getId().toString());
            event.put("organizationId", ticket.getOrganizationId().toString());
            event.put("subject", ticket.getSubject());
            event.put("status", ticket.getStatus());
            event.put("priority", ticket.getPriority());
            event.put("category", ticket.getCategory());
            event.put("assignedTo", ticket.getAssignedTo() != null ? ticket.getAssignedTo().toString() : null);

            kafkaTemplate.send(topic, ticket.getId().toString(), event);
            log.info("Published event to topic '{}' for ticket {}", topic, ticket.getId());
        } catch (Exception e) {
            log.warn("⚠️ Failed to publish Kafka event to '{}': {}. Kafka may not be running.", topic, e.getMessage());
        }
    }
}
