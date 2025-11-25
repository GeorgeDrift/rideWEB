
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
    getSearchItems: (): SearchResult[] => [
        { id: 'dash', label: 'Dashboard', subLabel: 'Overview', view: 'dashboard', keywords: ['analytics', 'home'] },
        { id: 'rides', label: 'Rides', subLabel: 'Manage Rides', view: 'rides', keywords: ['trips', 'history'] },
        { id: 'drivers', label: 'Drivers', subLabel: 'Manage Drivers', view: 'drivers', keywords: ['staff', 'partners'] },
        { id: 'riders', label: 'Riders', subLabel: 'Manage Riders', view: 'riders', keywords: ['users', 'customers'] },
        { id: 'rev', label: 'Revenue', subLabel: 'Financials', view: 'revenue', keywords: ['money', 'profit'] },
        { id: 'pricing', label: 'Pricing', subLabel: 'Settings', view: 'pricing', keywords: ['rates', 'surge'] },
    ],
    getDashboardData: () => ({
        weekly: [{ name: 'Mon', value: 1000 }, { name: 'Tue', value: 2000 }, { name: 'Wed', value: 1500 }, { name: 'Thu', value: 2500 }, { name: 'Fri', value: 3000 }, { name: 'Sat', value: 3500 }, { name: 'Sun', value: 2000 }],
        lastWeek: [{ name: 'Mon', value: 800 }, { name: 'Tue', value: 1800 }, { name: 'Wed', value: 1300 }, { name: 'Thu', value: 2300 }, { name: 'Fri', value: 2800 }, { name: 'Sat', value: 3300 }, { name: 'Sun', value: 1800 }],
        monthly: [{ name: 'Week 1', value: 10000 }, { name: 'Week 2', value: 12000 }, { name: 'Week 3', value: 11000 }, { name: 'Week 4', value: 14000 }],
        mapVehicles: [
            { id: 1, lat: 40.7589, lng: -73.9851, type: 'share' },
            { id: 2, lat: 40.7489, lng: -73.9951, type: 'hire' }
        ]
    }),
    getRides: (): Ride[] => [
        { id: 'R-101', rider: { name: 'John Doe', avatar: 'https://ui-avatars.com/api/?name=John+Doe' }, driver: { name: 'Jane Smith', avatar: 'https://ui-avatars.com/api/?name=Jane+Smith' }, type: 'Ride Share', origin: 'Downtown', destination: 'Airport', fare: 25500, date: '2023-10-27', status: 'Completed' },
        { id: 'R-102', rider: { name: 'Alice Cooper', avatar: 'https://ui-avatars.com/api/?name=Alice+Cooper' }, driver: { name: 'Bob Brown', avatar: 'https://ui-avatars.com/api/?name=Bob+Brown' }, type: 'For Hire', origin: 'Uptown', destination: 'Suburbs', fare: 45000, date: '2023-10-28', status: 'In Progress' },
    ],
    getDrivers: (): Driver[] => [
        { id: 'D-001', name: 'Jane Smith', avatar: 'https://ui-avatars.com/api/?name=Jane+Smith', vehicle: 'Toyota Camry', licensePlate: 'ABC-123', totalRides: 1540, rating: 4.8, status: 'Approved', joinDate: '2022-01-15' },
        { id: 'D-002', name: 'Bob Brown', avatar: 'https://ui-avatars.com/api/?name=Bob+Brown', vehicle: 'Ford F-150', licensePlate: 'XYZ-987', totalRides: 850, rating: 4.9, status: 'Approved', joinDate: '2022-05-20' },
    ],
    getRiders: (): Rider[] => [
        { id: 'U-001', name: 'John Doe', avatar: 'https://ui-avatars.com/api/?name=John+Doe', totalRides: 45, memberSince: '2023-01-10', status: 'Active' },
    ],
    getRevenueData: () => ({
        annual: [{ name: 'Jan', value: 50000 }, { name: 'Feb', value: 60000 }, { name: 'Mar', value: 55000 }, { name: 'Apr', value: 70000 }, { name: 'May', value: 80000 }, { name: 'Jun', value: 90000 }],
        transactions: [
            { id: 'TX-001', source: 'Ride #R-101', date: '2023-10-27', amount: 25500, status: 'Completed' },
            { id: 'TX-002', source: 'Ride #R-102', date: '2023-10-28', amount: 45000, status: 'Pending' },
        ] as Transaction[]
    }),
    getPricingZones: (): PricingZone[] => [
        { id: 1, name: 'Downtown Zone', multiplier: 1.5, color: '#ef4444', coordinates: [[-73.99, 40.75], [-73.98, 40.76]] },
    ],
    getTotalRidesData: () => ({
        weekly: [{ name: 'Mon', rides: 120, cancelled: 5 }, { name: 'Tue', rides: 140, cancelled: 8 }, { name: 'Wed', rides: 160, cancelled: 6 }, { name: 'Thu', rides: 180, cancelled: 10 }, { name: 'Fri', rides: 220, cancelled: 12 }, { name: 'Sat', rides: 250, cancelled: 15 }, { name: 'Sun', rides: 150, cancelled: 4 }],
        monthly: [{ name: 'Jan', rides: 500, cancelled: 20 }, { name: 'Feb', rides: 600, cancelled: 25 }],
        yearly: [{ name: '2022', rides: 6000, cancelled: 300 }, { name: '2023', rides: 7500, cancelled: 350 }],
    }),
    getRideShareData: () => ({
        weekly: [{ name: 'Mon', rides: 80 }, { name: 'Tue', rides: 90 }, { name: 'Wed', rides: 110 }, { name: 'Thu', rides: 130 }, { name: 'Fri', rides: 150 }, { name: 'Sat', rides: 180 }, { name: 'Sun', rides: 100 }],
        monthly: [{ name: 'Jan', rides: 300 }, { name: 'Feb', rides: 350 }],
    }),
    getForHireData: () => ({
        weekly: [{ name: 'Mon', scheduled: 10, immediate: 5 }, { name: 'Tue', scheduled: 12, immediate: 6 }],
        monthly: [{ name: 'Jan', scheduled: 40, immediate: 20 }, { name: 'Feb', scheduled: 50, immediate: 25 }],
        categories: [
            {
                title: "Small Cars", icon: "🚗", count: 120, available: 85, examples: ["Toyota Corolla", "Honda Civic"],
                stats: { activeRentals: 35, growth: 5.2, revenue: 1250000, avgRate: 25000, chartData: [{ day: 'Mon', value: 20 }, { day: 'Tue', value: 25 }] }
            } as VehicleCategory
        ]
    }),
    getConversations: (): Conversation[] => [
        { id: 'C-1', name: 'Jane Smith', avatar: 'https://ui-avatars.com/api/?name=Jane+Smith', role: 'Driver', lastMessage: 'I am arriving in 5 mins.', time: '2m ago', unread: 1, status: 'online', messages: [{ id: 'm1', text: 'Hi, where are you?', sender: 'agent', timestamp: '10:00 AM' }, { id: 'm2', text: 'I am arriving in 5 mins.', sender: 'user', timestamp: '10:01 AM' }] },
    ],
    getMapVehicles: () => [
        { id: 1, lat: 40.7589, lng: -73.9851, type: 'driver' },
        { id: 2, lat: 40.7489, lng: -73.9951, type: 'rider' },
    ],
    getDriverProfile: () => ({
        name: "Alex Driver", avatar: "https://ui-avatars.com/api/?name=Alex+Driver", rating: 4.9, role: "Pro Driver"
    }),
    getDriverNotifications: (): DriverNotification[] => [
        { id: 1, title: "New Ride Request", msg: "Trip to Airport", time: "2m ago", unread: true },
        { id: 2, title: "Payment Received", msg: "MWK 25,000 from Trip #123", time: "1h ago", unread: false },
    ],
    getDriverTransactions: (): DriverTransaction[] => [
        { id: 101, type: 'Payment', desc: 'Trip #123 Payout', date: 'Oct 26', amount: 25000, method: 'Mobile Money', sub: 'Client: John' },
    ],
    getDriverVehicles: (): DriverVehicle[] => [
        { id: 1, name: 'Toyota Hiace', plate: 'BS 1234', status: 'On-Route', category: 'Minibus', rate: 'MWK 45,000/day' },
    ],
    getDriverConversations: (): Conversation[] => [
        { id: 'DC-1', name: 'Support', avatar: 'https://ui-avatars.com/api/?name=Support', role: 'Admin', lastMessage: 'Your documents are approved.', time: '1d ago', unread: 0, status: 'online', messages: [] },
    ],
    getDriverActivePosts: (): DriverRidePost[] => [
        { id: 1, origin: 'Blantyre', destination: 'Lilongwe', date: '2023-10-30', time: '08:00', price: 25000, seats: 3 },
    ],
    getDriverHirePosts: (): DriverHirePost[] => [
        { id: 1, title: '3-Ton Truck for Hire', category: 'Trucks & Logistics', location: 'Lilongwe', rate: 'MWK 150,000/day', status: 'Active' },
    ],
    getDriverContractedJobs: (): DriverContractedJob[] => [
        { id: 1, title: 'Equipment Transport', origin: 'Lilongwe', destination: 'Mzuzu', date: '2023-11-01', payout: 450000, status: 'Scheduled', type: 'hire', clientName: 'BuildCo', clientId: 'CL-55' },
    ],
    getRiderConversations: (): Conversation[] => [
        { id: 'RC-1', name: 'Alex Driver', avatar: 'https://ui-avatars.com/api/?name=Alex+Driver', role: 'Driver', lastMessage: 'On my way.', time: '5m ago', unread: 1, status: 'online', messages: [] },
    ],
    getRiderProfile: () => ({
        name: "Rider User", avatar: "https://ui-avatars.com/api/?name=Rider+User", rating: 4.8
    }),
    getRiderStats: () => ({
        totalSpend: 458500, totalRides: 24, totalDistance: 1407, chartData: [{ name: 'Jan', value: 50000 }, { name: 'Feb', value: 80000 }], rideTypes: [{ name: 'Share', value: 70, color: '#FACC15' }, { name: 'Hire', value: 30, color: '#3b82f6' }]
    }),
    getRiderHistory: () => [
        { id: 1, date: 'Oct 25, 2023', time: '14:30', origin: 'Home', destination: 'Office', price: 15000, status: 'Completed', driver: 'Alex Driver', rating: 5 },
    ],
    getAllRideSharePosts: (): DriverRidePost[] => [
        { id: 101, origin: 'Blantyre', destination: 'Lilongwe', date: 'Oct 30', time: '08:00', price: 25000, seats: 3, driverName: 'Alex Driver', driverRating: 4.9 },
        { id: 102, origin: 'Zomba', destination: 'Blantyre', date: 'Oct 31', time: '10:00', price: 5000, seats: 2, driverName: 'John Doe', driverRating: 4.5 },
    ],
    getAllForHirePosts: (): DriverHirePost[] => [
        { id: 201, title: '5-Ton Truck', category: 'Trucks', location: 'Lilongwe', rate: 'MWK 200,000/day', status: 'Active', driverName: 'Big Movers', driverRating: 4.7 },
    ],

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
    }

};
