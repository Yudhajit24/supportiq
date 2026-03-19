package com.supportiq.analytics.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;


import java.util.*;

@Service
public class AnalyticsService {

    @PersistenceContext
    private EntityManager entityManager;

    public Map<String, Object> getDashboardMetrics(UUID organizationId) {
        Map<String, Object> metrics = new HashMap<>();

        // Total tickets
        Query totalQuery = entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM tickets WHERE organization_id = :orgId");
        totalQuery.setParameter("orgId", organizationId);
        metrics.put("totalTickets", ((Number) totalQuery.getSingleResult()).longValue());

        // Open tickets
        Query openQuery = entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM tickets WHERE organization_id = :orgId AND status = 'open'");
        openQuery.setParameter("orgId", organizationId);
        metrics.put("openTickets", ((Number) openQuery.getSingleResult()).longValue());

        // In progress
        Query inProgressQuery = entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM tickets WHERE organization_id = :orgId AND status = 'in_progress'");
        inProgressQuery.setParameter("orgId", organizationId);
        metrics.put("inProgressTickets", ((Number) inProgressQuery.getSingleResult()).longValue());

        // Resolved
        Query resolvedQuery = entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM tickets WHERE organization_id = :orgId AND status = 'resolved'");
        resolvedQuery.setParameter("orgId", organizationId);
        metrics.put("resolvedTickets", ((Number) resolvedQuery.getSingleResult()).longValue());

        // Average resolution time (hours)
        Query avgResQuery = entityManager.createNativeQuery(
                "SELECT COALESCE(AVG(tm.resolution_time) / 3600.0, 0) FROM ticket_metrics tm " +
                        "JOIN tickets t ON t.id = tm.ticket_id WHERE t.organization_id = :orgId AND tm.resolution_time IS NOT NULL");
        avgResQuery.setParameter("orgId", organizationId);
        metrics.put("avgResolutionTimeHours", ((Number) avgResQuery.getSingleResult()).doubleValue());

        // Average CSAT
        Query avgCsatQuery = entityManager.createNativeQuery(
                "SELECT COALESCE(AVG(tm.customer_satisfaction), 0) FROM ticket_metrics tm " +
                        "JOIN tickets t ON t.id = tm.ticket_id WHERE t.organization_id = :orgId AND tm.customer_satisfaction IS NOT NULL");
        avgCsatQuery.setParameter("orgId", organizationId);
        metrics.put("avgCustomerSatisfaction", ((Number) avgCsatQuery.getSingleResult()).doubleValue());

        // Urgent tickets
        Query urgentQuery = entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM tickets WHERE organization_id = :orgId AND priority = 'urgent' AND status NOT IN ('resolved', 'closed')");
        urgentQuery.setParameter("orgId", organizationId);
        metrics.put("urgentTickets", ((Number) urgentQuery.getSingleResult()).longValue());

        // SLA breach count
        Query slaQuery = entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM ticket_metrics tm JOIN tickets t ON t.id = tm.ticket_id " +
                        "WHERE t.organization_id = :orgId AND tm.sla_breached = true");
        slaQuery.setParameter("orgId", organizationId);
        metrics.put("slaBreachCount", ((Number) slaQuery.getSingleResult()).longValue());

        return metrics;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getAgentPerformance(UUID organizationId, String from, String to) {
        String sql = """
                    SELECT u.id, u.full_name,
                           COUNT(t.id) as tickets_resolved,
                           COALESCE(AVG(tm.resolution_time) / 3600.0, 0) as avg_resolution_hours,
                           COALESCE(AVG(tm.customer_satisfaction), 0) as avg_csat,
                           COALESCE(AVG(tm.first_response_time) / 60.0, 0) as avg_first_response_minutes
                    FROM users u
                    LEFT JOIN tickets t ON t.assigned_to = u.id AND t.status IN ('resolved', 'closed')
                    LEFT JOIN ticket_metrics tm ON tm.ticket_id = t.id
                    WHERE u.organization_id = :orgId AND u.role = 'agent'
                    GROUP BY u.id, u.full_name
                    ORDER BY avg_csat DESC, avg_resolution_hours ASC
                """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("orgId", organizationId);

        List<Object[]> results = query.getResultList();
        List<Map<String, Object>> agents = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> agent = new HashMap<>();
            agent.put("id", row[0].toString());
            agent.put("name", row[1]);
            agent.put("ticketsResolved", ((Number) row[2]).longValue());
            agent.put("avgResolutionHours", Math.round(((Number) row[3]).doubleValue() * 10.0) / 10.0);
            agent.put("avgCsat", Math.round(((Number) row[4]).doubleValue() * 100.0) / 100.0);
            agent.put("avgFirstResponseMinutes", Math.round(((Number) row[5]).doubleValue() * 10.0) / 10.0);
            agents.add(agent);
        }

