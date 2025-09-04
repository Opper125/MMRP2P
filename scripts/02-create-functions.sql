-- Creating database functions and triggers

-- Function to generate target numbers for products
CREATE OR REPLACE FUNCTION generate_target_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number INTEGER;
    target_num VARCHAR(20);
BEGIN
    -- Get the next sequential number
    SELECT COALESCE(MAX(CAST(SUBSTRING(target_number FROM 2) AS INTEGER)), 0) + 1
    INTO next_number
    FROM products;
    
    -- Format as #00000001
    target_num := '#' || LPAD(next_number::TEXT, 8, '0');
    
    NEW.target_number := target_num;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating target numbers
CREATE TRIGGER trigger_generate_target_number
    BEFORE INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION generate_target_number();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number INTEGER;
    order_num VARCHAR(50);
BEGIN
    -- Get the next sequential number for orders
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 6) AS INTEGER)), 0) + 1
    INTO next_number
    FROM orders;
    
    -- Format as OPPER219990027
    order_num := 'OPPER' || LPAD(next_number::TEXT, 9, '0');
    
    NEW.order_number := order_num;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating order numbers
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Function to update sales analytics
CREATE OR REPLACE FUNCTION update_sales_analytics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- New product listed
        INSERT INTO sales_analytics (user_id, date, products_listed)
        VALUES (NEW.owner_id, CURRENT_DATE, 1)
        ON CONFLICT (user_id, date)
        DO UPDATE SET products_listed = sales_analytics.products_listed + 1;
        
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        -- Order status changed
        IF NEW.status = 'approved' THEN
            INSERT INTO sales_analytics (user_id, date, products_sold, total_revenue)
            VALUES (NEW.seller_id, CURRENT_DATE, 1, NEW.total_amount)
            ON CONFLICT (user_id, date)
            DO UPDATE SET 
                products_sold = sales_analytics.products_sold + 1,
                total_revenue = sales_analytics.total_revenue + NEW.total_amount;
                
        ELSIF NEW.status = 'rejected' THEN
            INSERT INTO sales_analytics (user_id, date, products_rejected)
            VALUES (NEW.seller_id, CURRENT_DATE, 1)
            ON CONFLICT (user_id, date)
            DO UPDATE SET products_rejected = sales_analytics.products_rejected + 1;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for sales analytics
CREATE TRIGGER trigger_product_analytics
    AFTER INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_sales_analytics();

CREATE TRIGGER trigger_order_analytics
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_sales_analytics();
