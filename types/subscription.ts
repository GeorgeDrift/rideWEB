// Subscription related type definitions

export interface SubscriptionPlan {
    id: string;
    name: string;
    description?: string;
    pricePerMonth: number; // in local currency cents
    features?: string[];
}

export interface Subscription {
    id: string;
    vehicleId: string;
    driverId: string;
    planId: string;
    startDate: string; // ISO date string
    endDate?: string; // optional for ongoing subscriptions
    status: 'active' | 'paused' | 'canceled' | 'expired';
    // optional fields for UI display
    plan?: SubscriptionPlan;
}
