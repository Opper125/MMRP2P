-- Inserting sample data for testing

-- Insert sample VIP user
INSERT INTO users (name, username, email, password, role) VALUES
('VIP Admin', 'vipadmin', 'vip@example.com', 'password123', 'VIP'),
('Test Admin', 'testadmin', 'admin@example.com', 'password123', 'admin'),
('Regular User', 'testuser', 'user@example.com', 'password123', 'users');

-- Insert sample payment methods
INSERT INTO payment_methods (user_id, payment_name, address, description) VALUES
((SELECT id FROM users WHERE username = 'testadmin'), 'KBZ Pay', '09123456789', 'Mobile payment via KBZ Pay'),
((SELECT id FROM users WHERE username = 'testadmin'), 'Wave Money', '09987654321', 'Mobile payment via Wave Money');

-- Insert sample products
INSERT INTO products (owner_id, name, description, price, contact_platform, contact_info) VALUES
((SELECT id FROM users WHERE username = 'testadmin'), 'Sample Product 1', 'This is a sample product for testing', 99.99, 'Telegram', '@testuser'),
((SELECT id FROM users WHERE username = 'testadmin'), 'Sample Product 2', 'Another sample product', 149.99, 'Viber', '09123456789');
