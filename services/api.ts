
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
    id: string;
    name: string;
    code: string;
    ref_id: string;
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


// --- MAPBOX SPECIFIC TYPES ---
export interface MapBoxRouteResponse {
    routes: {
        geometry: {
            coordinates: number[][];
            type: string;
        };
        duration: number;
        distance: number;
    }[];
    waypoints: any[];
}

// --- MAPBOX SERVICE LOGIC ---
export const MapService = {
    /**
     * Fetches a driving route between two coordinates using Mapbox Directions API.
     * @param start [lng, lat]
     * @param end [lng, lat]
     * @param accessToken Mapbox Public Access Token
     */
    getDirections: async (start: [number, number], end: [number, number], accessToken: string): Promise<MapBoxRouteResponse | null> => {
        try {
            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=false&geometries=geojson&access_token=${accessToken}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch route');
            return await response.json();
        } catch (error) {
            console.error("MapService Error:", error);
            return null;
        }
    },

    /**
     * Retrieves tracking data.
     */
    trackDevice: async (deviceId: string, accessToken: string): Promise<MapBoxRouteResponse | null> => {
        // Simulation Logic
        const baseLng = -73.9851;
        const baseLat = 40.7589;

        const offset1 = 0.01;
        const offset2 = 0.02;

        const start: [number, number] = [baseLng + offset1, baseLat + offset1];
        const end: [number, number] = [baseLng - offset2, baseLat - offset2];

        return MapService.getDirections(start, end, accessToken);
    }
};

// --- ApiService ---
export const ApiService = {
    login: async (email, password) => {
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
            const response = await fetch('/api/rides/share', {
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
            const response = await fetch('/api/rides/hire', {
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
    getDriverPayoutDetails: async (driverId: string): Promise<DriverPayoutDetails | null> => {
        try {
            const response = await fetch(`/api/drivers/${driverId}/payout-details`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch driver payout details');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching driver payout details:', error);
            return null;
        }
    },

    /**
     * Get available mobile money operators from PayChangu
     */
    getMobileMoneyOperators: async (): Promise<MobileMoneyOperator[]> => {
        try {
            const response = await fetch('/api/payments/operators', {
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
            const response = await fetch('/api/payments/initiate', {
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
            const response = await fetch(`/api/payments/verify/${chargeId}`, {
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

    selectPaymentMethod: async (rideId: string, paymentType: 'online' | 'physical') => {
        const response = await fetch(`/api/rides/${rideId}/payment-method`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paymentType })
        });
        if (!response.ok) throw new Error('Failed to select payment method');
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
    }
};
