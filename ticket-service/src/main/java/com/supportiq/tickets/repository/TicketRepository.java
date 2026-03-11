package com.supportiq.tickets.repository;

import com.supportiq.tickets.model.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    Page<Ticket> findByOrganizationId(UUID organizationId, Pageable pageable);

    Page<Ticket> findByAssignedTo(UUID assignedTo, Pageable pageable);

    Page<Ticket> findByOrganizationIdAndStatus(UUID organizationId, String status, Pageable pageable);

    Page<Ticket> findByOrganizationIdAndPriority(UUID organizationId, String priority, Pageable pageable);

    Page<Ticket> findByOrganizationIdAndCategory(UUID organizationId, String category, Pageable pageable);

    @Query("SELECT t FROM Ticket t WHERE t.organizationId = :orgId AND " +
            "(LOWER(t.subject) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Ticket> searchTickets(@Param("orgId") UUID orgId, @Param("query") String query, Pageable pageable);

    long countByOrganizationIdAndStatus(UUID organizationId, String status);

    long countByOrganizationId(UUID organizationId);

    @Query("SELECT t.category, COUNT(t) FROM Ticket t WHERE t.organizationId = :orgId GROUP BY t.category")
    List<Object[]> countByCategory(@Param("orgId") UUID orgId);
}
