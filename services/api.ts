
import { Driver, Ride, Rider, View } from '../types';
import React from 'react';

// Types needed for the API data that weren't in the global types yet
export interface SearchResult {
    id: string;
    label: string;
    subLabel: string;
    view: View;
    icon?: React.ReactNode; // Note: In a real API, this would be a string identifier for the icon
    keywords?: string[];
}

export interface PricingZone {
    id: number;
    name: string;
    multiplier: number;
    color: string;
    coordinates: number[][];
}

export interface Transaction {
    id: string;
    source: string;
    date: string;
    amount: number;
    status: 'Completed' | 'Pending' | 'Processed';
}

export interface DriverTransaction {
    id: number;
    type: string;
    desc: string;
    date: string;
    amount: number;
    method: string;
    sub: string;
}

export interface DriverNotification {
    id: number;
    title: string;
    msg: string;
    time: string;
    unread: boolean;
}

export interface VehicleCategory {
    title: string;
    icon: string;
    count: number;
    available: number;
    examples: string[];
    stats: {
        activeRentals: number;
        growth: number;
        revenue: number;
        avgRate: number;
        chartData: { day: string; value: number }[];
    };
}

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'agent';
    timestamp: string;
}

export interface Conversation {
    id: string;
    name: string;
    avatar: string;
    role: 'Driver' | 'Rider' | 'Admin';
    lastMessage: string;
    time: string;
    unread: number;
    status: 'online' | 'offline';
    messages: Message[];
    participants?: string[];
}

export interface DriverVehicle {
    id: number;
    name: string;
    plate: string;
    status: string;
    category?: string;
    rate?: string;
}

export interface DriverRidePost {
    id: number;
    origin: string;
    destination: string;
    date: string;
    time: string;
    price: number;
    seats: number;
    driverName?: string; // Added for Rider View
    driverRating?: number; // Added for Rider View
    negotiable?: boolean;
    minPrice?: number;
    maxPrice?: number;
    type?: 'share' | 'hire';
}

export interface DriverHirePost {
    id: number;
    title: string;
    category: string;
    location: string;
    rate: string;
    status: string;
    driverName?: string; // Added for Rider View
    driverRating?: number; // Added for Rider View
    vehicleImage?: string;
}

export interface DriverContractedJob {
    id: number;
    title: string;
    origin: string;
    destination: string;
    date: string;
    payout: number;
    status: string;
    type: string;
    clientName?: string;
    clientId?: string;
}

// --- PAYMENT FLOW INTERFACES ---
export interface DriverPayoutDetails {
    driverId: string;
    driverName: string;
    payoutMethod: 'Bank' | 'Airtel Money' | 'Mpamba';
    payoutAccountNumber?: string; // For Bank
    payoutMobileNumber?: string; // For Airtel Money / Mpamba
    bankName?: string;
    accountHolderName?: string;
}

export interface MobileMoneyOperator {
    id: number;
    name: string;
    ref_id: string;
    short_code: string;
    supports_withdrawals: boolean;
    logo: string | null;
}

export interface PaymentInitiationRequest {
    rideId: number;
    amount: number;
    mobileNumber: string;
    providerRefId: string;
}

export interface PaymentInitiationResponse {
    status: 'success' | 'error';
    message: string;
    data?: {
        charge_id: string;
        status: string;
        amount: number;
    };
}

export interface PaymentVerificationResponse {
    status: 'success' | 'pending' | 'failed';
    data?: {
        charge_id: string;
        status: string;
        amount: number;
    };
}