        return agents;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getTicketTrends(UUID organizationId, String period) {
        String interval = switch (period != null ? period : "30d") {
            case "7d" -> "7 days";
            case "14d" -> "14 days";
            case "90d" -> "90 days";
            default -> "30 days";
        };

        String sql = """
                    SELECT DATE(created_at) as date,
                           COUNT(*) as total,
                           SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
                           SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count
                    FROM tickets
                    WHERE organization_id = :orgId
                      AND created_at >= NOW() - INTERVAL '%s'
                    GROUP BY DATE(created_at)
                    ORDER BY date ASC
                """.formatted(interval);

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("orgId", organizationId);

        List<Object[]> results = query.getResultList();
        List<Map<String, Object>> trends = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> trend = new HashMap<>();
            trend.put("date", row[0].toString());
            trend.put("total", ((Number) row[1]).longValue());
            trend.put("resolved", ((Number) row[2]).longValue());
            trend.put("open", ((Number) row[3]).longValue());
            trends.add(trend);
        }

        return trends;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getCategoryDistribution(UUID organizationId) {
        String sql = """
                    SELECT COALESCE(category, 'Uncategorized') as category, COUNT(*) as count
                    FROM tickets
                    WHERE organization_id = :orgId
                    GROUP BY category
                    ORDER BY count DESC
                """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("orgId", organizationId);

        List<Object[]> results = query.getResultList();
        List<Map<String, Object>> categories = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> category = new HashMap<>();
            category.put("category", row[0]);
            category.put("count", ((Number) row[1]).longValue());
            categories.add(category);
        }

        return categories;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getSlaCompliance(UUID organizationId) {
        String sql = """
                    SELECT t.priority,
                           COUNT(*) as total_tickets,
                           SUM(CASE WHEN tm.sla_breached = false THEN 1 ELSE 0 END) as compliant,
                           ROUND(SUM(CASE WHEN tm.sla_breached = false THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as compliance_rate
                    FROM ticket_metrics tm
                    JOIN tickets t ON t.id = tm.ticket_id
                    WHERE t.organization_id = :orgId
                    GROUP BY t.priority
                    ORDER BY compliance_rate DESC
                """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("orgId", organizationId);

        List<Object[]> results = query.getResultList();
        List<Map<String, Object>> sla = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("priority", row[0]);
            entry.put("totalTickets", ((Number) row[1]).longValue());
            entry.put("compliant", ((Number) row[2]).longValue());
            entry.put("complianceRate", ((Number) row[3]).doubleValue());
            sla.add(entry);
        }

        return sla;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getTrendingIssues(UUID organizationId) {
        String sql = """
                    WITH daily_counts AS (
                        SELECT DATE(created_at) as date, COALESCE(category, 'Uncategorized') as category, COUNT(*) as count
                        FROM tickets
                        WHERE organization_id = :orgId
                          AND created_at >= NOW() - INTERVAL '14 days'
                        GROUP BY DATE(created_at), category
                    )
                    SELECT category,
                           COALESCE(AVG(CASE WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN count END), 0) as recent_avg,
                           COALESCE(AVG(CASE WHEN date < CURRENT_DATE - INTERVAL '7 days' THEN count END), 0) as prev_avg
                    FROM daily_counts
                    GROUP BY category
                    HAVING COALESCE(AVG(CASE WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN count END), 0) > 0
                    ORDER BY recent_avg DESC
                """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("orgId", organizationId);

        List<Object[]> results = query.getResultList();
        List<Map<String, Object>> trending = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> item = new HashMap<>();
            item.put("category", row[0]);
            item.put("recentAvg", ((Number) row[1]).doubleValue());
            item.put("previousAvg", ((Number) row[2]).doubleValue());
            double recentAvg = ((Number) row[1]).doubleValue();
            double prevAvg = ((Number) row[2]).doubleValue();
            item.put("trend", prevAvg > 0 ? Math.round((recentAvg - prevAvg) / prevAvg * 100) : 100);
            trending.add(item);
        }

        return trending;
    }
}
