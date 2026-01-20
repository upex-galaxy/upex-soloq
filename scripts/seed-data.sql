-- ============================================
-- SoloQ - Seed Data Script
-- ============================================
-- IMPORTANTE: Este script requiere un user_id válido de auth.users
-- Reemplaza 'YOUR_USER_ID_HERE' con el UUID del usuario registrado
--
-- Para obtener tu user_id:
-- 1. Regístrate en la aplicación
-- 2. Ve a Supabase Dashboard > Authentication > Users
-- 3. Copia el UUID del usuario
--
-- Ejecutar con: supabase db execute --file scripts/seed-data.sql
-- O directamente en el SQL Editor de Supabase Dashboard
-- ============================================

-- Variable para el user_id (reemplazar antes de ejecutar)
DO $$
DECLARE
    v_user_id UUID := 'YOUR_USER_ID_HERE'; -- ⚠️ REEMPLAZAR CON TU USER_ID
    v_client_1_id UUID;
    v_client_2_id UUID;
    v_client_3_id UUID;
    v_invoice_1_id UUID;
    v_invoice_2_id UUID;
    v_invoice_3_id UUID;
    v_invoice_4_id UUID;
    v_invoice_5_id UUID;
BEGIN
    -- ============================================
    -- Business Profile (Carlos - Diseñador Freelance)
    -- ============================================
    INSERT INTO business_profiles (
        user_id,
        business_name,
        tax_id,
        address,
        contact_email,
        contact_phone
    ) VALUES (
        v_user_id,
        'Carlos Mendoza Diseño',
        'MEDC850101ABC',
        'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX, México',
        'carlos@mendozadiseno.com',
        '+52 55 1234 5678'
    ) ON CONFLICT (user_id) DO UPDATE SET
        business_name = EXCLUDED.business_name,
        tax_id = EXCLUDED.tax_id,
        address = EXCLUDED.address,
        contact_email = EXCLUDED.contact_email,
        contact_phone = EXCLUDED.contact_phone;

    -- ============================================
    -- Payment Methods
    -- ============================================
    INSERT INTO payment_methods (user_id, type, label, value, is_default, sort_order) VALUES
    (v_user_id, 'bank_transfer', 'BBVA México', 'CLABE: 012180001234567890 | Cuenta: 1234567890', true, 1),
    (v_user_id, 'paypal', 'PayPal Personal', 'carlos@mendozadiseno.com', false, 2),
    (v_user_id, 'mercado_pago', 'Mercado Pago', 'carlos.mendoza.mp', false, 3);

    -- ============================================
    -- Clients
    -- ============================================
    INSERT INTO clients (id, user_id, name, email, company, phone, address, tax_id, notes)
    VALUES (gen_random_uuid(), v_user_id, 'Ana García', 'ana.garcia@techstartup.mx', 'TechStartup MX', '+52 55 9876 5432', 'Polanco, CDMX', 'GARA900515XYZ', 'Cliente recurrente, prefiere facturas en USD')
    RETURNING id INTO v_client_1_id;

    INSERT INTO clients (id, user_id, name, email, company, phone, address, tax_id, notes)
    VALUES (gen_random_uuid(), v_user_id, 'Roberto Sánchez', 'roberto@agenciaweb.com', 'Agencia Web Pro', '+52 33 1122 3344', 'Guadalajara, Jalisco', 'SANR880220ABC', 'Proyectos grandes, pago a 30 días')
    RETURNING id INTO v_client_2_id;

    INSERT INTO clients (id, user_id, name, email, company, phone, address, tax_id, notes)
    VALUES (gen_random_uuid(), v_user_id, 'María López', 'maria@freelance.com', NULL, '+52 81 5566 7788', 'Monterrey, NL', NULL, 'Freelancer, proyectos pequeños')
    RETURNING id INTO v_client_3_id;

    -- ============================================
    -- Invoices
    -- ============================================

    -- Invoice 1: Pagada (TechStartup MX)
    INSERT INTO invoices (
        id, user_id, client_id, invoice_number, status,
        issue_date, due_date, currency,
        subtotal, tax_rate, tax_amount, total,
        notes, sent_at, paid_at
    ) VALUES (
        gen_random_uuid(), v_user_id, v_client_1_id, 'INV-2026-001', 'paid',
        '2026-01-05', '2026-01-20', 'MXN',
        15000.00, 16.00, 2400.00, 17400.00,
        'Diseño de landing page para campaña Q1',
        '2026-01-05 10:00:00', '2026-01-15 14:30:00'
    ) RETURNING id INTO v_invoice_1_id;

    -- Invoice 2: Enviada, pendiente (Agencia Web Pro)
    INSERT INTO invoices (
        id, user_id, client_id, invoice_number, status,
        issue_date, due_date, currency,
        subtotal, tax_rate, tax_amount, discount_type, discount_value, total,
        notes, sent_at
    ) VALUES (
        gen_random_uuid(), v_user_id, v_client_2_id, 'INV-2026-002', 'sent',
        '2026-01-10', '2026-02-09', 'MXN',
        45000.00, 16.00, 7200.00, 'percentage', 10.00, 46800.00,
        'Rediseño completo de sitio web corporativo - Fase 1',
        '2026-01-10 09:00:00'
    ) RETURNING id INTO v_invoice_2_id;

    -- Invoice 3: Vencida (María López)
    INSERT INTO invoices (
        id, user_id, client_id, invoice_number, status,
        issue_date, due_date, currency,
        subtotal, tax_rate, tax_amount, total,
        notes, sent_at, reminder_count
    ) VALUES (
        gen_random_uuid(), v_user_id, v_client_3_id, 'INV-2025-015', 'overdue',
        '2025-12-01', '2025-12-31', 'MXN',
        5000.00, 16.00, 800.00, 5800.00,
        'Diseño de logo y tarjetas de presentación',
        '2025-12-01 11:00:00', 2
    ) RETURNING id INTO v_invoice_3_id;

    -- Invoice 4: Borrador (TechStartup MX)
    INSERT INTO invoices (
        id, user_id, client_id, invoice_number, status,
        issue_date, due_date, currency,
        subtotal, tax_rate, tax_amount, total,
        notes
    ) VALUES (
        gen_random_uuid(), v_user_id, v_client_1_id, 'INV-2026-003', 'draft',
        '2026-01-20', '2026-02-04', 'USD',
        2500.00, 0.00, 0.00, 2500.00,
        'Diseño de app móvil - Wireframes'
    ) RETURNING id INTO v_invoice_4_id;

    -- Invoice 5: Enviada (Agencia Web Pro)
    INSERT INTO invoices (
        id, user_id, client_id, invoice_number, status,
        issue_date, due_date, currency,
        subtotal, tax_rate, tax_amount, total,
        notes, sent_at
    ) VALUES (
        gen_random_uuid(), v_user_id, v_client_2_id, 'INV-2026-004', 'sent',
        '2026-01-18', '2026-02-17', 'MXN',
        28000.00, 16.00, 4480.00, 32480.00,
        'Mantenimiento mensual + nuevas funcionalidades',
        '2026-01-18 16:00:00'
    ) RETURNING id INTO v_invoice_5_id;

    -- ============================================
    -- Invoice Items
    -- ============================================

    -- Items para Invoice 1 (Landing page)
    INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, subtotal, sort_order) VALUES
    (v_invoice_1_id, 'Diseño UI/UX de landing page', 1, 8000.00, 8000.00, 1),
    (v_invoice_1_id, 'Desarrollo HTML/CSS responsive', 1, 5000.00, 5000.00, 2),
    (v_invoice_1_id, 'Optimización SEO básica', 1, 2000.00, 2000.00, 3);

    -- Items para Invoice 2 (Rediseño web)
    INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, subtotal, sort_order) VALUES
    (v_invoice_2_id, 'Auditoría UX del sitio actual', 1, 8000.00, 8000.00, 1),
    (v_invoice_2_id, 'Diseño de wireframes (12 páginas)', 12, 1500.00, 18000.00, 2),
    (v_invoice_2_id, 'Diseño visual high-fidelity', 12, 1500.00, 18000.00, 3),
    (v_invoice_2_id, 'Revisiones y ajustes', 1, 1000.00, 1000.00, 4);

    -- Items para Invoice 3 (Logo)
    INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, subtotal, sort_order) VALUES
    (v_invoice_3_id, 'Diseño de logotipo (3 propuestas)', 1, 3500.00, 3500.00, 1),
    (v_invoice_3_id, 'Tarjetas de presentación (diseño)', 1, 1500.00, 1500.00, 2);

    -- Items para Invoice 4 (Wireframes app)
    INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, subtotal, sort_order) VALUES
    (v_invoice_4_id, 'Wireframes de app móvil (20 pantallas)', 20, 100.00, 2000.00, 1),
    (v_invoice_4_id, 'Flujo de navegación documentado', 1, 500.00, 500.00, 2);

    -- Items para Invoice 5 (Mantenimiento)
    INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, subtotal, sort_order) VALUES
    (v_invoice_5_id, 'Mantenimiento mensual (Enero 2026)', 1, 15000.00, 15000.00, 1),
    (v_invoice_5_id, 'Nueva sección de blog', 1, 8000.00, 8000.00, 2),
    (v_invoice_5_id, 'Integración con CRM', 5, 1000.00, 5000.00, 3);

    -- ============================================
    -- Payments (solo para facturas pagadas)
    -- ============================================
    INSERT INTO payments (invoice_id, amount_received, payment_date, payment_method, reference, notes) VALUES
    (v_invoice_1_id, 17400.00, '2026-01-15', 'Transferencia BBVA', 'REF-20260115-001', 'Pago completo recibido');

    -- ============================================
    -- Invoice Events (audit trail)
    -- ============================================

    -- Events para Invoice 1
    INSERT INTO invoice_events (invoice_id, event_type, metadata, created_at) VALUES
    (v_invoice_1_id, 'created', '{"source": "web"}', '2026-01-05 09:00:00'),
    (v_invoice_1_id, 'sent', '{"email": "ana.garcia@techstartup.mx"}', '2026-01-05 10:00:00'),
    (v_invoice_1_id, 'viewed', '{"ip": "189.XXX.XXX.XXX"}', '2026-01-05 14:23:00'),
    (v_invoice_1_id, 'paid', '{"method": "bank_transfer", "amount": 17400.00}', '2026-01-15 14:30:00');

    -- Events para Invoice 2
    INSERT INTO invoice_events (invoice_id, event_type, metadata, created_at) VALUES
    (v_invoice_2_id, 'created', '{"source": "web"}', '2026-01-10 08:30:00'),
    (v_invoice_2_id, 'sent', '{"email": "roberto@agenciaweb.com"}', '2026-01-10 09:00:00'),
    (v_invoice_2_id, 'viewed', '{"ip": "201.XXX.XXX.XXX"}', '2026-01-10 11:45:00');

    -- Events para Invoice 3
    INSERT INTO invoice_events (invoice_id, event_type, metadata, created_at) VALUES
    (v_invoice_3_id, 'created', '{"source": "web"}', '2025-12-01 10:00:00'),
    (v_invoice_3_id, 'sent', '{"email": "maria@freelance.com"}', '2025-12-01 11:00:00'),
    (v_invoice_3_id, 'reminder_sent', '{"reminder_number": 1}', '2026-01-01 09:00:00'),
    (v_invoice_3_id, 'reminder_sent', '{"reminder_number": 2}', '2026-01-08 09:00:00');

    -- Events para Invoice 4
    INSERT INTO invoice_events (invoice_id, event_type, metadata, created_at) VALUES
    (v_invoice_4_id, 'created', '{"source": "web"}', '2026-01-20 15:00:00');

    -- Events para Invoice 5
    INSERT INTO invoice_events (invoice_id, event_type, metadata, created_at) VALUES
    (v_invoice_5_id, 'created', '{"source": "web"}', '2026-01-18 15:30:00'),
    (v_invoice_5_id, 'sent', '{"email": "roberto@agenciaweb.com"}', '2026-01-18 16:00:00');

    -- ============================================
    -- Update reminder_settings
    -- ============================================
    UPDATE reminder_settings SET
        enabled = true,
        frequency_days = 7,
        max_reminders = 3,
        custom_subject = 'Recordatorio: Factura {{invoice_number}} pendiente',
        custom_message = 'Hola {{client_name}}, te recordamos que la factura {{invoice_number}} por {{total}} {{currency}} tiene fecha de vencimiento {{due_date}}. Por favor realiza el pago a la brevedad.'
    WHERE user_id = v_user_id;

    RAISE NOTICE 'Seed data inserted successfully for user: %', v_user_id;
END $$;