// --- ApiService ---
export const ApiService = {
    login: async (email: string, password: string): Promise<any> => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        return data.user;
    },

    getSearchItems: (): SearchResult[] => [
        { id: 'dash', label: 'Dashboard', subLabel: 'Overview', view: 'dashboard', keywords: ['analytics', 'home'] },
        { id: 'rides', label: 'Rides', subLabel: 'Manage Rides', view: 'rides', keywords: ['trips', 'history'] },
        { id: 'drivers', label: 'Drivers', subLabel: 'Manage Drivers', view: 'drivers', keywords: ['staff', 'partners'] },
        { id: 'riders', label: 'Riders', subLabel: 'Manage Riders', view: 'riders', keywords: ['users', 'customers'] },
        { id: 'rev', label: 'Revenue', subLabel: 'Financials', view: 'revenue', keywords: ['money', 'profit'] },
        { id: 'pricing', label: 'Pricing', subLabel: 'Settings', view: 'pricing', keywords: ['rates', 'surge'] },
    ],

    searchVehicles: async (query: string): Promise<any[]> => {
        return [];
    },

    getDashboardData: async (): Promise<any> => {
        try {
            const response = await fetch('/api/admin/dashboard', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch dashboard data');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { weekly: [], lastWeek: [], monthly: [], mapVehicles: [] };
        }
    },

    getRides: async (): Promise<Ride[]> => {
        try {
            const response = await fetch('/api/rides', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch rides');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },

    updateRideStatus: async (rideId: string | number, status: string) => {
        const response = await fetch(`/api/rides/${rideId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Failed to update ride status');
        return await response.json();
    },

    getDrivers: async (): Promise<Driver[]> => {
        try {
            const response = await fetch('/api/driver/list', { // Assuming admin endpoint
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch drivers');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },

    getRiders: async (): Promise<Rider[]> => {
        try {
            const response = await fetch('/api/rider/list', { // Assuming admin endpoint
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch riders');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },
    getRevenueData: async () => {
        try {
            const response = await fetch('/api/admin/revenue', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch revenue data');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return { annual: [], transactions: [] };
        }
    },

    getPricingZones: async (): Promise<PricingZone[]> => {
        try {
            const response = await fetch('/api/admin/zones', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch pricing zones');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },

    getTotalRidesData: async () => {
        try {
            const response = await fetch('/api/admin/stats/rides', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch total rides data');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return { weekly: [], monthly: [], yearly: [] };
        }
    },

    getRideShareData: async () => {
        try {
            const response = await fetch('/api/admin/stats/share', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch ride share data');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return { weekly: [], monthly: [] };
        }
    },

    getForHireData: async () => {
        try {
            const response = await fetch('/api/admin/stats/hire', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch for hire data');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return { weekly: [], monthly: [], categories: [] };
        }
    },
    // --- Conversation API ---
    createConversation: async (recipientId: string): Promise<Conversation> => {
        try {
            const response = await fetch('/api/chat/conversations', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ recipientId })
            });
            if (!response.ok) throw new Error('Failed to create conversation');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    getConversations: async (): Promise<Conversation[]> => {
        try {
            const response = await fetch('/api/chat/conversations', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch conversations');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },

    getMapVehicles: async () => {
        try {
            const response = await fetch('/api/map/vehicles', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch map vehicles');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },

    getDriverProfile: async () => {
        try {
            const response = await fetch('/api/driver/profile', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch driver profile');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return { name: "", avatar: "", rating: 0, role: "" };
        }
    },

    getDriverNotifications: async (): Promise<DriverNotification[]> => {
        try {
            const response = await fetch('/api/driver/notifications', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch notifications');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    // Driver helpers
    getDriverVehicles: async (): Promise<DriverVehicle[]> => {
        try {
            const response = await fetch('/api/driver/vehicles', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch vehicles');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    getDriverConversations: async (): Promise<Conversation[]> => {
        try {
            const response = await fetch('/api/chat/conversations', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch driver conversations');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    getDriverActivePosts: async (): Promise<DriverRidePost[]> => {
        try {
            const response = await fetch('/api/driver/posts/share', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch active posts');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    getDriverHirePosts: async (): Promise<DriverHirePost[]> => {
        try {
            const response = await fetch('/api/driver/posts/hire', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch hire posts');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    getDriverContractedJobs: async (): Promise<DriverContractedJob[]> => {
        try {
            const response = await fetch('/api/driver/jobs', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch contracted jobs');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    addDriverSharePost: async (postData: any) => {
        const response = await fetch('/api/driver/posts/share', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        if (!response.ok) throw new Error('Failed to create share post');
        return await response.json();
    },

    createManualJob: async (jobData: any) => {
        const response = await fetch('/api/driver/jobs', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobData)
        });
        if (!response.ok) throw new Error('Failed to create manual job');
        return await response.json();
    },

    addDriverHirePost: async (postData: any) => {
        const response = await fetch('/api/driver/posts/hire', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        if (!response.ok) throw new Error('Failed to create hire post');
        return await response.json();
    },

    addVehicle: async (vehicleData: any) => {
        const response = await fetch('/api/driver/vehicles', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vehicleData)
        });
        if (!response.ok) throw new Error('Failed to add vehicle');
        return await response.json();
    },

    // --- DRIVER ANALYTICS ---
    getDriverProfitStats: async () => {
        try {
            const response = await fetch('/api/driver/stats/profit', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch profit stats');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { Weekly: [], Monthly: [], Yearly: [] };
        }
    },

    getDriverTripHistoryStats: async () => {
        try {
            const response = await fetch('/api/driver/stats/trips', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch trip history stats');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    getDriverDistanceStats: async () => {
        try {
            const response = await fetch('/api/driver/stats/distance', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch distance stats');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    getDriverHoursStats: async () => {
        try {
            const response = await fetch('/api/driver/stats/hours', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch hours stats');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    getDriverOnTimeStats: async () => {
        try {
            const response = await fetch('/api/driver/stats/ontime', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch on-time stats');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    getDriverStats: async () => {
        try {
            const response = await fetch('/api/driver/stats', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch driver stats');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { totalEarnings: 0, count: 0, avgRating: 5 };
        }
    },

    getRiderProfile: async () => {
        try {
            const response = await fetch('/api/rider/profile', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch rider profile');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return { name: "", avatar: "", rating: 0 };
        }
    },

    getRiderStats: async () => {
        try {
            const response = await fetch('/api/rider/stats', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch rider stats');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return { totalSpend: 0, totalRides: 0, totalDistance: 0, chartData: [], rideTypes: [] };
        }
    },

    getRiderHistory: async () => {
        try {
            const response = await fetch('/api/rider/history', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch rider history');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },

    getAllRideSharePosts: async (): Promise<DriverRidePost[]> => {
        try {
            const response = await fetch('/api/rider/marketplace/share', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch ride share posts');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },

    getAllForHirePosts: async (): Promise<DriverHirePost[]> => {
        try {
            // Backend rider marketplace route for hire listings
            const response = await fetch('/api/rider/marketplace/hire', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch for hire posts');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },

    // --- PAYMENT FLOW API FUNCTIONS ---
    /**
     * Fetch driver payout details from backend
     */


    /**
     * Get available mobile money operators from PayChangu
     */
    getMobileMoneyOperators: async (): Promise<MobileMoneyOperator[]> => {
        try {
            const response = await fetch('/api/payment/operators', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch mobile money operators');
            }

            const data = await response.json();
            return data.operators || [];
        } catch (error) {
            console.error('Error fetching mobile money operators:', error);
            return [];
        }
    },

    /**
     * Initiate payment via PayChangu
     */
    initiatePayment: async (paymentData: PaymentInitiationRequest): Promise<PaymentInitiationResponse> => {
        try {
            const response = await fetch('/api/payment/initiate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Payment initiation failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Error initiating payment:', error);
            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'Payment initiation failed'
            };
        }
    },

    /**
     * Verify payment status
     */
    verifyPayment: async (chargeId: string): Promise<PaymentVerificationResponse> => {
        try {
            const response = await fetch(`/api/payment/verify/${chargeId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Payment verification failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Error verifying payment:', error);
            return {
                status: 'failed'
            };
        }
    },

    getRiderConversations: async (): Promise<Conversation[]> => {
        try {
            const response = await fetch('/api/chat/conversations', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch rider conversations');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    getRiderTransactions: async (): Promise<Transaction[]> => {
        try {
            const response = await fetch('/api/rider/transactions', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch rider transactions');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    getDriverTransactions: async (): Promise<DriverTransaction[]> => {
        try {
            const response = await fetch('/api/driver/transactions', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to fetch driver transactions');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    // --- Negotiation Workflow APIs ---
    searchRideShareVehicles: async (pickupLocation: string, destination: string): Promise<SearchResult[] | any> => {
        const response = await fetch(
            `/api/rider/rideshare/search?pickupLocation=${encodeURIComponent(pickupLocation)}&destination=${encodeURIComponent(destination)}`,
            { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
        );
        if (!response.ok) throw new Error('Failed to search vehicles');
        return await response.json();
    },

    submitRideRequest: async (requestData: any) => {
        const response = await fetch('/api/rider/rideshare/request', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        if (!response.ok) throw new Error('Failed to submit ride request');
        return await response.json();
    },

    submitHireRequest: async (requestData: any) => {
        const response = await fetch('/api/rider/hire/request', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        if (!response.ok) throw new Error('Failed to submit hire request');
        return await response.json();
    },

    makeCounterOffer: async (rideId: string, offerData: { offeredPrice: number; message: string }) => {
        const response = await fetch(`/api/rider/rides/${rideId}/negotiate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(offerData)
        });
        if (!response.ok) throw new Error('Failed to make counter offer');
        return await response.json();
    },

    getPendingRequests: async () => {
        const response = await fetch('/api/rider/requests/pending', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch pending requests');
        return await response.json();
    },

    // --- Driver Approval APIs ---
    getDriverPendingApprovals: async () => {
        const response = await fetch('/api/driver/requests/pending', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch pending approvals');
        return await response.json();
    },

    approveRequest: async (requestId: string, approvalData: { approved: boolean; counterOffer?: number; message?: string }) => {
        const response = await fetch(`/api/driver/requests/${requestId}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(approvalData)
        });
        if (!response.ok) throw new Error('Failed to approve/reject request');
        return await response.json();
    },

    makeDriverCounterOffer: async (requestId: string, offerData: { counterPrice: number; message: string }) => {
        const response = await fetch(`/api/driver/requests/${requestId}/counter-offer`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(offerData)
        });
        if (!response.ok) throw new Error('Failed to make counter offer');
        return await response.json();
    },

    cancelRide: async (rideId: string) => {
        const response = await fetch(`/api/rides/${rideId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'Cancelled' })
        });
        if (!response.ok) throw new Error('Failed to cancel ride');
        return await response.json();
    },

    selectPaymentMethod: async (rideId: string, paymentType: 'online' | 'physical' | 'later') => {
        const response = await fetch(`/api/rides/${rideId}/payment-method`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paymentType })
        });
        if (!response.ok) throw new Error('Failed to end trip');
        return await response.json();
    },

    confirmPickup: async (rideId: string) => {
        const response = await fetch(`/api/rides/${rideId}/confirm-pickup`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to confirm pickup');
        return await response.json();
    },

    confirmHandover: async (rideId: string) => {
        const response = await fetch(`/api/rides/${rideId}/confirm-handover`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to confirm handover');
        return await response.json();
    },

    completeHandover: async (rideId: string, paymentMethod: string) => {
        const response = await fetch(`/api/rides/${rideId}/complete-handover`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paymentMethod })
        });
        if (!response.ok) throw new Error('Failed to complete handover');
        return await response.json();
    },

    requestVehicleReturn: async (rideId: string) => {
        const response = await fetch(`/api/rides/${rideId}/request-return`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to request vehicle return');
        return await response.json();
    },

    confirmVehicleReturn: async (rideId: string) => {
        const response = await fetch(`/api/rides/${rideId}/confirm-return`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to confirm vehicle return');
        return await response.json();
    },

    // Pickup flow endpoints
    startPickup: async (rideId: string) => {
        const response = await fetch(`/api/rides/${rideId}/start-pickup`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to start pickup');
        return await response.json();
    },

    arriveAtPickup: async (rideId: string) => {
        const response = await fetch(`/api/rides/${rideId}/arrive-at-pickup`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to arrive at pickup');
        return await response.json();
    },



    boardPassenger: async (rideId: string, passengerIndex?: number) => {
        const response = await fetch(`/api/rides/${rideId}/board-passenger`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ passengerIndex })
        });
        if (!response.ok) throw new Error('Failed to board passenger');
        return await response.json();
    },

    confirmBoarding: async (rideId: string) => {
        const response = await fetch(`/api/rides/${rideId}/confirm-boarding`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({}) // Some backends require body even if empty
        });
        if (!response.ok) throw new Error('Failed to confirm boarding');
        return await response.json();
    },

    startTrip: async (rideId: string) => {
        const response = await fetch(`/api/rides/${rideId}/start-trip`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to start trip');
        return await response.json();
    },

    selectPaymentTiming: async (rideId: string, paymentTiming: 'now' | 'pickup') => {
        const response = await fetch(`/api/rides/${rideId}/payment-timing`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paymentTiming })
        });
        if (!response.ok) throw new Error('Failed to select payment timing');
        return await response.json();
    },

    saveDriverDocuments: async (formData: FormData) => {
        const response = await fetch('/api/driver/documents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
                // Note: Don't set Content-Type for FormData, browser will set it automatically with boundary
            },
            body: formData
        });
        if (!response.ok) throw new Error('Failed to save driver documents');
        return await response.json();
    },

    saveDriverPayoutDetails: async (details: any) => {
        const response = await fetch('/api/driver/payout-details', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(details)
        });
        if (!response.ok) throw new Error('Failed to save payout details');
        return await response.json();
    },

    getDriverPayoutDetails: async (driverId: string) => {
        console.log(`🔍 [API] fetching payout details for driverId: "${driverId}"`);
        const response = await fetch(`/api/driver/${driverId}/payout-details`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            const text = await response.text();
            console.error(`❌ [API] Failed to fetch driver payout details. Status: ${response.status}. Response:`, text.substring(0, 100)); // Log first 100 chars
            throw new Error(`Failed to fetch driver payout details: ${response.status}`);
        }
        return await response.json();
    },

    requestPayout: async (amount: number, mobileNumber: string, providerRefId: string = 'AIRTEL', payoutMethod: 'mobile' | 'bank' = 'mobile') => {
        const response = await fetch('/api/payment/payout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount, mobileNumber, providerRefId, payoutMethod })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || error.message || 'Payout failed');
        }
        return await response.json();
    }
};
