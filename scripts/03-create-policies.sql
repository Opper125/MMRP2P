-- Creating Row Level Security policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_analytics ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "VIP users can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'VIP'
        )
    );

-- Products policies
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin and VIP users can create products" ON products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'VIP')
        )
    );

CREATE POLICY "Product owners can update their products" ON products
    FOR UPDATE USING (owner_id = auth.uid());

-- Payment methods policies
CREATE POLICY "Users can manage their payment methods" ON payment_methods
    FOR ALL USING (user_id = auth.uid());

-- Orders policies
CREATE POLICY "Users can view their orders" ON orders
    FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Buyers can create orders" ON orders
    FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Sellers can update order status" ON orders
    FOR UPDATE USING (seller_id = auth.uid());

-- News policies
CREATE POLICY "Anyone can view active news" ON news
    FOR SELECT USING (is_active = true);

CREATE POLICY "VIP users can create news" ON news
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'VIP'
        )
    );

CREATE POLICY "News authors can update their articles" ON news
    FOR UPDATE USING (author_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- Sales analytics policies
CREATE POLICY "Users can view their analytics" ON sales_analytics
    FOR SELECT USING (user_id = auth.uid());
