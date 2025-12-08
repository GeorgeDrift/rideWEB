ALTER TABLE "Rides" DROP CONSTRAINT IF EXISTS "Rides_status_check";
ALTER TABLE "Rides" ADD CONSTRAINT "Rides_status_check" CHECK (status IN (
    'Pending', 'Scheduled', 'Inbound', 'Arrived', 'Boarded', 
    'In Progress', 'Payment Due', 'Completed', 'Cancelled', 
    'Handover Pending', 'Active', 'Payment Pending'
));
