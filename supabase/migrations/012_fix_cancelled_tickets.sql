-- Fix existing inconsistency: invalidate tickets for cancelled/refunded orders
UPDATE tickets
SET is_used = true
WHERE order_id IN (
  SELECT id FROM orders WHERE status IN ('cancelled', 'refunded')
)
AND is_used = false;
