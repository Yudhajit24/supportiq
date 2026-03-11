-- ============================================
-- SupportIQ Seed Data
-- ============================================

-- Organizations
INSERT INTO organizations (id, name, slug, plan) VALUES
('11111111-1111-1111-1111-111111111111', 'TechCorp Inc.', 'techcorp', 'enterprise'),
('22222222-2222-2222-2222-222222222222', 'StartupXYZ', 'startupxyz', 'professional'),
('33333333-3333-3333-3333-333333333333', 'GlobalRetail Co.', 'globalretail', 'enterprise');

-- Teams
INSERT INTO teams (id, organization_id, name, description) VALUES
('aaaa0001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'Tier 1 Support', 'First-line customer support'),
('aaaa0002-0002-0002-0002-000000000002', '11111111-1111-1111-1111-111111111111', 'Engineering Support', 'Technical escalations'),
('aaaa0003-0003-0003-0003-000000000003', '22222222-2222-2222-2222-222222222222', 'Support Team', 'General support');

-- Users (password: "password123" - bcrypt hash)
INSERT INTO users (id, organization_id, team_id, email, password_hash, full_name, role) VALUES
('bbbb0001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', NULL, 'admin@techcorp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sarah Chen', 'admin'),
('bbbb0002-0002-0002-0002-000000000002', '11111111-1111-1111-1111-111111111111', 'aaaa0001-0001-0001-0001-000000000001', 'agent1@techcorp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mike Johnson', 'agent'),
('bbbb0003-0003-0003-0003-000000000003', '11111111-1111-1111-1111-111111111111', 'aaaa0001-0001-0001-0001-000000000001', 'agent2@techcorp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Emily Davis', 'agent'),
('bbbb0004-0004-0004-0004-000000000004', '11111111-1111-1111-1111-111111111111', 'aaaa0002-0002-0002-0002-000000000002', 'agent3@techcorp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Alex Rivera', 'agent'),
('bbbb0005-0005-0005-0005-000000000005', '11111111-1111-1111-1111-111111111111', NULL, 'manager@techcorp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lisa Park', 'manager'),
('bbbb0006-0006-0006-0006-000000000006', '22222222-2222-2222-2222-222222222222', NULL, 'admin@startupxyz.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Tom Wilson', 'admin'),
('bbbb0007-0007-0007-0007-000000000007', '22222222-2222-2222-2222-222222222222', 'aaaa0003-0003-0003-0003-000000000003', 'agent@startupxyz.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Jane Smith', 'agent'),
('bbbb0008-0008-0008-0008-000000000008', '22222222-2222-2222-2222-222222222222', 'aaaa0003-0003-0003-0003-000000000003', 'agent2@startupxyz.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'David Brown', 'agent'),
('bbbb0009-0009-0009-0009-000000000009', '33333333-3333-3333-3333-333333333333', NULL, 'admin@globalretail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Karen White', 'admin'),
('bbbb0010-0010-0010-0010-000000000010', '22222222-2222-2222-2222-222222222222', NULL, 'manager@startupxyz.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Robert Lee', 'manager');

-- Customers (50 customers across organizations)
INSERT INTO customers (id, organization_id, email, full_name, phone, company) VALUES
('cccc0001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'john.doe@acme.com', 'John Doe', '+1-555-0101', 'Acme Corp'),
('cccc0002-0002-0002-0002-000000000002', '11111111-1111-1111-1111-111111111111', 'jane.smith@widgets.com', 'Jane Smith', '+1-555-0102', 'Widgets Inc'),
('cccc0003-0003-0003-0003-000000000003', '11111111-1111-1111-1111-111111111111', 'bob.jones@example.com', 'Bob Jones', '+1-555-0103', 'Example LLC'),
('cccc0004-0004-0004-0004-000000000004', '11111111-1111-1111-1111-111111111111', 'alice.brown@company.com', 'Alice Brown', '+1-555-0104', 'Company Co'),
('cccc0005-0005-0005-0005-000000000005', '11111111-1111-1111-1111-111111111111', 'charlie.wilson@firm.com', 'Charlie Wilson', '+1-555-0105', 'The Firm'),
('cccc0006-0006-0006-0006-000000000006', '11111111-1111-1111-1111-111111111111', 'diana.lee@solutions.com', 'Diana Lee', '+1-555-0106', 'Solutions Inc'),
('cccc0007-0007-0007-0007-000000000007', '11111111-1111-1111-1111-111111111111', 'edward.kim@startup.io', 'Edward Kim', '+1-555-0107', 'Startup.io'),
('cccc0008-0008-0008-0008-000000000008', '11111111-1111-1111-1111-111111111111', 'fiona.chen@design.co', 'Fiona Chen', '+1-555-0108', 'Design Co'),
('cccc0009-0009-0009-0009-000000000009', '11111111-1111-1111-1111-111111111111', 'george.martin@labs.com', 'George Martin', '+1-555-0109', 'Labs Inc'),
('cccc0010-0010-0010-0010-000000000010', '11111111-1111-1111-1111-111111111111', 'helen.wang@services.com', 'Helen Wang', '+1-555-0110', 'Services Co'),
('cccc0011-0011-0011-0011-000000000011', '11111111-1111-1111-1111-111111111111', 'ian.taylor@cloud.io', 'Ian Taylor', '+1-555-0111', 'Cloud.io'),
('cccc0012-0012-0012-0012-000000000012', '11111111-1111-1111-1111-111111111111', 'julia.anderson@media.com', 'Julia Anderson', '+1-555-0112', 'Media Corp'),
('cccc0013-0013-0013-0013-000000000013', '11111111-1111-1111-1111-111111111111', 'kevin.thomas@digital.co', 'Kevin Thomas', '+1-555-0113', 'Digital Co'),
('cccc0014-0014-0014-0014-000000000014', '11111111-1111-1111-1111-111111111111', 'laura.jackson@apps.com', 'Laura Jackson', '+1-555-0114', 'Apps Inc'),
('cccc0015-0015-0015-0015-000000000015', '11111111-1111-1111-1111-111111111111', 'matt.white@tech.io', 'Matt White', '+1-555-0115', 'Tech.io'),
('cccc0016-0016-0016-0016-000000000016', '11111111-1111-1111-1111-111111111111', 'nancy.harris@consulting.com', 'Nancy Harris', '+1-555-0116', 'Consulting Group'),
('cccc0017-0017-0017-0017-000000000017', '11111111-1111-1111-1111-111111111111', 'oscar.clark@industries.com', 'Oscar Clark', '+1-555-0117', 'Industries Ltd'),
('cccc0018-0018-0018-0018-000000000018', '11111111-1111-1111-1111-111111111111', 'patricia.lewis@global.com', 'Patricia Lewis', '+1-555-0118', 'Global Inc'),
('cccc0019-0019-0019-0019-000000000019', '11111111-1111-1111-1111-111111111111', 'quinn.robinson@venture.co', 'Quinn Robinson', '+1-555-0119', 'Venture Co'),
('cccc0020-0020-0020-0020-000000000020', '11111111-1111-1111-1111-111111111111', 'rachel.walker@fintech.com', 'Rachel Walker', '+1-555-0120', 'Fintech Corp'),
('cccc0021-0021-0021-0021-000000000021', '22222222-2222-2222-2222-222222222222', 'sam.hall@buyer.com', 'Sam Hall', '+1-555-0121', 'Buyer Inc'),
('cccc0022-0022-0022-0022-000000000022', '22222222-2222-2222-2222-222222222222', 'tina.allen@sales.com', 'Tina Allen', '+1-555-0122', 'Sales Corp'),
('cccc0023-0023-0023-0023-000000000023', '22222222-2222-2222-2222-222222222222', 'ursula.young@market.co', 'Ursula Young', '+1-555-0123', 'Market Co'),
('cccc0024-0024-0024-0024-000000000024', '22222222-2222-2222-2222-222222222222', 'victor.king@brand.com', 'Victor King', '+1-555-0124', 'Brand Inc'),
('cccc0025-0025-0025-0025-000000000025', '22222222-2222-2222-2222-222222222222', 'wendy.wright@shop.io', 'Wendy Wright', '+1-555-0125', 'Shop.io'),
('cccc0026-0026-0026-0026-000000000026', '22222222-2222-2222-2222-222222222222', 'xavier.lopez@retail.com', 'Xavier Lopez', '+1-555-0126', 'Retail Corp'),
('cccc0027-0027-0027-0027-000000000027', '22222222-2222-2222-2222-222222222222', 'yvonne.hill@commerce.co', 'Yvonne Hill', '+1-555-0127', 'Commerce Co'),
('cccc0028-0028-0028-0028-000000000028', '22222222-2222-2222-2222-222222222222', 'zach.scott@trade.com', 'Zach Scott', '+1-555-0128', 'Trade Inc'),
('cccc0029-0029-0029-0029-000000000029', '22222222-2222-2222-2222-222222222222', 'amy.green@biz.com', 'Amy Green', '+1-555-0129', 'Biz Corp'),
('cccc0030-0030-0030-0030-000000000030', '22222222-2222-2222-2222-222222222222', 'brian.adams@corp.io', 'Brian Adams', '+1-555-0130', 'Corp.io'),
('cccc0031-0031-0031-0031-000000000031', '22222222-2222-2222-2222-222222222222', 'carol.baker@mgmt.com', 'Carol Baker', '+1-555-0131', 'Mgmt Group'),
('cccc0032-0032-0032-0032-000000000032', '22222222-2222-2222-2222-222222222222', 'derek.carter@agency.co', 'Derek Carter', '+1-555-0132', 'Agency Co'),
('cccc0033-0033-0033-0033-000000000033', '22222222-2222-2222-2222-222222222222', 'ella.davis@partner.com', 'Ella Davis', '+1-555-0133', 'Partner Inc'),
('cccc0034-0034-0034-0034-000000000034', '22222222-2222-2222-2222-222222222222', 'frank.evans@supply.io', 'Frank Evans', '+1-555-0134', 'Supply.io'),
('cccc0035-0035-0035-0035-000000000035', '22222222-2222-2222-2222-222222222222', 'grace.foster@logistics.com', 'Grace Foster', '+1-555-0135', 'Logistics Corp'),
('cccc0036-0036-0036-0036-000000000036', '33333333-3333-3333-3333-333333333333', 'hank.gibson@warehouse.com', 'Hank Gibson', '+1-555-0136', 'Warehouse Inc'),
('cccc0037-0037-0037-0037-000000000037', '33333333-3333-3333-3333-333333333333', 'iris.hayes@distribution.co', 'Iris Hayes', '+1-555-0137', 'Distribution Co'),
('cccc0038-0038-0038-0038-000000000038', '33333333-3333-3333-3333-333333333333', 'jack.irwin@shipping.com', 'Jack Irwin', '+1-555-0138', 'Shipping Corp'),
('cccc0039-0039-0039-0039-000000000039', '33333333-3333-3333-3333-333333333333', 'kate.james@store.io', 'Kate James', '+1-555-0139', 'Store.io'),
('cccc0040-0040-0040-0040-000000000040', '33333333-3333-3333-3333-333333333333', 'leo.kelly@outlet.com', 'Leo Kelly', '+1-555-0140', 'Outlet Inc'),
('cccc0041-0041-0041-0041-000000000041', '33333333-3333-3333-3333-333333333333', 'maya.larson@mall.co', 'Maya Larson', '+1-555-0141', 'Mall Co'),
('cccc0042-0042-0042-0042-000000000042', '33333333-3333-3333-3333-333333333333', 'nick.morgan@depot.com', 'Nick Morgan', '+1-555-0142', 'Depot Corp'),
('cccc0043-0043-0043-0043-000000000043', '33333333-3333-3333-3333-333333333333', 'olivia.nash@plaza.io', 'Olivia Nash', '+1-555-0143', 'Plaza.io'),
('cccc0044-0044-0044-0044-000000000044', '33333333-3333-3333-3333-333333333333', 'paul.owen@market.com', 'Paul Owen', '+1-555-0144', 'Market Corp'),
('cccc0045-0045-0045-0045-000000000045', '33333333-3333-3333-3333-333333333333', 'ruby.price@bazaar.co', 'Ruby Price', '+1-555-0145', 'Bazaar Co'),
('cccc0046-0046-0046-0046-000000000046', '33333333-3333-3333-3333-333333333333', 'steve.quinn@exchange.com', 'Steve Quinn', '+1-555-0146', 'Exchange Inc'),
('cccc0047-0047-0047-0047-000000000047', '33333333-3333-3333-3333-333333333333', 'tara.reed@catalog.io', 'Tara Reed', '+1-555-0147', 'Catalog.io'),
('cccc0048-0048-0048-0048-000000000048', '33333333-3333-3333-3333-333333333333', 'uma.stone@emporium.com', 'Uma Stone', '+1-555-0148', 'Emporium Corp'),
('cccc0049-0049-0049-0049-000000000049', '33333333-3333-3333-3333-333333333333', 'vince.turner@boutique.co', 'Vince Turner', '+1-555-0149', 'Boutique Co'),
('cccc0050-0050-0050-0050-000000000050', '33333333-3333-3333-3333-333333333333', 'wanda.underwood@shop.com', 'Wanda Underwood', '+1-555-0150', 'Shop Corp');

-- Tickets (200 tickets across organizations - batch 1: TechCorp tickets)
DO $$
DECLARE
    categories TEXT[] := ARRAY['Technical', 'Billing', 'Feature Request', 'Bug Report', 'General'];
    statuses TEXT[] := ARRAY['open', 'in_progress', 'pending', 'resolved', 'closed'];
    priorities TEXT[] := ARRAY['low', 'medium', 'high', 'urgent'];
    sources TEXT[] := ARRAY['web', 'email', 'api', 'chat'];
    subjects TEXT[] := ARRAY[
        'Cannot login to dashboard', 'Billing discrepancy on invoice', 'Feature request: Dark mode',
        'App crashes on file upload', 'How to reset password', 'API rate limit exceeded',
        'Payment failed for subscription', 'Need export to CSV feature', 'Bug: Chart not rendering',
        'General inquiry about pricing', 'SSL certificate expired', 'Refund request for overcharge',
        'Add webhook support', 'Data loss after update', 'Setup help needed',
        'Slow page load times', 'Invoice not received', 'Integration with Slack',
        'Login 2FA not working', 'Account deletion request', 'Memory leak in widget',
        'Upgrade plan confusion', 'Real-time notifications', 'Search not returning results',
        'Getting started guide', 'Database connection timeout', 'Double charged this month',
        'Mobile app support', 'Email notifications broken', 'Team permissions issue',
        'Custom domain setup', 'Tax calculation wrong', 'API documentation unclear',
        'Widget alignment off', 'Training session request', 'Cannot upload large files',
        'Subscription auto-renewed', 'Bulk import feature', 'Reports showing wrong data',
        'Need SLA information', 'CDN caching issue', 'Promo code not applying',
        'OAuth integration help', 'Form validation bug', 'Compliance documentation',
        'Image compression quality', 'Currency conversion off', 'Scheduled reports feature',
        'Dropdown menu broken', 'Partnership inquiry'
    ];
    descriptions TEXT[] := ARRAY[
        'I have been trying to login to my dashboard for the past 30 minutes. Every time I enter my credentials, it shows a spinning loader and then times out. This is extremely frustrating.',
        'My latest invoice shows charges for features I never activated. The premium analytics package is listed but I only have a basic plan. Please correct this immediately.',
        'Our team has been requesting dark mode for months now. The bright white interface causes eye strain during late night shifts. Many of our competitors already offer this.',
        'When I try to upload any file larger than 5MB, the application crashes completely. I have to reload the browser. This happens consistently across Chrome and Firefox.',
        'I forgot my password and the reset link in the email seems to be expired. I have tried requesting a new one multiple times but I am not receiving any emails.',
        'Our automated scripts are hitting the API rate limit. We need either a higher limit or better documentation on how to optimize our API calls.',
        'I tried to renew my subscription but the payment keeps failing. I have updated my card details but it still shows declined. My bank says there is no block.',
        'We need the ability to export our analytics data to CSV format for our internal reporting. Currently, we can only view data in the dashboard.',
        'The analytics chart on the dashboard is not rendering at all since the last update. Just shows a blank white space. Console shows JavaScript errors.',
        'I am interested in upgrading from the free tier. Could you provide details on what each plan includes and any annual discounts available?'
    ];
    org_ids UUID[] := ARRAY['11111111-1111-1111-1111-111111111111'::UUID, '22222222-2222-2222-2222-222222222222'::UUID, '33333333-3333-3333-3333-333333333333'::UUID];
    agent_ids_1 UUID[] := ARRAY['bbbb0002-0002-0002-0002-000000000002'::UUID, 'bbbb0003-0003-0003-0003-000000000003'::UUID, 'bbbb0004-0004-0004-0004-000000000004'::UUID];
    agent_ids_2 UUID[] := ARRAY['bbbb0007-0007-0007-0007-000000000007'::UUID, 'bbbb0008-0008-0008-0008-000000000008'::UUID];
    customer_start INTEGER;
    ticket_id UUID;
    org_id UUID;
    agent_id UUID;
    cust_id UUID;
    i INTEGER;
    status_val TEXT;
    resolved_time TIMESTAMP WITH TIME ZONE;
    created_time TIMESTAMP WITH TIME ZONE;
BEGIN
    FOR i IN 1..200 LOOP
        ticket_id := uuid_generate_v4();
        
        -- Distribute across organizations: 100 TechCorp, 60 StartupXYZ, 40 GlobalRetail
        IF i <= 100 THEN
            org_id := org_ids[1];
            agent_id := agent_ids_1[1 + (i % 3)];
            cust_id := ('cccc00' || LPAD((1 + (i % 20))::TEXT, 2, '0') || '-00' || LPAD((1 + (i % 20))::TEXT, 2, '0') || '-00' || LPAD((1 + (i % 20))::TEXT, 2, '0') || '-00' || LPAD((1 + (i % 20))::TEXT, 2, '0') || '-0000000000' || LPAD((1 + (i % 20))::TEXT, 2, '0'))::UUID;
        ELSIF i <= 160 THEN
            org_id := org_ids[2];
            agent_id := agent_ids_2[1 + (i % 2)];
            cust_id := ('cccc00' || LPAD((21 + ((i - 100) % 15))::TEXT, 2, '0') || '-00' || LPAD((21 + ((i - 100) % 15))::TEXT, 2, '0') || '-00' || LPAD((21 + ((i - 100) % 15))::TEXT, 2, '0') || '-00' || LPAD((21 + ((i - 100) % 15))::TEXT, 2, '0') || '-0000000000' || LPAD((21 + ((i - 100) % 15))::TEXT, 2, '0'))::UUID;
        ELSE
            org_id := org_ids[3];
            agent_id := NULL;
            cust_id := ('cccc00' || LPAD((36 + ((i - 160) % 15))::TEXT, 2, '0') || '-00' || LPAD((36 + ((i - 160) % 15))::TEXT, 2, '0') || '-00' || LPAD((36 + ((i - 160) % 15))::TEXT, 2, '0') || '-00' || LPAD((36 + ((i - 160) % 15))::TEXT, 2, '0') || '-0000000000' || LPAD((36 + ((i - 160) % 15))::TEXT, 2, '0'))::UUID;
        END IF;

        status_val := statuses[1 + (i % 5)];
        created_time := NOW() - (random() * INTERVAL '60 days');
        
        IF status_val IN ('resolved', 'closed') THEN
            resolved_time := created_time + (random() * INTERVAL '5 days');
        ELSE
            resolved_time := NULL;
        END IF;

        INSERT INTO tickets (id, organization_id, customer_id, assigned_to, subject, description, status, priority, category, source, created_at, resolved_at)
        VALUES (
            ticket_id,
            org_id,
            cust_id,
            agent_id,
            subjects[1 + (i % array_length(subjects, 1))],
            descriptions[1 + (i % array_length(descriptions, 1))],
            status_val,
            priorities[1 + (i % 4)],
            categories[1 + (i % 5)],
            sources[1 + (i % 4)],
            created_time,
            resolved_time
        );

        -- Add 2-3 comments per ticket
        INSERT INTO ticket_comments (ticket_id, author_id, customer_id, content, created_at)
        VALUES (ticket_id, NULL, cust_id, 'Hi, I am experiencing this issue and need help resolving it as soon as possible. This is affecting our workflow.', created_time + INTERVAL '1 minute');
        
        IF agent_id IS NOT NULL THEN
            INSERT INTO ticket_comments (ticket_id, author_id, content, created_at)
            VALUES (ticket_id, agent_id, 'Thank you for reaching out. I am looking into this issue right now. Could you please provide some additional details about what you were doing when this occurred?', created_time + INTERVAL '30 minutes');
            
            INSERT INTO ticket_comments (ticket_id, customer_id, content, created_at)
            VALUES (ticket_id, cust_id, 'Sure, I have attached the relevant screenshots. This happens every time I try to perform the action. Let me know if you need anything else.', created_time + INTERVAL '1 hour');
        END IF;

        -- Add ticket metrics
        INSERT INTO ticket_metrics (ticket_id, first_response_time, resolution_time, customer_satisfaction, sla_breached, reply_count, sentiment_score)
        VALUES (
            ticket_id,
            (300 + random() * 7200)::INTEGER,
            CASE WHEN status_val IN ('resolved', 'closed') THEN (3600 + random() * 172800)::INTEGER ELSE NULL END,
            CASE WHEN status_val IN ('resolved', 'closed') THEN (2.0 + random() * 3.0)::DECIMAL(3,2) ELSE NULL END,
            random() < 0.15,
            2 + (random() * 5)::INTEGER,
            (-1.0 + random() * 2.0)::DECIMAL(3,2)
        );
    END LOOP;
END $$;

-- Knowledge Base Articles (20 articles)
INSERT INTO knowledge_base_articles (organization_id, title, content, category, tags, author_id) VALUES
('11111111-1111-1111-1111-111111111111', 'Getting Started with SupportIQ', 'Welcome to SupportIQ! This guide will walk you through the initial setup process. First, configure your organization settings. Then, invite your team members and set up your first support channels.', 'Getting Started', ARRAY['setup', 'onboarding'], 'bbbb0001-0001-0001-0001-000000000001'),
('11111111-1111-1111-1111-111111111111', 'How to Reset Your Password', 'To reset your password: 1. Go to the login page 2. Click "Forgot Password" 3. Enter your email address 4. Check your inbox for the reset link 5. Click the link and enter your new password. Note: Reset links expire after 24 hours.', 'Account', ARRAY['password', 'account', 'security'], 'bbbb0001-0001-0001-0001-000000000001'),
('11111111-1111-1111-1111-111111111111', 'Understanding Ticket Priorities', 'Ticket priorities help your team focus on the most critical issues: LOW - General inquiries, feature requests. MEDIUM - Standard issues affecting workflow. HIGH - Issues causing significant disruption. URGENT - Critical outages or data loss.', 'Tickets', ARRAY['priority', 'workflow'], 'bbbb0005-0005-0005-0005-000000000005'),
('11111111-1111-1111-1111-111111111111', 'Setting Up Email Integration', 'SupportIQ can automatically create tickets from incoming emails. Go to Settings > Integrations > Email and configure your email forwarding rules. Supported providers: Gmail, Outlook, custom SMTP.', 'Integrations', ARRAY['email', 'integration', 'setup'], 'bbbb0001-0001-0001-0001-000000000001'),
('11111111-1111-1111-1111-111111111111', 'API Rate Limits and Best Practices', 'API rate limits: Free plan: 100 requests/hour. Professional: 1000 requests/hour. Enterprise: 10000 requests/hour. Best practices: Use pagination, cache responses, implement exponential backoff.', 'API', ARRAY['api', 'rate-limit', 'best-practices'], 'bbbb0004-0004-0004-0004-000000000004'),
('11111111-1111-1111-1111-111111111111', 'Configuring SLA Policies', 'SLA (Service Level Agreement) policies define response and resolution time targets. Go to Settings > SLA Policies to configure. Defaults: URGENT: 1 hour response, 4 hour resolution. HIGH: 4 hour response, 24 hour resolution.', 'Configuration', ARRAY['sla', 'policy', 'configuration'], 'bbbb0005-0005-0005-0005-000000000005'),
('11111111-1111-1111-1111-111111111111', 'Using the Analytics Dashboard', 'The analytics dashboard provides real-time insights. Key metrics: Total tickets, resolution rate, average response time, customer satisfaction. Use date filters to analyze trends over time.', 'Analytics', ARRAY['analytics', 'dashboard', 'metrics'], 'bbbb0005-0005-0005-0005-000000000005'),
('11111111-1111-1111-1111-111111111111', 'Team Management Guide', 'Create teams to organize your support agents. Go to Settings > Teams. Assign agents to teams for ticket routing. Teams can have their own SLA policies and email addresses.', 'Team', ARRAY['team', 'management', 'agents'], 'bbbb0001-0001-0001-0001-000000000001'),
('11111111-1111-1111-1111-111111111111', 'Ticket Automation Rules', 'Automate ticket routing with rules: Auto-assign based on category. Auto-tag based on keywords. Auto-escalate based on SLA breach. Go to Settings > Automation to configure.', 'Automation', ARRAY['automation', 'rules', 'routing'], 'bbbb0001-0001-0001-0001-000000000001'),
('11111111-1111-1111-1111-111111111111', 'Troubleshooting Login Issues', 'Common login issues: 1. Clear browser cache/cookies 2. Check caps lock 3. Try incognito mode 4. Verify email address 5. Reset password. If issues persist, contact your admin.', 'Troubleshooting', ARRAY['login', 'troubleshooting', 'account'], 'bbbb0002-0002-0002-0002-000000000002'),
('22222222-2222-2222-2222-222222222222', 'Quick Start for New Agents', 'Welcome aboard! As a new agent: 1. Complete your profile 2. Set your availability status 3. Review the knowledge base 4. Start with unassigned tickets 5. Use templates for common responses.', 'Getting Started', ARRAY['agent', 'onboarding', 'quickstart'], 'bbbb0006-0006-0006-0006-000000000006'),
('22222222-2222-2222-2222-222222222222', 'Handling Billing Disputes', 'For billing disputes: 1. Verify the customer account 2. Check transaction history 3. Identify the discrepancy 4. Apply credit/refund if warranted 5. Document the resolution.', 'Billing', ARRAY['billing', 'disputes', 'refund'], 'bbbb0006-0006-0006-0006-000000000006'),
('22222222-2222-2222-2222-222222222222', 'Escalation Procedures', 'When to escalate: 1. Cannot resolve after 24 hours 2. Customer requests manager 3. Data breach suspected 4. Legal implications. Escalate to: Team Lead > Manager > Admin.', 'Procedures', ARRAY['escalation', 'procedures'], 'bbbb0010-0010-0010-0010-000000000010'),
('22222222-2222-2222-2222-222222222222', 'Customer Communication Guidelines', 'Best practices: 1. Respond within SLA timeframe 2. Use the customer name 3. Acknowledge their frustration 4. Provide clear next steps 5. Follow up after resolution.', 'Communication', ARRAY['communication', 'guidelines', 'customer-service'], 'bbbb0010-0010-0010-0010-000000000010'),
('22222222-2222-2222-2222-222222222222', 'Using AI Suggestions', 'SupportIQ AI helps you respond faster: 1. AI auto-categorizes new tickets 2. Sentiment analysis flags frustrated customers 3. Response suggestions provide draft replies 4. Knowledge base search finds relevant articles.', 'AI', ARRAY['ai', 'suggestions', 'automation'], 'bbbb0006-0006-0006-0006-000000000006'),
('33333333-3333-3333-3333-333333333333', 'Returns and Refund Policy', 'Our standard returns policy: Items can be returned within 30 days of purchase. Refunds are processed within 5-7 business days. Original shipping costs are non-refundable unless the item was defective.', 'Returns', ARRAY['returns', 'refund', 'policy'], 'bbbb0009-0009-0009-0009-000000000009'),
('33333333-3333-3333-3333-333333333333', 'Shipping Information', 'Shipping methods: Standard (5-7 days), Express (2-3 days), Overnight (next business day). Free shipping on orders over $50. International shipping available to select countries.', 'Shipping', ARRAY['shipping', 'delivery', 'tracking'], 'bbbb0009-0009-0009-0009-000000000009'),
('33333333-3333-3333-3333-333333333333', 'Product Warranty Guide', 'All products come with a 1-year manufacturer warranty. Extended warranties available for purchase. Coverage includes: manufacturing defects, hardware failures. Not covered: accidental damage, wear and tear.', 'Warranty', ARRAY['warranty', 'coverage', 'claims'], 'bbbb0009-0009-0009-0009-000000000009'),
('33333333-3333-3333-3333-333333333333', 'Order Tracking Help', 'Track your order: 1. Log into your account 2. Go to Order History 3. Click on your order 4. View tracking number 5. Click tracking link for carrier updates. Allow 24 hours for tracking to update after shipment.', 'Orders', ARRAY['tracking', 'orders', 'shipping'], 'bbbb0009-0009-0009-0009-000000000009'),
('33333333-3333-3333-3333-333333333333', 'Size Guide', 'Use our size guide to find the perfect fit. Measure yourself at home using a soft measuring tape. Compare your measurements to our size chart. When in between sizes, we recommend sizing up for comfort.', 'Products', ARRAY['sizing', 'guide', 'products'], 'bbbb0009-0009-0009-0009-000000000009');

-- Generate agent metrics for the past 30 days
DO $$
DECLARE
    agent_ids UUID[] := ARRAY[
        'bbbb0002-0002-0002-0002-000000000002'::UUID,
        'bbbb0003-0003-0003-0003-000000000003'::UUID,
        'bbbb0004-0004-0004-0004-000000000004'::UUID,
        'bbbb0007-0007-0007-0007-000000000007'::UUID,
        'bbbb0008-0008-0008-0008-000000000008'::UUID
    ];
    agent_id UUID;
    d DATE;
BEGIN
    FOREACH agent_id IN ARRAY agent_ids LOOP
        FOR d IN SELECT generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, '1 day')::DATE LOOP
            INSERT INTO agent_metrics (user_id, date, tickets_assigned, tickets_resolved, avg_resolution_time, avg_first_response_time, avg_satisfaction, total_comments)
            VALUES (
                agent_id,
                d,
                (3 + random() * 10)::INTEGER,
                (2 + random() * 8)::INTEGER,
                (1800 + random() * 14400)::INTEGER,
                (300 + random() * 3600)::INTEGER,
                (3.0 + random() * 2.0)::DECIMAL(3,2),
                (10 + random() * 30)::INTEGER
            );
        END LOOP;
    END LOOP;
END $$;

-- Generate organization metrics for the past 30 days
DO $$
DECLARE
    org_ids UUID[] := ARRAY[
        '11111111-1111-1111-1111-111111111111'::UUID,
        '22222222-2222-2222-2222-222222222222'::UUID,
        '33333333-3333-3333-3333-333333333333'::UUID
    ];
    org_id UUID;
    d DATE;
BEGIN
    FOREACH org_id IN ARRAY org_ids LOOP
        FOR d IN SELECT generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, '1 day')::DATE LOOP
            INSERT INTO organization_metrics (organization_id, date, total_tickets, tickets_created, tickets_resolved, tickets_closed, avg_resolution_time, avg_first_response_time, avg_satisfaction, sla_compliance_rate)
            VALUES (
                org_id,
                d,
                (10 + random() * 30)::INTEGER,
                (5 + random() * 15)::INTEGER,
                (3 + random() * 12)::INTEGER,
                (2 + random() * 8)::INTEGER,
                (3600 + random() * 28800)::INTEGER,
                (300 + random() * 3600)::INTEGER,
                (3.0 + random() * 2.0)::DECIMAL(3,2),
                (70 + random() * 30)::DECIMAL(5,2)
            );
        END LOOP;
    END LOOP;
END $$;
