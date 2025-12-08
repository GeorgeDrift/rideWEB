
import React, { useState, useEffect, useRef } from 'react';
import {
    CarIcon, MapIcon, CloseIcon, MenuIcon,
    SteeringWheelIcon, SearchIcon, TagIcon,
    BriefcaseIcon, StarIcon, CreditCardIcon,
    BankIcon, WalletIcon, CheckCircleIcon,
    ChatBubbleIcon, SendIcon, PencilIcon, NavigationIcon, PhoneIcon, HandshakeIcon
} from './Icons';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import {
    ApiService,
    DriverRidePost,
    DriverHirePost,
    Conversation,
    Message,
    DriverPayoutDetails,
    MobileMoneyOperator,
    PaymentInitiationRequest
} from '../services/api';
import { socketService } from '../services/socket';
import { pollingService } from '../services/polling';
// Map rendering removed from Rider UI - using manual pickup/drop-off flow instead
import { geocodeAddress, calculateDistance } from '../services/mapUtils';
import { VEHICLE_HIRE_CATEGORIES, VehicleCategoryType } from '../constants/VehicleCategories';
import LocationSearch from './LocationSearch';
import NegotiationModal from './NegotiationModal';
import PaymentSelectionModal from './PaymentSelectionModal';
// PickupConfirmation removed - using manual pickup/boarding flow instead

// --- Local Icons ---
const HomeIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const HistoryIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const DashboardIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2-2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const MarketIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const LockClosedIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const LocationMarkerIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const TruckIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
);

interface RiderDashboardProps {
    onLogout: () => void;
}





import { ThemeToggle } from './ThemeToggle';

export const RiderDashboard: React.FC<RiderDashboardProps> = ({ onLogout }) => {
    // State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'statistics' | 'trips' | 'active-trip' | 'financials' | 'distance' | 'messages'>('overview');
    const [marketTab, setMarketTab] = useState<'share' | 'hire'>('share');
    const [selectedHireCategory, setSelectedHireCategory] = useState<string | null>(null);
    // New: share tab vehicle filter
    const [selectedShareCategory, setSelectedShareCategory] = useState<string | null>(null);

    // Persist filters in URL (so refresh/navigation preserves selections)
    const readQueryParam = (key: string) => {
        try {
            const params = new URLSearchParams(window.location.search);
            const v = params.get(key);
            return v ? decodeURIComponent(v) : null;
        } catch (e) { return null; }
    };

    const updateQueryParam = (key: string, value: string | null) => {
        try {
            const params = new URLSearchParams(window.location.search);
            if (value === null) params.delete(key);
            else params.set(key, encodeURIComponent(value));
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            window.history.replaceState({}, '', newUrl);
        } catch (e) { /* ignore */ }
    };

    // Map a category name to an icon component
    const getCategoryIcon = (name?: string) => {
        if (!name) return null;
        const n = name.toLowerCase();
        if (n.includes('tractor') || n.includes('truck') || n.includes('tanker') || n.includes('tipper') || n.includes('flatbed') || n.includes('canter')) return <TruckIcon className="w-4 h-4 mr-2" />;
        // hatch, sedan, suv, minibus -> car
        if (n.includes('hatch') || n.includes('sedan') || n.includes('suv') || n.includes('van') || n.includes('coaster') || n.includes('minibus')) return <CarIcon className="w-4 h-4 mr-2" />;
        // fallback generic car icon
        return <CarIcon className="w-4 h-4 mr-2" />;
    };

    // Negotiation Workflow State
    const [searchResults, setSearchResults] = useState<DriverRidePost[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [negotiationRide, setNegotiationRide] = useState<DriverRidePost | null>(null);
    const [showNegotiationModal, setShowNegotiationModal] = useState(false);
    const [negotiationHistory, setNegotiationHistory] = useState<any[]>([]);
    const [pendingRequestsList, setPendingRequestsList] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [approvedRide, setApprovedRide] = useState<any>(null);
    // Pickup modal removed - trips go directly to tracking tab
    const [pickupRide, setPickupRide] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Boarding confirmation state (for ride share pickup flow)
    const [showBoardingModal, setShowBoardingModal] = useState(false);
    const [boardingRideId, setBoardingRideId] = useState<string | null>(null);
    const [boardingConfirmed, setBoardingConfirmed] = useState<Set<string>>(new Set());


    // const [driverLocation, setDriverLocation] = useState<{ lng: number; lat: number }>({ lng: 33.7741, lat: -13.9626 }); // Removed live tracking
    const [tripCoordinates, setTripCoordinates] = useState<{ origin: [number, number] | null, destination: [number, number] | null }>({ origin: null, destination: null });
    const [tripDistance, setTripDistance] = useState<number | null>(null);

    // Request Modal State (No payment yet)
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [bookingType, setBookingType] = useState<'share' | 'hire'>('share');
    const [requestStep, setRequestStep] = useState<'review' | 'success'>('review');

    // Payment Modal State (Post Trip)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentStep, setPaymentStep] = useState<'method' | 'processing' | 'success'>('method');
    const [paymentMethod, setPaymentMethod] = useState<'mobile'>('mobile'); // Default to mobile for API flow
    const [mobileProvider, setMobileProvider] = useState<'airtel' | 'mpamba'>('airtel');
    const [passengerPhone, setPassengerPhone] = useState(''); // Passenger's number for PUSH request

    // Handover Modal State (For Hire Jobs)
    const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
    const [handoverPaymentMethod, setHandoverPaymentMethod] = useState<'mobile' | 'cash'>('mobile');

    // Payment Timing Modal State (For Hire Jobs - after driver approval)
    const [isPaymentTimingModalOpen, setIsPaymentTimingModalOpen] = useState(false);
    const [paymentTimingRide, setPaymentTimingRide] = useState<any>(null);

    // Payment Flow State (NEW)
    const [driverPayoutDetails, setDriverPayoutDetails] = useState<DriverPayoutDetails | null>(null);
    const [mobileMoneyOperators, setMobileMoneyOperators] = useState<MobileMoneyOperator[]>([]);
    const [isLoadingDriverDetails, setIsLoadingDriverDetails] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [currentChargeId, setCurrentChargeId] = useState<string | null>(null);

    // Negotiation State
    const [bookingMode, setBookingMode] = useState<'fixed' | 'negotiate'>('fixed');
    const [offerPrice, setOfferPrice] = useState('');

    // Rating Modal State
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [ratingTrip, setRatingTrip] = useState<any>(null);
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedRating, setSelectedRating] = useState(0);
    const [ratingComment, setRatingComment] = useState('');

    // Messages State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeChatId, setActiveChatId] = useState<string>('');
    const [messageInput, setMessageInput] = useState('');

    // Data States
    const [profile, setProfile] = useState<any>({ name: '', avatar: '', rating: 0 });
    const [stats, setStats] = useState<any>({ totalSpend: 0, totalRides: 0, totalDistance: 0, chartData: [], rideTypes: [] });
    const [history, setHistory] = useState<any[]>([]);
    const [rideShareListings, setRideShareListings] = useState<DriverRidePost[]>([]);
    const [forHireListings, setForHireListings] = useState<DriverHirePost[]>([]);
    const [activeTrips, setActiveTrips] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);

    // Loading States
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [isLoadingMarketplace, setIsLoadingMarketplace] = useState(true);
    const [isLoadingTrips, setIsLoadingTrips] = useState(true);

    const [currentActiveTrip, setCurrentActiveTrip] = useState<any>(null);

    // Helper to separate active vs past trips
    const pastTrips = history.filter(h => ['Completed', 'Cancelled', 'Refunded', 'Approved'].includes(h.status));

    // Auto-Status Simulation Effect (To show flow without driver interaction in this demo)
    // Real-time status updates via Socket.IO
    useEffect(() => {
        socketService.on('trip_status_update', (updatedTrip: any) => {
            setHistory(currentHistory => {
                const exists = currentHistory.find(t => t.id === updatedTrip.id);
                if (exists) {
                    return currentHistory.map(t => t.id === updatedTrip.id ? updatedTrip : t);
                } else {
                    return [updatedTrip, ...currentHistory];
                }
            });
        });

        return () => {
            socketService.off('trip_status_update');
        };
    }, []);


    // Auto-Open Payment Modal when status becomes 'Payment Due'
    useEffect(() => {
        if (currentActiveTrip?.status === 'Payment Due' && !isPaymentModalOpen) {
            setIsPaymentModalOpen(true);
            setPaymentStep('method');
        }
    }, [currentActiveTrip?.status]);

    // Fetch Driver Payout Details when Payment Modal opens or active trip changes
    useEffect(() => {
        const fetchDriverDetails = async () => {
            // Only fetch if modal is open AND we have a driver ID
            if (isPaymentModalOpen && currentActiveTrip?.driverId) {
                setIsLoadingDriverDetails(true);
                setPaymentError(null);
                try {
                    const details = await ApiService.getDriverPayoutDetails(currentActiveTrip.driverId);
                    setDriverPayoutDetails(details);
                } catch (error) {
                    console.error("Failed to load driver payout details", error);
                    // Don't show error to user immediately, just log it. 
                    // Or show a subtle message. For now, log.
                    // setPaymentError("Could not load driver payment info."); 
                } finally {
                    setIsLoadingDriverDetails(false);
                }
            } else if (!isPaymentModalOpen) {
                // Reset details when modal closes
                setDriverPayoutDetails(null);
            }
        };

        fetchDriverDetails();
    }, [isPaymentModalOpen, currentActiveTrip?.driverId]);

    // --- Effects ---

    // Initialize Socket Connection
    useEffect(() => {
        const token = localStorage.getItem('token');
        let userId = 'rider_123';
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                userId = payload.id;
            } catch (e) {
                console.error('Error decoding token for socket:', e);
            }
        }

        socketService.connect(userId, 'rider');

        socketService.on('notification', (data) => {
            console.log('Notification:', data);
        });

        socketService.on('request_approved', (data) => {
            // Update the approved ride with the new status
            // For share rides, approval means driver is coming/scheduled
            const approvedRideData = { ...data, status: 'Waiting for Pickup' };
            setApprovedRide(approvedRideData);

            // Add the approved ride to history/activeTrips so it shows in My Trips
            setHistory((prev: any) => {
                const exists = prev.find((t: any) => t.id === (data.id || data.rideId));
                if (exists) {
                    return prev.map((t: any) => t.id === (data.id || data.rideId) ? approvedRideData : t);
                }
                return [approvedRideData, ...prev];
            });

            // Also add to activeTrips so it shows in Active Trip view
            setActiveTrips((prev: any) => {
                const exists = prev.find((t: any) => t.id === (data.id || data.rideId));
                if (!exists) {
                    return [approvedRideData, ...prev];
                }
                return prev.map((t: any) => t.id === (data.id || data.rideId) ? approvedRideData : t);
            });

            // Show notification to rider to check Active Trip tab
            setNotifications(prev => [{
                title: 'Request Approved!',
                msg: data.message || 'Your request was approved! Please select a payment method to confirm.',
                time: 'Just now',
                unread: true
            }, ...prev]);

            setShowNegotiationModal(false);

            // Auto-open payment modal to prompt user for payment method selection
            setShowPaymentModal(true);
        });

        // Listen for payment selection required (For Hire trips after approval)
        socketService.on('payment_selection_required', (data) => {
            console.log('💳 payment_selection_required received:', data);
            const rideData = { ...data, status: 'Awaiting Payment Selection' };

            // Update activeTrips and history with the ride
            setHistory((prev: any) => {
                const exists = prev.find((t: any) => t.id === (data.id || data.rideId));
                if (exists) {
                    return prev.map((t: any) => t.id === (data.id || data.rideId) ? rideData : t);
                }
                return [rideData, ...prev];
            });

            setActiveTrips((prev: any) => {
                const exists = prev.find((t: any) => t.id === (data.id || data.rideId));
                if (!exists) {
                    return [rideData, ...prev];
                }
                return prev.map((t: any) => t.id === (data.id || data.rideId) ? rideData : t);
            });

            // Open payment timing modal
            setPaymentTimingRide(rideData);
            setIsPaymentTimingModalOpen(true);
            setActiveTab('active-trip');

            // Show notification
            setNotifications(prev => [{
                title: 'Payment Selection Required',
                msg: data.message || 'Choose when to pay for your vehicle hire.',
                time: 'Just now',
                unread: true
            }, ...prev]);
        });

        // Listen for payment required (e.g., after selecting "Pay Now" for hire)
        socketService.on('payment_required', (data) => {
            console.log('💰 payment_required received:', data);

            // Set the approved ride data so the modal has context
            const rideData = { ...data, status: 'Payment Pending' };
            setApprovedRide(rideData);

            // Update activeTrips/history
            setActiveTrips((prev: any) => {
                const exists = prev.find((t: any) => t.id === (data.id || data.rideId));
                if (!exists) return [rideData, ...prev];
                return prev.map((t: any) => t.id === (data.id || data.rideId) ? rideData : t);
            });

            // Close timing modal if open
            setIsPaymentTimingModalOpen(false);

            // Open main payment modal
            setShowPaymentModal(true);

            setNotifications(prev => [{
                title: 'Payment Required',
                msg: data.message || 'Please complete your payment now.',
                time: 'Just now',
                unread: true
            }, ...prev]);
        });

        // New real-time hooks: marketplace posts and counters
        socketService.on('hire_post_added', (post) => {
            setForHireListings(prev => [post, ...prev]);
            setNotifications(prev => [{ title: 'New Hire Post', msg: post.title || 'New hire listing', time: 'Just now', unread: true }, ...prev]);
        });

        socketService.on('rideshare_post_added', (post) => {
            setRideShareListings(prev => [post, ...prev]);
            setNotifications(prev => [{ title: 'New RideShare', msg: `${post.origin} → ${post.destination}`, time: 'Just now', unread: true }, ...prev]);
        });

        socketService.on('counter_offer', (data) => {
            setNegotiationHistory(prev => [
                { type: 'counter', amount: data.counterPrice, timestamp: new Date(), isDriver: true },
                ...prev
            ]);
        });

        // Listen for boarding request (Driver started pickup -> Inbound)
        socketService.on('boarding_request', (data) => {
            const rideId = data.rideId || data.id;
            if (rideId) {
                setHistory(prev => prev.map(h => h.id === rideId ? { ...h, status: 'Inbound' } : h));
                setActiveTrips(prev => prev.map((t: any) => t.id === rideId ? { ...t, status: 'Inbound' } : t));
            }
            setNotifications(prev => [{
                title: 'Driver Inbound',
                msg: data.message || 'Driver is heading to pickup.',
                time: 'Just now',
                unread: true
            }, ...prev]);
        });



        socketService.on('payment_selection_required', (data: any) => {
            console.log('💰 payment_selection_required received:', data);
            const rideId = data?.rideId || data?.id;

            // Check if this is actually a handover success (isActive or Paid)
            const isPaid = data.paymentStatus === 'paid' || data.status === 'Scheduled';

            if (rideId) {
                const newRideState = {
                    ...data,
                    id: rideId,
                    status: isPaid ? 'Scheduled' : 'Awaiting Payment Selection',
                    type: data.type || 'hire',
                    origin: data.origin,
                    destination: data.destination,
                    price: data.price,
                    driver: data.driver
                };

                // 1. Force update activeTrips immediately
                setActiveTrips(prev => {
                    // Remove existing if present to avoid dupes
                    const filtered = prev.filter(t => t.id !== rideId);
                    return [newRideState, ...filtered];
                });

                // 2. Set as current active trip for component rendering
                setCurrentActiveTrip(newRideState);

                // 3. Switch to active trip tab so user sees the context
                setActiveTab('active-trip');

                if (isPaid) {
                    // Handover confirmed / Success case
                    setNotifications(prev => [{
                        title: 'Handover Complete',
                        msg: 'Driver has handed over the vehicle. Ride is active.',
                        time: 'Just now',
                        unread: true
                    }, ...prev]);
                    setIsHandoverModalOpen(false);
                } else {
                    // 4. Open Payment Timing Modal (Pay Now / Pickup)
                    console.log('Opening payment timing modal for selection');
                    setPaymentTimingRide(newRideState);
                    setIsPaymentTimingModalOpen(true);
                }
            }
        });

        // Listen for request approval (Ride Share)
        socketService.on('request_approved', (data: any) => {
            console.log('✅ request_approved received:', data);
            const rideId = data?.rideId || data?.id;
            if (rideId) {
                const updateRide = (t: any) => {
                    if (t.id === rideId) {
                        return { ...t, status: 'Approved', price: data.price };
                    }
                    return t;
                };

                setHistory(prev => {
                    const exists = prev.find(h => h.id === rideId);
                    if (!exists) return [{ ...data, status: 'Approved' }, ...prev];
                    return prev.map(updateRide);
                });

                setActiveTrips(prev => {
                    const exists = prev.find(t => t.id === rideId);
                    if (!exists) return [{ ...data, status: 'Approved' }, ...prev];
                    return prev.map(updateRide);
                });

                setActiveTab('active-trip');
            }
        });

        // Listen for driver arrival (triggers boarding confirmation for rider)
        socketService.on('driver_arrived', (data) => {
            const rideId = data.rideId || data.id;
            const rideIdStr = String(rideId);
            console.log('🚗🚗🚗 driver_arrived EVENT RECEIVED!');
            console.log('📦 Event data:', data);
            console.log('🆔 Extracted rideId:', rideId);
            console.log('🆔 rideIdStr:', rideIdStr);

            if (rideId) {
                console.log('✅ RideID exists, updating trip status to Arrived');
                // Update trip status to Arrived
                setHistory(prev => prev.map(h => h.id === rideId ? { ...h, status: 'Arrived' } : h));
                setActiveTrips(prev => prev.map((t: any) => t.id === rideId ? { ...t, status: 'Arrived' } : t));

                // Show boarding confirmation modal ONLY if not already confirmed
                console.log('🔍 Checking if already confirmed...');
                setBoardingConfirmed(prev => {
                    console.log('📋 Previously confirmed rides:', Array.from(prev));
                    if (!prev.has(rideIdStr)) {
                        console.log('✨ NOT confirmed yet! Setting modal state...');
                        console.log('🎯 Setting showBoardingModal = true');
                        console.log('🎯 Setting boardingRideId =', rideIdStr);
                        setShowBoardingModal(true);
                        setBoardingRideId(rideIdStr);
                        console.log('✅ Modal state set!');
                    } else {
                        console.log('⏭️ Already confirmed, skipping modal');
                    }
                    return prev;
                });
            } else {
                console.error('❌ NO RIDE ID in driver_arrived event!');
            }

            setNotifications(prev => [{
                title: 'Driver Arrived',
                msg: data.message || 'Your driver has arrived at the pickup location.',
                time: 'Just now',
                unread: true
            }, ...prev]);
        });

        // Listen for passenger boarded (Driver confirmed boarding)
        socketService.on('passenger_boarded', (data) => {
            const rideId = data.rideId || data.id;
            if (rideId) {
                setHistory(prev => prev.map(h => h.id === rideId ? { ...h, status: 'Boarded' } : h));
                setActiveTrips(prev => prev.map((t: any) => t.id === rideId ? { ...t, status: 'Boarded' } : t));
            }
            setNotifications(prev => [{
                title: 'Boarding Confirmed',
                msg: data.message || 'Boarding confirmed.',
                time: 'Just now',
                unread: true
            }, ...prev]);
        });

        // Listen for rider's boarding confirmation acknowledgment
        socketService.on('boarding_confirmed', (data) => {
            const rideId = data.rideId || data.id;
            if (rideId) {
                // Update trip status to Boarded
                setHistory(prev => prev.map(h => h.id === rideId ? { ...h, status: 'Boarded' } : h));
                setActiveTrips(prev => prev.map((t: any) => t.id === rideId ? { ...t, status: 'Boarded' } : t));

                // Update currentActiveTrip if it matches
                setCurrentActiveTrip((prev: any) => {
                    if (prev && prev.id === rideId) {
                        return { ...prev, status: 'Boarded' };
                    }
                    return prev;
                });
            }
        });

        // Listen for handover completion (Hire Flow)
        socketService.on('handover_completed', (data) => {
            console.log('🔔 [RiderDashboard] Received handover_completed event:', data);
            const rideId = data.rideId || data.id;
            if (rideId) {
                const status = 'Active';
                console.log(`✅ [RiderDashboard] Updating ride ${rideId} to status: ${status}`);
                setHistory(prev => prev.map(h => h.id === rideId ? { ...h, status } : h));
                setActiveTrips(prev => prev.map((t: any) => t.id === rideId ? { ...t, status } : t));
                setCurrentActiveTrip((prev: any) => {
                    if (prev && prev.id === rideId) {
                        console.log(`✅ [RiderDashboard] Updated currentActiveTrip to Active`);
                        return { ...prev, status };
                    }
                    return prev;
                });
                setNotifications(prev => [{
                    title: 'Handover Completed',
                    msg: data.message || 'Handover complete. Drive safely!',
                    time: 'Just now',
                    unread: true
                }, ...prev]);
            } else {
                console.warn('⚠️ [RiderDashboard] handover_completed event missing rideId!');
            }
        });

        // Listen for return confirmation (Hire Flow)
        socketService.on('return_confirmed', (data) => {
            const rideId = data.rideId || data.id;
            if (rideId) {
                const status = 'Completed';
                setHistory(prev => prev.map(h => h.id === rideId ? { ...h, status } : h));
                setActiveTrips(prev => prev.map((t: any) => t.id === rideId ? { ...t, status } : t));
                setCurrentActiveTrip((prev: any) => {
                    if (prev && prev.id === rideId) return { ...prev, status };
                    return prev;
                });
                setNotifications(prev => [{
                    title: 'Return Confirmed',
                    msg: data.message || 'Vehicle return confirmed. Trip completed.',
                    time: 'Just now',
                    unread: true
                }, ...prev]);
            }
        });

        // Listen for trip start (driver started pickup)
        socketService.on('trip_started', (data: any) => {
            try {
                const tripData = {
                    id: data.id || data.rideId,
                    type: data.type,
                    origin: data.origin,
                    destination: data.destination,
                    price: data.price,
                    driver: data.driver,
                    status: data.status || 'Inbound',
                    createdAt: new Date().toISOString()
                };

                // Add to activeTrips so it appears in Active Trip tab
                setActiveTrips(prev => {
                    const exists = prev.find((t: any) => t.id === tripData.id);
                    if (!exists) return [tripData, ...prev];
                    return prev.map((t: any) => t.id === tripData.id ? tripData : t);
                });

                // Also update history
                setHistory(prev => {
                    const exists = prev.find((h: any) => h.id === tripData.id);
                    if (exists) return prev.map((h: any) => h.id === tripData.id ? tripData : h);
                    return [tripData, ...prev];
                });

                // Show notification
                setNotifications(prev => [{
                    title: 'Trip Started',
                    msg: data.message || 'Your driver has started the trip.',
                    time: 'Just now',
                    unread: true
                }, ...prev]);
            } catch (e) { console.warn('trip_started handler error', e); }
        });

        // rider listens for live driver location updates for active rides
        socketService.on('driver_location', (data: any) => {
            try {
                // data expected: { driverId, lat, lng, heading?, rideId, precision? }
                if (!data) return;

                const rideId = data.rideId || data.ride_id || data.id;

                // Update activeTrips if the ride matches
                setActiveTrips((prev: any[]) => prev.map(t => {
                    if (t.id === rideId) {
                        const driverObj = typeof t.driver === 'object' ? { ...t.driver } : { name: t.driver };
                        driverObj.location = [data.lng, data.lat];
                        driverObj.precision = data.precision || 'precise';
                        return { ...t, driver: driverObj };
                    }
                    return t;
                }));

                // If this is the current active trip, update it too
                setHistory((prev: any[]) => prev.map(h => {
                    if (h.id === rideId) {
                        const driverObj = typeof h.driver === 'object' ? { ...h.driver } : { name: h.driver };
                        driverObj.location = [data.lng, data.lat];
                        driverObj.precision = data.precision || 'precise';
                        return { ...h, driver: driverObj };
                    }
                    return h;
                }));
            } catch (e) {
                console.warn('driver_location handler error', e);
            }
        });

        // Driver has arrived at pickup location
        socketService.on('driver_arrived', (data: any) => {
            try {
                const rideId = data?.rideId;
                if (rideId) {
                    // Update the ride status to 'Arrived'
                    setHistory(prev => prev.map(h => h.id === rideId ? { ...h, status: 'Arrived' } : h));
                    setActiveTrips(prev => prev.map((t: any) => t.id === rideId ? { ...t, status: 'Arrived' } : t));
                }
                setNotifications(prev => [{ title: 'Driver Arrived', msg: data?.message || 'Your driver has arrived at the pickup location.', time: 'Just now', unread: true }, ...prev]);
            } catch (e) { console.warn('driver_arrived handler error', e); }
        });

        // Driver marked trip ended - prompt rider to confirm and pay
        socketService.on('driver_end_trip', (data: any) => {
            try {
                const rideId = data?.rideId;
                // Update activeTrips / history with status 'Payment Due'
                if (rideId) {
                    setHistory(prev => prev.map(h => h.id === rideId ? { ...h, status: 'Payment Due' } : h));
                    setActiveTrips(prev => {
                        const exists = prev.find((t: any) => t.id === rideId);
                        if (exists) return prev.map((t: any) => t.id === rideId ? { ...t, status: 'Payment Due' } : t);
                        // If we don't have the ride in activeTrips, add a minimal placeholder so UI can act on it
                        return [{ id: rideId, status: 'Payment Due', driver: null }, ...prev];
                    });
                }

                setNotifications(prev => [{ title: 'Trip Ended', msg: data?.message || 'Driver ended the trip. Please confirm and complete payment.', time: 'Just now', unread: true }, ...prev]);
                // Bring user to Active Trip tab and open payment modal
                setActiveTab('active-trip');
                setIsPaymentModalOpen(true);
                setPaymentStep('method');
            } catch (e) { console.warn('driver_end_trip handler error', e); }
        });

        // Driver confirmed handover - show payment modal for hire
        socketService.on('handover_confirmed', (data: any) => {
            try {
                console.log('📱 handover_confirmed received:', data);
                const rideId = data?.rideId;
                if (rideId) {
                    // Update ride status to Handover Pending
                    setHistory(prev => prev.map(h => h.id === rideId ? { ...h, status: 'Handover Pending' } : h));
                    setActiveTrips(prev => prev.map((t: any) => t.id === rideId ? { ...t, status: 'Handover Pending' } : t));
                    console.log('✅ Trip status updated to Handover Pending for ride:', rideId);
                }
                setNotifications(prev => [{ title: 'Handover Ready!', msg: data?.message || 'Driver is ready to hand over your vehicle. Select your payment method to proceed.', time: 'Just now', unread: true }, ...prev]);
                // Show handover modal specifically (not generic payment modal)
                console.log('🎯 Opening handover modal...');
                setIsHandoverModalOpen(true);
                setActiveTab('active-trip');
                console.log('✨ Handover modal state should now be open');
            } catch (e) { console.warn('handover_confirmed handler error', e); }
        });

        return () => {
            socketService.off('notification');
            socketService.off('request_approved');
            socketService.off('payment_selection_required');
            socketService.off('counter_offer');
            socketService.off('trip_started');
            socketService.off('driver_location');
            socketService.off('driver_arrived');
            socketService.off('driver_end_trip');
            socketService.off('handover_confirmed');
            socketService.off('boarding_request');
            socketService.off('passenger_boarded');
            socketService.off('boarding_confirmed');
            socketService.disconnect();
        };
    }, []);


    // Join ride room for current active trip and ensure we receive driver_location events
    useEffect(() => {
        if (!currentActiveTrip) return;
        try {
            socketService.joinRide(currentActiveTrip.id);
        } catch (e) { console.warn('joinRide failed', e); }

        // Cleanup: leave ride room implicitly by disconnecting listener when trip changes
        return () => {
            try { socketService.off('driver_location'); } catch (e) { }
        };
    }, [currentActiveTrip]);

    // Fetch initial data with loading states
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch profile
                setIsLoadingProfile(true);
                const profileData = await ApiService.getRiderProfile();
                setProfile(profileData || { name: '', avatar: '', rating: 0 });
                setIsLoadingProfile(false);

                // Fetch stats
                setIsLoadingStats(true);
                const statsData = await ApiService.getRiderStats();
                setStats(statsData || { totalSpend: 0, totalRides: 0, totalDistance: 0, chartData: [], rideTypes: [] });
                setIsLoadingStats(false);

                // Fetch marketplace listings
                setIsLoadingMarketplace(true);
                const [shareListings, hireListings] = await Promise.all([
                    ApiService.getAllRideSharePosts(),
                    ApiService.getAllForHirePosts()
                ]);
                setRideShareListings(shareListings || []);
                setSearchResults(shareListings || []);
                setForHireListings(hireListings || []);
                // Fetch pending requests for rider (negotiation in progress)
                try {
                    const pending = await ApiService.getPendingRequests();
                    setPendingRequestsList(pending || []);
                } catch (e) { console.warn('Failed to fetch pending requests', e); }
                setIsLoadingMarketplace(false);

                // Fetch trips and history
                setIsLoadingTrips(true);
                const historyData = await ApiService.getRiderHistory();
                setHistory(historyData || []);
                // Separate active trips from history
                const active = (historyData || []).filter((h: any) =>
                    ['Pending', 'Approved', 'Scheduled', 'Awaiting Payment Selection', 'Inbound', 'Arrived', 'In Progress', 'Waiting for Pickup', 'Payment Due', 'Handover Pending'].includes(h.status)
                );
                setActiveTrips(active);
                setIsLoadingTrips(false);

                // Fetch conversations
                const conversationsData = await ApiService.getRiderConversations();
                setConversations(conversationsData || []);
                setActiveChatId((conversationsData && conversationsData[0] && conversationsData[0].id) ? conversationsData[0].id : '');

                // Fetch transactions
                const transactionsData = await ApiService.getRiderTransactions();
                setTransactions(transactionsData || []);

            } catch (error) {
                console.error("Error fetching initial data:", error);
                // Set loading to false even on error
                setIsLoadingProfile(false);
                setIsLoadingStats(false);
                setIsLoadingMarketplace(false);
                setIsLoadingTrips(false);
            }
        };
        fetchData();
    }, []);

    // Auto-poll rider data for real-time updates
    useEffect(() => {
        // Poll history & active trips every 10 seconds
        pollingService.startPolling('rider-trips', {
            interval: 10000,
            onPoll: async () => {
                try {
                    const historyData = await ApiService.getRiderHistory();
                    setHistory(historyData || []);
                    const active = (historyData || []).filter((h: any) =>
                        ['Pending', 'Approved', 'Scheduled', 'Awaiting Payment Selection', 'Inbound', 'Arrived', 'Boarded', 'In Progress', 'Waiting for Pickup', 'Payment Due', 'Handover Pending', 'Active', 'Return Pending'].includes(h.status)
                    );
                    setActiveTrips(active);
                } catch (e) { console.warn('Polling trips failed', e); }
            }
        });

        // Poll marketplace listings every 15 seconds
        pollingService.startPolling('rider-marketplace', {
            interval: 15000,
            onPoll: async () => {
                try {
                    const [shareListings, hireListings] = await Promise.all([
                        ApiService.getAllRideSharePosts(),
                        ApiService.getAllForHirePosts()
                    ]);
                    setRideShareListings(shareListings || []);
                    setSearchResults(shareListings || []);
                    setForHireListings(hireListings || []);
                } catch (e) { console.warn('Polling marketplace failed', e); }
            }
        });

        // Poll stats every 20 seconds
        pollingService.startPolling('rider-stats', {
            interval: 20000,
            onPoll: async () => {
                try {
                    const statsData = await ApiService.getRiderStats();
                    setStats(statsData || { totalSpend: 0, totalRides: 0, totalDistance: 0, chartData: [], rideTypes: [] });
                } catch (e) { console.warn('Polling stats failed', e); }
            }
        });

        // Cleanup: stop all polling when component unmounts
        return () => {
            pollingService.stopPolling('rider-trips');
            pollingService.stopPolling('rider-marketplace');
            pollingService.stopPolling('rider-stats');
        };
    }, []);

    // Read persisted category filters from URL on first load
    useEffect(() => {
        const hireCat = readQueryParam('hireCat');
        if (hireCat) setSelectedHireCategory(hireCat);
        const shareCat = readQueryParam('shareCat');
        if (shareCat) setSelectedShareCategory(shareCat);
    }, []);

    // Auto-poll active trips every 5 seconds (to refresh status and driver location)
    useEffect(() => {
        const pollInterval = setInterval(async () => {
            try {
                console.log('🔄 Polling for active trips...');
                const historyData = await ApiService.getRiderHistory();
                console.log('📦 Raw History Data:', historyData);

                if (Array.isArray(historyData)) {
                    const active = historyData.filter((h: any) => {
                        const isMatch = ['Pending', 'Approved', 'Inbound', 'Arrived', 'In Progress', 'Waiting for Pickup', 'Payment Due', 'Awaiting Payment Selection', 'Handover Pending', 'Scheduled', 'Active', 'Return Pending'].includes(h.status);
                        // console.log(`Trip ${h.id} [${h.status}] Match? ${isMatch}`);
                        return isMatch;
                    });
                    console.log('✅ Filtered Active Trips:', active);

                    setActiveTrips(active);
                    setHistory(historyData);
                } else {
                    console.warn('⚠️ History data is not an array:', historyData);
                }
            } catch (error) {
                console.warn('Auto-poll error for trips:', error);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(pollInterval);
    }, []);

    // Sync currentActiveTrip with activeTrips
    useEffect(() => {
        console.log('🔄 Sync Check | ActiveTrips:', activeTrips.length, 'Current:', currentActiveTrip?.id);

        if (activeTrips.length > 0) {
            if (!currentActiveTrip) {
                console.log('🚀 Auto-selecting first active trip:', activeTrips[0]);
                setCurrentActiveTrip(activeTrips[0]);
            } else {
                const updated = activeTrips.find(t => t.id === currentActiveTrip.id);
                if (updated) {
                    if (JSON.stringify(updated) !== JSON.stringify(currentActiveTrip)) {
                        console.log('♻️ Refreshing current active trip data');
                        setCurrentActiveTrip(updated);
                    }
                } else {
                    console.log('⚠️ Current trip no longer active, fallback to first');
                    setCurrentActiveTrip(activeTrips[0]);
                }
            }
        } else if (currentActiveTrip && activeTrips.length === 0) {
            console.log('🧹 Clearing current active trip (list empty)');
            setCurrentActiveTrip(null);
        }
    }, [activeTrips]);

    // Auto-poll marketplace listings every 10 seconds
    useEffect(() => {
        const pollInterval = setInterval(async () => {
            try {
                const [shareListings, hireListings] = await Promise.all([
                    ApiService.getAllRideSharePosts(),
                    ApiService.getAllForHirePosts()
                ]);
                setRideShareListings(shareListings || []);
                setSearchResults(shareListings || []);
                setForHireListings(hireListings || []);
            } catch (error) {
                console.warn('Auto-poll error for marketplace:', error);
            }
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(pollInterval);
    }, []);

    // Geocode Trip Coordinates when Active Trip Changes
    useEffect(() => {
        const updateTripCoords = async () => {
            if (currentActiveTrip) {
                const originCoords = await geocodeAddress(currentActiveTrip.origin);
                const destCoords = await geocodeAddress(currentActiveTrip.destination);

                setTripCoordinates({ origin: originCoords, destination: destCoords });

                if (originCoords && destCoords) {
                    const dist = calculateDistance(originCoords, destCoords);
                    setTripDistance(dist);
                }
            }
        };
        updateTripCoords();
    }, [currentActiveTrip]);

    // Fetch Driver Payout Details when Payment Modal Opens
    useEffect(() => {
        const fetchPaymentData = async () => {
            if ((isPaymentModalOpen || isHandoverModalOpen) && currentActiveTrip) {
                setIsLoadingDriverDetails(true);
                setPaymentError(null);

                try {
                    // Identify driver ID from the current trip
                    // Ideally, backend populates 'driver' object with 'id'
                    let driverId = '';

                    if (typeof currentActiveTrip.driver === 'object' && currentActiveTrip.driver?.id) {
                        driverId = currentActiveTrip.driver.id;
                    } else if (currentActiveTrip.driverId) {
                        // Fallback if driverId is at root level
                        driverId = currentActiveTrip.driverId;
                    }

                    if (!driverId) {
                        // Only warn if we truly can't find an ID, don't fallback to invalid UUID "D-001"
                        console.warn("Could not determine driver ID for payout details.");
                        setPaymentError("Unable to identify driver for payment.");
                        setIsLoadingDriverDetails(false);
                        return;
                    }

                    const payoutDetails = await ApiService.getDriverPayoutDetails(driverId);

                    if (payoutDetails) {
                        setDriverPayoutDetails(payoutDetails);
                    } else {
                        setPaymentError("Driver hasn't configured payout details yet.");
                    }
                } catch (error) {
                    console.error("Error fetching driver payout details:", error);
                    setPaymentError("Could not retrieve driver payment info.");
                } finally {
                    setIsLoadingDriverDetails(false);
                }
            }
        };
        fetchPaymentData();
    }, [isPaymentModalOpen, isHandoverModalOpen, currentActiveTrip]);

    // Fetch Supported Mobile Money Operators on Sync
    useEffect(() => {
        const fetchOperators = async () => {
            try {
                let operators: any = await ApiService.getMobileMoneyOperators();

                // Handle case where backend returns wrapped object { data: [...] }
                if (!Array.isArray(operators) && operators?.data && Array.isArray(operators.data)) {
                    console.log('⚠️ unpacking operators from wrapper');
                    operators = operators.data;
                }

                if (Array.isArray(operators) && operators.length > 0) {
                    console.log('✅ Loaded Mobile Money Operators:', operators);
                    setMobileMoneyOperators(operators);
                } else {
                    console.warn('⚠️ No operators loaded or invalid format:', operators);
                }
            } catch (err) {
                console.error('Failed to load mobile money operators:', err);
            }
        };
        fetchOperators();
    }, []);

    // Helper: normalize search results (API may return an array or a paginated object)
    const getSearchResultsArray = (results: any) => Array.isArray(results) ? results : (results?.results || []);

    // Helper: Check if vehicle matches selected category (case-insensitive, robust matching)
    const matchesVehicleCategory = (item: any, selectedCategory: string | null): boolean => {
        if (!selectedCategory) return true;

        const normalizedSelected = selectedCategory.toLowerCase().trim();
        const candidates: string[] = [];

        // Collect all possible vehicle information
        if (item.vehicle) {
            if (item.vehicle.category) candidates.push(String(item.vehicle.category));
            if (item.vehicle.make) candidates.push(String(item.vehicle.make));
            if (item.vehicle.model) candidates.push(String(item.vehicle.model));
            if (item.vehicle.type) candidates.push(String(item.vehicle.type));
        }
        if (item.category) candidates.push(String(item.category));
        if (item.vehicleType) candidates.push(String(item.vehicleType));
        if (item.title) candidates.push(String(item.title));
        if (item.description) candidates.push(String(item.description));
        if (item.driver && item.driver.vehicleModel) candidates.push(String(item.driver.vehicleModel));

        // Check if any candidate matches the selected category (case-insensitive)
        return candidates.some(candidate => {
            const normalizedCandidate = candidate.toLowerCase().trim();
            return normalizedCandidate.includes(normalizedSelected) ||
                normalizedSelected.includes(normalizedCandidate);
        });
    };

    // Filtered Listings
    const rideShareArray = getSearchResultsArray(searchResults);
    const filteredRideShares = rideShareArray.filter((post: any) => {
        const matchesSearch = (post.destination?.toLowerCase() || '').includes((searchTerm || '').toLowerCase()) ||
            (post.origin?.toLowerCase() || '').includes((searchTerm || '').toLowerCase());

        const matchesCategory = matchesVehicleCategory(post, selectedShareCategory);

        return matchesSearch && matchesCategory;
    });

    const filteredHireListings = forHireListings.filter(post => {
        const matchesSearch = (post.title?.toLowerCase() || '').includes((searchTerm || '').toLowerCase()) ||
            (post.category?.toLowerCase() || '').includes((searchTerm || '').toLowerCase());
        const matchesCategory = matchesVehicleCategory(post, selectedHireCategory);
        return matchesSearch && matchesCategory;
    });

    // UI Components
    const StatCard = ({ title, value, subValue, icon: Icon, onClick }: any) => (
        <div
            onClick={onClick}
            className={`bg-[#1E1E1E] p-6 rounded-3xl border border-[#2A2A2A] shadow-lg transition-all duration-300 group flex flex-col justify-between h-36
            ${onClick ? 'cursor-pointer hover:border-[#FACC15] hover:translate-y-[-4px] hover:shadow-[0_10px_30px_rgba(250,204,21,0.2)]' : ''}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
                    <div className="text-2xl font-bold text-white group-hover:text-[#FACC15] transition-colors">{value}</div>
                </div>
                <div className="p-3 bg-[#252525] rounded-xl text-[#FACC15] group-hover:bg-[#FACC15] group-hover:text-black transition-colors shadow-sm group-hover:shadow-md">
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className="text-xs text-gray-500 font-medium">{subValue}</div>
        </div>
    );


    const initiateRequest = (post: any, type: 'share' | 'hire') => {
        // Check for active ride share trips if trying to book a ride share
        if (type === 'share') {
            const activeRideShareTrips = activeTrips.filter((trip: any) =>
                trip.type === 'share' &&
                ['Pending', 'Approved', 'Scheduled', 'Inbound', 'Arrived', 'Boarded', 'In Progress', 'Awaiting Payment Selection'].includes(trip.status)
            );

            if (activeRideShareTrips.length > 0) {
                alert('You already have an active Ride Share trip. Please complete or cancel it before booking another Ride Share.');
                setNotifications(prev => [{
                    title: 'Booking Restricted',
                    msg: 'You can only have 1 active Ride Share trip at a time. Complete your current trip first.',
                    time: 'Just now',
                    unread: true
                }, ...prev]);
                return;
            }
        }

        // For Hire trips, no restriction - unlimited bookings allowed

        setSelectedBooking(post);
        setBookingType(type);
        setRequestStep('review');
        setPassengerPhone('');

        // Reset negotiation state
        setBookingMode('fixed');
        const basePrice = type === 'share' ? post.price : parseFloat(post.rate.replace(/[^0-9.]/g, ''));
        setOfferPrice(basePrice.toString());

        setIsRequestModalOpen(true);
    };

    const handleRequestSubmit = async () => {
        if (!selectedBooking) return;

        // Double-check for active ride share trips before submitting
        if (bookingType === 'share') {
            const activeRideShareTrips = activeTrips.filter((trip: any) =>
                trip.type === 'share' &&
                ['Pending', 'Approved', 'Scheduled', 'Inbound', 'Arrived', 'Boarded', 'In Progress', 'Awaiting Payment Selection'].includes(trip.status)
            );

            if (activeRideShareTrips.length > 0) {
                alert('You already have an active Ride Share trip. Cannot submit another request.');
                setIsRequestModalOpen(false);
                return;
            }
        }

        const newTrip = {
            id: Date.now(),
            date: selectedBooking.date || new Date().toLocaleDateString(),
            time: selectedBooking.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            origin: bookingType === 'share' ? selectedBooking.origin : selectedBooking.location,
            destination: bookingType === 'share' ? selectedBooking.destination : 'Requested Site',
            price: bookingMode === 'fixed'
                ? (bookingType === 'share' ? selectedBooking.price : parseFloat(selectedBooking.rate.replace(/[^0-9.]/g, '') || 0))
                : parseFloat(offerPrice),
            status: 'Pending',
            driver: selectedBooking.driverName || 'Assigning Driver...',
            timestamp: Date.now()
        };

        // Persist request to backend (share or hire) so driver sees pending approval
        try {
            if (bookingType === 'share') {
                if (bookingMode === 'negotiate') {
                    await ApiService.submitRideRequest({
                        ...selectedBooking,
                        offeredPrice: parseFloat(offerPrice) || selectedBooking.price,
                        message: '',
                        requestedDate: selectedBooking.date,
                        requestedTime: selectedBooking.time,
                        driverId: selectedBooking.driverId || selectedBooking.driver?.id
                    });
                } else {
                    await ApiService.submitRideRequest({
                        ...selectedBooking,
                        offeredPrice: selectedBooking.price,
                        message: '',
                        requestedDate: selectedBooking.date,
                        requestedTime: selectedBooking.time,
                        driverId: selectedBooking.driverId || selectedBooking.driver?.id
                    });
                }
            } else {
                // hire
                await ApiService.submitHireRequest({
                    vehicleId: selectedBooking.vehicleId || null,
                    offeredPrice: bookingMode === 'negotiate' ? parseFloat(offerPrice) || 0 : parseFloat((selectedBooking.rate || '').toString().replace(/[^0-9.]/g, '')) || 0,
                    startDate: selectedBooking.startDate || selectedBooking.date || new Date().toISOString(),
                    endDate: selectedBooking.endDate || null,
                    message: '',
                    driverId: selectedBooking.driverId || selectedBooking.driver?.id,
                    location: selectedBooking.location || selectedBooking.origin
                });
            }

            setHistory(prev => [newTrip, ...prev]);
            setRequestStep('success');
        } catch (err) {
            console.error('Failed to submit request to backend, falling back to local state', err);
            setHistory(prev => [newTrip, ...prev]);
            setRequestStep('success');
        }

        setTimeout(() => {
            setIsRequestModalOpen(false);
            setRequestStep('review');
            setSelectedBooking(null);
            // Note: We are NOT auto-switching tabs here based on user feedback
            // But a toast or notification would be good in a real app
        }, 1500);
    };

    // NOTE: handleConfirmBoarding has been REMOVED - logic is now inline in the modal button
    // If you see an error about handleConfirmBoarding not defined, do a HARD REFRESH (Ctrl+Shift+R)

    // Payment handlers for trip flow
    const handlePayNow = async (tripId: string) => {
        const trip = history.find(h => h.id === tripId);
        if (trip) {
            // currentActiveTrip is computed from activeTrips[0], so we just open the modal
            // The payment modal will use currentActiveTrip which should already be this trip
            setIsPaymentModalOpen(true);
            setPaymentStep('method');
        }
    };

    const handlePayAndEndTrip = async (tripId: string) => {
        const trip = history.find(h => h.id === tripId);
        if (trip) {
            // currentActiveTrip is computed from activeTrips[0], so we just open the modal
            // The payment modal will use currentActiveTrip which should already be this trip
            setIsPaymentModalOpen(true);
            setPaymentStep('method');
        }
    };

    const handleManualEndTrip = () => {
        if (currentActiveTrip) {
            const updatedHistory = history.map(h => h.id === currentActiveTrip.id ? { ...h, status: 'Payment Due' } : h);
            setHistory(updatedHistory);
            setIsPaymentModalOpen(true);
            setPaymentStep('method');
        }
    };

    const handleMessageDriver = async () => {
        if (!currentActiveTrip) return;

        let driverId = currentActiveTrip.driverId;
        if (!driverId && typeof currentActiveTrip.driver === 'object') {
            driverId = currentActiveTrip.driver.id; // Correctly access nested ID
        }

        // Final fallback if driverId is still missing
        if (!driverId) {
            console.warn("Driver ID missing from currentActiveTrip", currentActiveTrip);
            alert("Cannot message driver: Driver information is missing.");
            return;
        }

        try {
            let chat = conversations.find((c: any) => c.participants && c.participants.includes(driverId));

            if (!chat) {
                await ApiService.createConversation(driverId);
                const updatedConvs = await ApiService.getRiderConversations();
                setConversations(updatedConvs);
                chat = updatedConvs.find((c: any) => c.participants && c.participants.includes(driverId));
            }

            if (chat) {
                setActiveChatId(chat.id);
                setActiveTab('messages');
            } else {
                // If we created it but can't find it in list yet, just go to messages
                setActiveTab('messages');
            }
        } catch (e) {
            console.error("Failed to start chat", e);
            alert("Failed to open chat. Please try again.");
        }
    };

    // Payment handler with PayChangu API Integration
    const handleCompletePayment = async () => {
        if (!passengerPhone) {
            alert("Please enter your mobile money number.");
            return;
        }

        if (!currentActiveTrip) {
            alert("No active trip found.");
            return;
        }

        // Validate driver payout details
        if (!driverPayoutDetails) {
            alert("Driver payout details are not available. Please contact support.");
            return;
        }

        setPaymentStep('processing');
        setPaymentError(null);

        try {
            console.log('🔍 Debug: Available Operators:', mobileMoneyOperators);
            console.log('🔍 Debug: Selected Provider:', mobileProvider);

            // Get the provider ref ID based on selected mobile provider
            const selectedOp = mobileMoneyOperators.find(op =>
                op.name.toLowerCase().includes(mobileProvider.toLowerCase()) ||
                op.short_code.toLowerCase().includes(mobileProvider.toLowerCase())
            );

            // Fallback to what we have if not found in list, but prefer list value
            // HARDCODED FALLBACKS based on PayChangu API (Malawi)
            const AIRTEL_REF_ID = '20be6c20-adeb-4b5b-a7ba-0769820df4fb';
            const TNM_REF_ID = '27494cb5-ba9e-437f-a114-4e7a7686bcca';

            const providerRefId = selectedOp ? selectedOp.ref_id : (mobileProvider === 'airtel' ? AIRTEL_REF_ID : TNM_REF_ID);

            // Prepare payment data
            const paymentData: PaymentInitiationRequest = {
                rideId: currentActiveTrip.id,
                amount: currentActiveTrip.price,
                mobileNumber: passengerPhone,
                providerRefId: providerRefId
            };

            console.log(`Initiating PayChangu Payment...`);
            console.log(`Recipient (Driver): ${currentActiveTrip.driver}`, driverPayoutDetails);
            console.log(`Sender (You): ${passengerPhone}`);
            console.log(`Amount: MWK ${(currentActiveTrip?.price ?? 0).toLocaleString()}`);
            console.log(`Provider: ${mobileProvider}`);

            // Call PayChangu API
            const response = await ApiService.initiatePayment(paymentData);

            if (response.status === 'error') {
                throw new Error(response.message);
            }

            // Store charge ID for verification
            const chargeId = response.data?.charge_id;

            console.log('🔍 Debug: Payment Response:', response);
            console.log('🔍 Debug: Extracted Charge ID:', chargeId);

            if (chargeId) {
                setCurrentChargeId(chargeId);

                // Start polling for payment verification
                pollPaymentStatus(chargeId);
            } else {
                console.warn('⚠️ No charge_id found in response, falling back to simulated success.');
                // Fallback to simulated success for demo
                setTimeout(() => {
                    setPaymentStep('success');
                    completeTrip();
                }, 3000);
            }

        } catch (error) {
            console.error('Payment error:', error);
            setPaymentError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
            setPaymentStep('method');
        }
    };



    // Poll payment status
    const pollPaymentStatus = async (chargeId: string) => {
        let attempts = 0;
        const maxAttempts = 20; // Poll for up to 60 seconds (3s intervals)

        const poll = setInterval(async () => {
            attempts++;

            try {
                const verification = await ApiService.verifyPayment(chargeId);

                if (verification.status === 'success') {
                    clearInterval(poll);
                    setPaymentStep('success');
                    setTimeout(() => {
                        completeTrip();
                    }, 2500);
                } else if (verification.status === 'failed') {
                    clearInterval(poll);
                    setPaymentError('Payment failed. Please try again.');
                    setPaymentStep('method');
                } else if (attempts >= maxAttempts) {
                    clearInterval(poll);
                    setPaymentError('Payment verification timeout. Please check your transaction history.');
                    setPaymentStep('method');
                }
            } catch (error) {
                console.error('Verification error:', error);
                if (attempts >= maxAttempts) {
                    clearInterval(poll);
                    setPaymentError('Unable to verify payment. Please contact support.');
                    setPaymentStep('method');
                }
            }
        }, 3000);
    };

    // Helper function to complete trip
    const completeTrip = () => {
        if (currentActiveTrip) {
            const updatedHistory = history.map(h => h.id === currentActiveTrip.id ? { ...h, status: 'Completed' } : h);
            setHistory(updatedHistory);
        }
        setIsPaymentModalOpen(false);
        setPaymentStep('method');
        setPassengerPhone('');
        setCurrentChargeId(null);
    };

    const openRatingModal = (trip: any) => {
        setRatingTrip(trip);
        setSelectedRating(trip.rating || 0);
        setHoverRating(0);
        setRatingComment('');
        setIsRatingModalOpen(true);
    };

    const submitRating = () => {
        if (ratingTrip) {
            const updatedHistory = history.map(h => h.id === ratingTrip.id ? { ...h, rating: selectedRating } : h);
            setHistory(updatedHistory);
            setIsRatingModalOpen(false);
            setRatingTrip(null);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: messageInput,
            sender: 'user',
            timestamp: 'Just now'
        };

        const updatedConversations = conversations.map(c => {
            if (c.id === activeChatId) {
                return {
                    ...c,
                    messages: [...c.messages, newMessage],
                    lastMessage: messageInput,
                    time: 'Just now'
                };
            }
            return c;
        });

        setConversations(updatedConversations);
        setMessageInput('');
    };

    // Negotiation Handlers
    const handleSearch = async (pickup: string, destination: string) => {
        setIsSearching(true);
        try {
            // Client-side filtering since we have all posts
            const results = rideShareListings.filter(post => {
                const matchPickup = !pickup || (post.origin || '').toLowerCase().includes(pickup.toLowerCase());
                const matchDest = !destination || (post.destination || '').toLowerCase().includes(destination.toLowerCase());
                return matchPickup && matchDest;
            });
            setSearchResults(results);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleStartNegotiation = (ride: DriverRidePost) => {
        // Validation: Check for active ride share trips
        const activeRideShareTrips = activeTrips.filter((trip: any) =>
            trip.type === 'share' &&
            ['Pending', 'Approved', 'Scheduled', 'Inbound', 'Arrived', 'Boarded', 'In Progress', 'Awaiting Payment Selection'].includes(trip.status)
        );

        if (activeRideShareTrips.length > 0) {
            alert('You already have an active Ride Share trip. Please complete or cancel it before booking another Ride Share.');
            setNotifications(prev => [{
                title: 'Booking Restricted',
                msg: 'You can only have 1 active Ride Share trip at a time.',
                time: 'Just now',
                unread: true
            }, ...prev]);
            return;
        }

        setNegotiationRide(ride);
        setNegotiationHistory([]); // Initialize or fetch history
        setShowNegotiationModal(true);
    };

    const handleSubmitOffer = async (offerPrice: number, message: string) => {
        if (!negotiationRide) return;
        try {
            // Submit offer
            const newRide = await ApiService.submitRideRequest({
                ...negotiationRide,
                offeredPrice: offerPrice,
                message
            });

            // Immediately update local state specific to Active Trips
            // Add status 'Pending' if not present (usually it is from backend)
            const rideWithStatus = { ...newRide, status: 'Pending', type: negotiationRide.type || 'share' };

            setHistory(prev => [rideWithStatus, ...prev]);
            setActiveTrips(prev => [rideWithStatus, ...prev]);

            // Close modal and switch to active trips tab to show the user the pending request
            setShowNegotiationModal(false);
            setNegotiationRide(null);
            setActiveTab('trips');

            // Helper notification
            setNotifications(prev => [{
                title: 'Request Sent',
                msg: `Your ${rideWithStatus.type === 'hire' ? 'offer' : 'request'} has been sent to the driver.`,
                time: 'Just now',
                unread: true
            }, ...prev]);

        } catch (error) {
            console.error("Offer failed", error);
            alert("Failed to submit request. Please try again.");
        }
    };

    const handlePaymentTimingSelection = async (timing: 'now' | 'pickup') => {
        if (!paymentTimingRide) return;

        try {
            if (timing === 'now') {
                // Open the main payment modal
                setIsPaymentTimingModalOpen(false);
                setApprovedRide(paymentTimingRide); // Set as approved ride for the payment modal
                setShowPaymentModal(true);
            } else {
                // Pay on Pickup: Update status to Scheduled
                await ApiService.selectPaymentMethod(paymentTimingRide.id, 'physical');
                setIsPaymentTimingModalOpen(false);
                setNotifications(prev => [{
                    title: 'Payment Method Confirmed',
                    msg: 'You have selected to Pay on Pickup. Please pay the driver when they arrive.',
                    time: 'Just now',
                    unread: true
                }, ...prev]);

                // Update local state
                setHistory(prev => prev.map(h => h.id === paymentTimingRide.id ? { ...h, status: 'Scheduled' } : h));
                setActiveTrips(prev => prev.map(t => t.id === paymentTimingRide.id ? { ...t, status: 'Scheduled' } : t));
                setActiveTab('active-trip');
            }
        } catch (error) {
            console.error("Payment timing selection failed", error);
            alert("Failed to update payment option. Please try again.");
        }
    };

    const handlePaymentSelection = async (paymentType: 'online' | 'physical' | 'later') => {
        if (!approvedRide) return;
        try {
            if (paymentType === 'later') {
                // Payment deferred: mark ride as deferred/awaiting payment and proceed to pickup flow
                // If backend supports a defer endpoint, call it instead. For now call selectPaymentMethod with 'later' if supported
                try {
                    await ApiService.selectPaymentMethod(approvedRide.id, 'later' as any);
                } catch (e) {
                    // If API doesn't support 'later', just log and continue
                    console.warn('Backend does not support pay-later endpoint, continuing to pickup flow', e);
                }
            } else {
                await ApiService.selectPaymentMethod(approvedRide.id, paymentType);
            }

            setShowPaymentModal(false);
            // Send trip directly to tracking tab without showing map modal
            setPickupRide(approvedRide);
            setActiveTab('active-trip');
        } catch (error) {
            console.error("Payment selection failed", error);
        }
    };

    // Handle payment selection for handover (hire jobs)
    const handleHandoverPaymentSelection = async () => {
        if (!currentActiveTrip) return;

        // 1. Mobile Money Flow
        if (handoverPaymentMethod === 'mobile') {
            // Validate mobile money details
            if (!passengerPhone) {
                alert("Please enter your mobile money number.");
                return;
            }

            setPaymentStep('processing');
            try {
                // Get provider ref
                const selectedOp = mobileMoneyOperators.find(op =>
                    op.name.toLowerCase().includes(mobileProvider.toLowerCase()) ||
                    op.short_code.toLowerCase().includes(mobileProvider.toLowerCase())
                );
                const AIRTEL_REF_ID = '20be6c20-adeb-4b5b-a7ba-0769820df4fb';
                const TNM_REF_ID = '27494cb5-ba9e-437f-a114-4e7a7686bcca';
                const providerRefId = selectedOp ? selectedOp.ref_id : (mobileProvider === 'airtel' ? AIRTEL_REF_ID : TNM_REF_ID);

                const paymentData: PaymentInitiationRequest = {
                    rideId: currentActiveTrip.id,
                    amount: currentActiveTrip.price || currentActiveTrip.acceptedPrice || 0,
                    mobileNumber: passengerPhone,
                    providerRefId: providerRefId
                };

                const response = await ApiService.initiatePayment(paymentData);
                if (response.status === 'error') throw new Error(response.message);

                const chargeId = response.data?.charge_id;

                if (chargeId) {
                    // Simulate payment verification
                    setTimeout(async () => {
                        await ApiService.completeHandover(currentActiveTrip.id.toString(), 'mobile');
                        setPaymentStep('success');
                        setTimeout(() => {
                            setIsHandoverModalOpen(false);
                            setPaymentStep('method');
                        }, 2000);
                    }, 3000);
                } else {
                    setPaymentStep('success');
                    setTimeout(() => setIsHandoverModalOpen(false), 2000);
                }

            } catch (error) {
                console.error("Handover payment failed", error);
                alert('Payment failed. Please try again.');
                setPaymentStep('method');
            }
            return;
        }

        // 2. Manual Flows (Bank / Cash / Pickup)
        try {
            await ApiService.completeHandover(currentActiveTrip.id.toString(), handoverPaymentMethod);

            setIsHandoverModalOpen(false);
            setNotifications(prev => [{
                title: 'Handover Confirmed!',
                msg: `Payment method confirmed: ${handoverPaymentMethod}. Vehicle is ready.`,
                time: 'Just now',
                unread: true
            }, ...prev]);

            // Optimistic Update
            const updated = { ...currentActiveTrip, status: 'Active', paymentMethod: handoverPaymentMethod };
            setCurrentActiveTrip(updated);
            setActiveTrips(prev => prev.map(t => t.id === currentActiveTrip.id ? updated : t));
            setHistory(prev => prev.map(t => t.id === currentActiveTrip.id ? updated : t));
        } catch (error) {
            console.error("Handover payment selection failed", error);
            alert('Failed to confirm handover payment. Please try again.');
        }
    };

    // Manual pickup flow - user confirms pickup/drop-off/boarding in tracking tab
    const handleManualPickupConfirm = async (rideId: string) => {
        try {
            await ApiService.confirmPickup(rideId);
            console.log('Pickup confirmed manually for ride:', rideId);
        } catch (error) {
            console.error("Pickup confirmation failed", error);
        }
    };

    // Handle rider confirming they have boarded the vehicle
    const handleConfirmBoarding = async () => {
        if (!currentActiveTrip) return;

        try {
            // Call API to confirm boarding
            await ApiService.confirmBoarding(currentActiveTrip.id.toString());

            // Update local state to 'Boarded'
            setActiveTrips(prev => prev.map(t =>
                t.id === currentActiveTrip.id ? { ...t, status: 'Boarded' } : t
            ));

            // Update current active trip
            if (currentActiveTrip) {
                const updatedTrip = { ...currentActiveTrip, status: 'Boarded' };
                setCurrentActiveTrip(updatedTrip);
            }

            // Add notification
            setNotifications(prev => [{
                title: 'Boarding Confirmed',
                msg: 'You have confirmed boarding. The driver will start the trip shortly.',
                time: 'Just now',
                unread: true
            }, ...prev]);

            console.log('Boarding confirmed for ride:', currentActiveTrip.id);
        } catch (error) {
            console.error("Boarding confirmation failed", error);
            alert('Failed to confirm boarding. Please try again.');
        }
    };

    const activeChat = conversations.find(c => c.id === activeChatId);

    const getCalculatedTotal = () => {
        if (!selectedBooking && !currentActiveTrip) return 0;

        if (currentActiveTrip) return currentActiveTrip.price;

        const base = bookingMode === 'fixed'
            ? (bookingType === 'share' ? selectedBooking.price : parseFloat(selectedBooking.rate.replace(/[^0-9.]/g, '') || 0))
            : parseFloat(offerPrice) || 0;
        return base + 500; // Service fee MWK 500
    };

    return (
        <div className="flex h-screen bg-[#121212] text-white font-sans overflow-hidden selection:bg-[#FACC15] selection:text-black">

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:relative z-50 w-64 h-full bg-[#1E1E1E] border-r border-[#2A2A2A] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="h-20 flex items-center px-8 border-b border-[#2A2A2A]">
                    <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center mr-3">
                        <SteeringWheelIcon className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-xl font-bold tracking-wide">Ridex</span>
                    <button className="ml-auto lg:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6 p-3 bg-[#252525] rounded-xl border border-[#333]">
                        <img src={profile.avatar} alt="Profile" className="w-10 h-10 rounded-full border border-[#FACC15]" />
                        <div>
                            <div className="text-sm font-bold text-white">{profile.name}</div>
                            <div className="flex items-center gap-1 text-[#FACC15] text-xs">
                                <StarIcon className="w-3 h-3" />
                                <span className="font-bold">{profile.rating}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <button onClick={() => setActiveTab('overview')} className={`flex items-center w-full px-4 py-3 rounded-xl font-bold transition-transform hover:scale-105 ${activeTab === 'overview' ? 'text-black bg-[#FACC15]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <HomeIcon className="w-5 h-5 mr-3" /> Marketplace
                    </button>

                    <button
                        onClick={() => setActiveTab('active-trip')}
                        className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'active-trip' ? 'text-white bg-[#2A2A2A] border border-[#FACC15]/30' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}
                    >
                        <NavigationIcon className={`w-5 h-5 mr-3 ${activeTab === 'active-trip' ? 'text-[#FACC15]' : ''}`} />
                        Active Trip
                        {activeTrips.length > 0 && <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
                    </button>

                    <button onClick={() => setActiveTab('statistics')} className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'statistics' ? 'text-white bg-[#2A2A2A]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <DashboardIcon className="w-5 h-5 mr-3" /> Statistics
                    </button>
                    <button onClick={() => setActiveTab('trips')} className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'trips' ? 'text-white bg-[#2A2A2A]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <BriefcaseIcon className="w-5 h-5 mr-3" /> My Trips
                    </button>
                    <button onClick={() => setActiveTab('financials')} className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'financials' ? 'text-white bg-[#2A2A2A]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <WalletIcon className="w-5 h-5 mr-3" /> Financials
                    </button>
                    <button onClick={() => setActiveTab('distance')} className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'distance' ? 'text-white bg-[#2A2A2A]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <MapIcon className="w-5 h-5 mr-3" /> Distance
                    </button>
                    <button onClick={() => setActiveTab('messages')} className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'messages' ? 'text-white bg-[#2A2A2A]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <ChatBubbleIcon className="w-5 h-5 mr-3" /> Messages
                    </button>
                </nav>

                <div className="p-4 border-t border-[#2A2A2A]">
                    <button onClick={onLogout} className="flex items-center w-full px-4 py-3 text-gray-400 hover:text-[#FACC15] hover:bg-[#2A2A2A] rounded-xl font-medium transition-colors">
                        <span className="mr-3">Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">

                {/* Header */}
                <header className="bg-white dark:bg-dark-800 shadow-sm sticky top-0 z-20 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between transition-colors duration-300">
                    <div className="flex items-center">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                            <MenuIcon className="h-6 w-6" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            {activeTab === 'overview' ? 'Dashboard' :
                                activeTab === 'messages' ? 'Messages' :
                                    activeTab === 'trips' ? 'My Trips' :
                                        activeTab === 'active-trip' ? 'Active Trip' :
                                            activeTab === 'financials' ? 'Total Spent' :
                                                activeTab === 'statistics' ? 'Statistics' :
                                                    'Distance Analytics'}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />

                        <div className="flex items-center space-x-2">
                            <img className="h-8 w-8 rounded-full" src="https://ui-avatars.com/api/?name=Rider+User" alt="User" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">Rider</span>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className={`flex-1 overflow-y-auto ${activeTab === 'active-trip' ? 'p-0' : 'p-6 lg:p-8'}`}>

                    {/* --- OVERVIEW (MARKETPLACE) TAB --- */}
                    {activeTab === 'overview' && (
                        <div className="flex flex-col h-full">
                            {/* Top Section: Location & Search */}
                            <div className="bg-white dark:bg-[#1E1E1E] p-4 border-b border-gray-200 dark:border-[#2A2A2A] flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                    <LocationMarkerIcon className="w-5 h-5 text-[#FACC15]" />
                                    <span className="font-bold">Mzuzu, Malawi (Current Location)</span>
                                </div>
                                <div className="relative w-full md:w-96">
                                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search ride, vehicle type, or destination..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#252525] border border-transparent focus:border-[#FACC15] rounded-xl outline-none text-gray-900 dark:text-white transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Marketplace Tabs */}
                            <div className="flex border-b border-gray-200 dark:border-[#2A2A2A]">
                                <button
                                    onClick={() => setMarketTab('share')}
                                    className={`flex-1 py-4 font-bold text-center transition-colors ${marketTab === 'share' ? 'text-[#FACC15] border-b-2 border-[#FACC15]' : 'text-gray-500 hover:text-white'}`}
                                >
                                    🚗 Rideshare
                                </button>
                                <button
                                    onClick={() => setMarketTab('hire')}
                                    className={`flex-1 py-4 font-bold text-center transition-colors ${marketTab === 'hire' ? 'text-[#FACC15] border-b-2 border-[#FACC15]' : 'text-gray-500 hover:text-white'}`}
                                >
                                    🚚 For Hire
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                                {marketTab === 'share' ? (
                                    <div className="space-y-6">
                                        {/* Location Search */}
                                        <div className="bg-[#252525] p-6 rounded-3xl border border-[#333]">
                                            <h3 className="text-lg font-bold text-white mb-4">Where to?</h3>
                                            <LocationSearch onSearch={handleSearch} isLoading={isSearching} />
                                        </div>

                                        {/* Vehicle Type Filter (Share) */}
                                        <div className="flex flex-wrap gap-2 mt-4 mb-3">
                                            <button
                                                onClick={() => { setSelectedShareCategory(null); updateQueryParam('shareCat', null); }}
                                                className={`px-3 py-1 rounded-xl font-medium text-sm transition-all ${selectedShareCategory === null
                                                    ? 'bg-[#FACC15] text-black'
                                                    : 'bg-[#252525] text-gray-400 hover:bg-[#2A2A2A] hover:text-white'
                                                    }`}
                                            >
                                                {getCategoryIcon('All')}
                                                All Categories
                                            </button>
                                            {VEHICLE_HIRE_CATEGORIES.flatMap(m => m.categories).map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => { setSelectedShareCategory(cat.name); updateQueryParam('shareCat', cat.name); }}
                                                    className={`px-3 py-1 rounded-xl font-medium text-sm transition-all ${selectedShareCategory === cat.name
                                                        ? 'bg-[#FACC15] text-black'
                                                        : 'bg-[#252525] text-gray-400 hover:bg-[#2A2A2A] hover:text-white'
                                                        }`}
                                                >
                                                    {getCategoryIcon(cat.name)}{cat.name}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Search Results */}
                                        {rideShareArray.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-4">Available Rides</h3>
                                                <div className="space-y-3">
                                                    {filteredRideShares.map((ride: any) => (
                                                        <div key={ride.id} className="bg-[#252525] p-4 rounded-2xl border border-[#333] flex justify-between items-center hover:border-[#FACC15]/50 transition-colors cursor-pointer" onClick={() => handleStartNegotiation(ride)}>
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-[#1E1E1E] rounded-full flex items-center justify-center text-gray-400">
                                                                    <CarIcon className="w-6 h-6" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-white">{ride.origin} → {ride.destination}</div>
                                                                    <div className="text-sm text-gray-400">{ride.date} • {ride.time}</div>
                                                                    <div className="text-xs text-[#FACC15] mt-1">{ride.negotiable ? 'Negotiable' : 'Fixed Price'}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-bold text-[#FACC15] text-lg">MK {ride.price.toLocaleString()}</div>
                                                                <div className="text-xs text-gray-500">{ride.seats} seats left</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Map removed as per user request */}
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {/* Category Filter Tags */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <button
                                                onClick={() => { setSelectedHireCategory(null); updateQueryParam('hireCat', null); }}
                                                className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedHireCategory === null
                                                    ? 'bg-[#FACC15] text-black'
                                                    : 'bg-[#252525] text-gray-400 hover:bg-[#2A2A2A] hover:text-white'
                                                    }`}
                                            >
                                                {getCategoryIcon('All')}All Categories
                                            </button>
                                            {VEHICLE_HIRE_CATEGORIES.flatMap(mainCat => mainCat.categories).map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => { setSelectedHireCategory(cat.name); updateQueryParam('hireCat', cat.name); }}
                                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedHireCategory === cat.name
                                                        ? 'bg-[#FACC15] text-black'
                                                        : 'bg-[#252525] text-gray-400 hover:bg-[#2A2A2A] hover:text-white'
                                                        }`}
                                                >
                                                    {getCategoryIcon(cat.name)}{cat.name}
                                                </button>
                                            ))}
                                        </div>

                                        {/* For Hire Listings */}
                                        {/* Rider's pending requests (if any) */}
                                        {pendingRequestsList.length > 0 && (
                                            <div className="mb-4 p-4 bg-[#151515] rounded-xl border border-[#2A2A2A]">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-sm text-gray-300 font-bold">Your Pending Requests</div>
                                                    <div className="text-xs text-gray-500">{pendingRequestsList.length} waiting</div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {pendingRequestsList.slice(0, 3).map((r: any) => (
                                                        <div key={r.id} className="p-3 bg-[#1A1A1A] rounded-lg border border-[#333]">
                                                            <div className="text-xs text-gray-400">{r.type === 'hire' ? 'Hire Request' : 'Ride Request'}</div>
                                                            <div className="font-bold text-white text-sm">{r.type === 'hire' ? r.origin || r.location : `${r.origin} → ${r.destination}`}</div>
                                                            <div className="text-xs text-gray-500 mt-1">Status: {r.negotiationStatus || r.status}</div>
                                                            {/* New: Price Display */}
                                                            <div className="text-xs text-[#FACC15] font-bold mt-1">
                                                                MWK {(r.offeredPrice || parseFloat(r.rate?.replace(/[^0-9.]/g, '') || '0') || 0).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {filteredHireListings.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {filteredHireListings.map((post) => (
                                                    <div
                                                        key={post.id}
                                                        onClick={() => initiateRequest(post, 'hire')}
                                                        className="bg-[#252525] p-6 rounded-2xl border border-[#333] hover:border-[#FACC15] transition-all cursor-pointer group"
                                                    >
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="w-12 h-12 bg-[#1E1E1E] rounded-xl flex items-center justify-center text-[#FACC15] group-hover:bg-[#FACC15] group-hover:text-black transition-colors">
                                                                <CarIcon className="w-6 h-6" />
                                                            </div>
                                                            <div className="text-xs bg-[#1E1E1E] px-3 py-1 rounded-full text-gray-400">
                                                                {post.category}
                                                            </div>
                                                        </div>
                                                        <div className="font-bold text-white text-lg mb-2">{post.title}</div>
                                                        <div className="text-sm text-gray-400 mb-4">{post.location}</div>
                                                        <div className="flex justify-between items-center">
                                                            <div className="text-[#FACC15] font-bold text-xl">{post.rate}</div>
                                                            <button className="px-4 py-2 bg-[#FACC15] text-black font-medium rounded-lg group-hover:bg-[#EAB308] transition-colors">
                                                                Request
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="w-16 h-16 bg-[#252525] rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <CarIcon className="w-8 h-8 text-gray-600" />
                                                </div>
                                                <p className="text-gray-400">No vehicles available in this category</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- ACTIVE TRIP TAB --- */}
                    {activeTab === 'active-trip' && (
                        <div className="h-full w-full flex flex-col md:flex-row relative">
                            {currentActiveTrip ? (
                                <>
                                    {/* ARRIVED MODAL / OVERLAY */}
                                    {currentActiveTrip.status === 'Arrived' && (
                                        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                                            <div className="bg-[#1E1E1E] border-2 border-[#FACC15] rounded-3xl p-8 max-w-md text-center shadow-[0_0_50px_rgba(250,204,21,0.2)] animate-fadeIn">
                                                <div className="w-20 h-20 bg-[#FACC15] rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                                    <CarIcon className="w-10 h-10 text-black" />
                                                </div>
                                                <h2 className="text-2xl font-bold text-white mb-2">Driver has Arrived!</h2>
                                                <p className="text-gray-400 mb-8">
                                                    Your driver is waiting at the pickup location. Please confirm when you have boarded the vehicle.
                                                </p>
                                                <button
                                                    onClick={handleConfirmBoarding}
                                                    className="w-full py-4 bg-[#FACC15] text-black font-bold text-lg rounded-xl hover:bg-[#EAB308] transition-transform transform hover:scale-105 shadow-lg"
                                                >
                                                    Yes, I have Boarded
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Left Panel: Trip Details */}
                                    <div className="w-full md:w-96 bg-[#121212] border-r border-[#2A2A2A] flex flex-col h-full z-20 shadow-xl">
                                        <div className="p-6 border-b border-[#2A2A2A]">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-12 h-12 rounded-full bg-[#252525] flex items-center justify-center border border-[#333]">
                                                    <CarIcon className="w-6 h-6 text-[#FACC15]" />
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-bold text-white">Current Ride</h2>
                                                    <p className="text-xs text-gray-400">Trip ID #{currentActiveTrip.id}</p>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="bg-[#252525] rounded-xl p-4 mb-6 border border-[#333]">
                                                <div className="text-xs text-gray-500 uppercase font-bold mb-2">Status</div>
                                                <div className="flex items-center gap-3">
                                                    <span className="relative flex h-3 w-3">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                                    </span>
                                                    <span className="text-green-400 font-bold text-lg leading-tight">
                                                        {currentActiveTrip.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {currentActiveTrip.status === 'Pending' ? 'Waiting for driver approval.' :
                                                        currentActiveTrip.status === 'Approved' ? 'Trip approved! Ready to schedule.' :
                                                            currentActiveTrip.status === 'Scheduled' ? 'Trip scheduled. Waiting for driver.' :
                                                                currentActiveTrip.status === 'Handover Pending' ? 'Driver is waiting. Please confirm handover.' :
                                                                    currentActiveTrip.status === 'Inbound' ? 'Driver is on the way.' :
                                                                        currentActiveTrip.status === 'Arrived' ? 'Driver is waiting for you.' :
                                                                            currentActiveTrip.status === 'In Progress' ? 'Trip is in progress.' :
                                                                                currentActiveTrip.status === 'Payment Due' ? 'Trip complete. Please pay.' :
                                                                                    'Waiting for driver update.'}
                                                </p>
                                            </div>

                                            {/* Route Info */}
                                            <div className="space-y-6 relative pl-4 border-l-2 border-[#333] ml-2">
                                                <div className="relative">
                                                    <div className="absolute -left-[21px] top-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-[#121212] shadow-sm"></div>
                                                    <p className="text-xs text-gray-500 uppercase font-bold">Pickup</p>
                                                    <p className="text-white font-medium">{currentActiveTrip.origin}</p>
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute -left-[21px] top-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#121212] shadow-sm"></div>
                                                    <p className="text-xs text-gray-500 uppercase font-bold">Destination</p>
                                                    <p className="text-white font-medium">{currentActiveTrip.destination}</p>
                                                </div>
                                            </div>

                                            {/* Distance Display */}
                                            {tripDistance && (
                                                <div className="mt-6 p-4 bg-[#252525] rounded-xl border border-[#333] flex items-center justify-between">
                                                    <div className="text-xs text-gray-500 uppercase font-bold">Total Distance</div>
                                                    <div className="text-xl font-bold text-[#FACC15]">{tripDistance} km</div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 flex-1 overflow-y-auto pb-6">
                                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Driver Details</h3>
                                            <div className="flex items-center gap-4 mb-6 bg-[#252525] p-4 rounded-xl border border-[#333]">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${typeof currentActiveTrip.driver === 'string' ? currentActiveTrip.driver : currentActiveTrip.driver?.name || 'Driver'}&background=random`}
                                                    alt="Driver"
                                                    className="w-12 h-12 rounded-full border-2 border-[#FACC15]"
                                                />
                                                <div>
                                                    <div className="text-white font-bold">{typeof currentActiveTrip.driver === 'string' ? currentActiveTrip.driver : currentActiveTrip.driver?.name || 'Unknown Driver'}</div>
                                                    <div className="text-xs text-gray-400">Toyota Corolla • MC 9928</div>
                                                    <div className="flex items-center gap-1 text-[#FACC15] text-xs mt-1">
                                                        <StarIcon className="w-3 h-3" /> 4.9
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <button
                                                    onClick={handleMessageDriver}
                                                    className="w-full py-3 bg-[#FACC15] text-black rounded-xl font-bold text-sm hover:bg-[#EAB308] transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <ChatBubbleIcon className="w-4 h-4" /> Message Driver
                                                </button>
                                            </div>

                                            {/* Location Precision Indicator */}
                                            {(typeof currentActiveTrip.driver === 'object' && currentActiveTrip.driver.precision) && (
                                                <div className="pt-6 border-t border-[#2A2A2A]">
                                                    <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${currentActiveTrip.driver.precision === 'precise' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                                                        <span className={`w-2 h-2 rounded-full ${currentActiveTrip.driver.precision === 'precise' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                                        {currentActiveTrip.driver.precision === 'precise' ? '✓ Precise GPS Location' : '⚠ Approximate IP Location'}
                                                    </div>
                                                    {currentActiveTrip.driver.precision === 'approximate' && (
                                                        <p className="text-[10px] text-gray-500 mt-2">Driver's location is approximate based on IP address. Precise GPS tracking was not available.</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Trip Actions - Always show if active trip exists */}
                                            {currentActiveTrip && (
                                                <div className="pt-6 mt-6 border-t border-[#2A2A2A]">
                                                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Trip Actions</h3>
                                                    <div className="space-y-3">

                                                        {/* PENDING: Cancel Request */}
                                                        {currentActiveTrip.status === 'Pending' && (
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm('Are you sure you want to cancel this request?')) {
                                                                        try {
                                                                            await ApiService.cancelRide(currentActiveTrip.id);
                                                                            setCurrentActiveTrip(null);
                                                                            setActiveTab('overview');
                                                                            setNotifications(prev => [{
                                                                                title: 'Request Cancelled',
                                                                                msg: 'Your ride request has been cancelled.',
                                                                                time: 'Just now',
                                                                                unread: true
                                                                            }, ...prev]);
                                                                        } catch (e) {
                                                                            console.error(e);
                                                                            alert('Failed to cancel request');
                                                                        }
                                                                    }
                                                                }}
                                                                className="w-full py-3 bg-red-600/20 text-red-500 border border-red-500/50 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                ✕ Cancel Request
                                                            </button>
                                                        )}
                                                        {/* FOR HIRE: Handover Pending - Payment Required (show modal instead) */}
                                                        {currentActiveTrip.type === 'hire' && currentActiveTrip.status === 'Handover Pending' && (
                                                            <div className="bg-orange-500/20 border-2 border-orange-500 rounded-xl p-4 animate-pulse">
                                                                <p className="text-xs text-orange-300 font-bold mb-1">🔄 Handover Awaiting Payment</p>
                                                                <p className="text-xs text-gray-200 mb-3">Driver is ready! Select your payment method to complete the handover.</p>
                                                                <button
                                                                    onClick={() => {
                                                                        console.log('🎯 Manually opening handover modal from Trip Actions button');
                                                                        setIsHandoverModalOpen(true);
                                                                    }}
                                                                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg font-bold text-sm hover:from-orange-500 hover:to-orange-400 transition-all shadow-lg animate-bounce"
                                                                >
                                                                    💳 Open Payment Modal
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* FOR HIRE: Active (Handover Completed) */}
                                                        {currentActiveTrip.type === 'hire' && currentActiveTrip.status === 'Active' && (
                                                            <div className="space-y-3">
                                                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 animate-pulse">
                                                                    <p className="text-xs text-green-400 font-bold mb-1">✓ Waiting for Return</p>
                                                                    <p className="text-xs text-gray-300">You have the vehicle. Please request return when finished.</p>
                                                                </div>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (confirm('Are you ready to return the vehicle to the dealership?')) {
                                                                            try {
                                                                                await ApiService.requestVehicleReturn(currentActiveTrip.id);
                                                                                // Optimistic update
                                                                                const updated = { ...currentActiveTrip, status: 'Return Pending' };
                                                                                setCurrentActiveTrip(updated);
                                                                            } catch (e) {
                                                                                console.error(e);
                                                                                alert('Failed to request return');
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="w-full py-3 bg-[#FACC15] text-black rounded-xl font-bold text-sm hover:bg-[#EAB308] transition-colors shadow-lg"
                                                                >
                                                                    🔄 Return Vehicle to Dealership
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* FOR HIRE: Return Pending */}
                                                        {currentActiveTrip.type === 'hire' && currentActiveTrip.status === 'Return Pending' && (
                                                            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 animate-pulse">
                                                                <p className="text-xs text-blue-400 font-bold mb-1">⏳ Return Requested</p>
                                                                <p className="text-xs text-gray-300">Waiting for driver to confirm vehicle return.</p>
                                                            </div>
                                                        )}

                                                        {/* FOR HIRE: Payment Options (Original Approved Status) */}
                                                        {currentActiveTrip.type === 'hire' && currentActiveTrip.status === 'Approved' && (
                                                            <>
                                                                <div className="bg-[#252525] border border-[#FACC15]/30 rounded-xl p-4 mb-3">
                                                                    <p className="text-xs text-gray-400 mb-2">Hire approved! Choose payment option:</p>
                                                                    <p className="text-sm font-bold text-white">MWK {currentActiveTrip.price || 0}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        // Ensure we have pricing
                                                                        const price = currentActiveTrip.acceptedPrice || currentActiveTrip.price || 0;
                                                                        const rideWithPrice = { ...currentActiveTrip, price };

                                                                        // Set approvedRide for consistency (though modal uses currentActiveTrip mostly)
                                                                        setApprovedRide(rideWithPrice);
                                                                        setCurrentActiveTrip(rideWithPrice); // Ensure price is set in current trip

                                                                        setIsPaymentModalOpen(true);
                                                                        setPaymentStep('method');
                                                                    }}
                                                                    className="w-full py-3 bg-[#FACC15] text-black rounded-xl font-bold text-sm hover:bg-[#EAB308] transition-colors shadow-lg flex items-center justify-center gap-2"
                                                                >
                                                                    <CreditCardIcon className="w-4 h-4" /> Pay Now
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        handlePaymentSelection('later');
                                                                        setNotifications(prev => [{
                                                                            title: 'Payment Deferred',
                                                                            msg: 'You will pay when you pick up the vehicle.',
                                                                            time: 'Just now',
                                                                            unread: true
                                                                        }, ...prev]);
                                                                    }}
                                                                    className="w-full py-3 border-2 border-[#FACC15] text-[#FACC15] rounded-xl font-bold text-sm hover:bg-[#FACC15]/10 transition-colors flex items-center justify-center gap-2"
                                                                >
                                                                    Pay on Pickup
                                                                </button>
                                                            </>
                                                        )}

                                                        {/* RIDE SHARE: Manual Pickup Confirmation */}
                                                        {currentActiveTrip.type === 'share' && (currentActiveTrip.status === 'Scheduled' || currentActiveTrip.status === 'Inbound' || currentActiveTrip.status === 'Arrived') && (
                                                            <button
                                                                onClick={() => handleManualPickupConfirm(currentActiveTrip.id)}
                                                                className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <CarIcon className="w-4 h-4" /> Confirm Pickup
                                                            </button>
                                                        )}

                                                        {/* RIDE SHARE: In Progress Actions */}
                                                        {currentActiveTrip.type === 'share' && currentActiveTrip.status === 'In Progress' && (
                                                            <div className="space-y-3">
                                                                <button
                                                                    onClick={() => {
                                                                        setIsPaymentModalOpen(true);
                                                                        setPaymentStep('method');
                                                                    }}
                                                                    className="w-full py-3 bg-[#252525] text-white border border-[#333] rounded-xl font-bold text-sm hover:bg-[#333] transition-colors"
                                                                >
                                                                    Proceed to Payment
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setIsPaymentModalOpen(true);
                                                                        setPaymentStep('method');
                                                                        // Logic to end trip after payment will be handled in payment success
                                                                    }}
                                                                    className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20"
                                                                >
                                                                    Pay & End Trip
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* RIDE SHARE: Driver Ended Trip (Payment Due) */}
                                                        {currentActiveTrip.status === 'Payment Due' && (
                                                            <div className="animate-pulse">
                                                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-3">
                                                                    <p className="text-xs text-red-400 font-bold mb-1">Trip Ended by Driver</p>
                                                                    <p className="text-xs text-gray-300">Please confirm the trip has ended and complete your payment.</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        setIsPaymentModalOpen(true);
                                                                        setPaymentStep('method');
                                                                    }}
                                                                    className="w-full py-3 bg-[#FACC15] text-black rounded-xl font-bold text-sm hover:bg-[#EAB308] transition-colors shadow-lg"
                                                                >
                                                                    Confirm End & Pay
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Show helper text when no actions match current status */}
                                                    {!(
                                                        (currentActiveTrip.type === 'hire' && currentActiveTrip.status === 'Approved') ||
                                                        (currentActiveTrip.type === 'share' && ['Scheduled', 'Inbound', 'Arrived'].includes(currentActiveTrip.status)) ||
                                                        (currentActiveTrip.type === 'share' && currentActiveTrip.status === 'In Progress') ||
                                                        (currentActiveTrip.status === 'Payment Due')
                                                    ) && (
                                                            <p className="text-xs text-gray-500 italic">No actions available for this status.</p>
                                                        )}

                                                    {/* Payment Selection Action */}
                                                    {currentActiveTrip.status === 'Awaiting Payment Selection' && (
                                                        <div className="bg-[#1E1E1E] border border-[#FACC15] rounded-xl p-4 mt-4 animate-pulse-slow">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="p-2 bg-[#FACC15]/20 rounded-full text-[#FACC15]">
                                                                    <CreditCardIcon className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-white font-bold text-sm">Action Required</h4>
                                                                    <p className="text-xs text-gray-400">Please select how update you want to pay.</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    setPaymentTimingRide(currentActiveTrip);
                                                                    setIsPaymentTimingModalOpen(true);
                                                                }}
                                                                className="w-full py-2 bg-[#FACC15] text-black font-bold rounded-lg text-sm hover:bg-[#EAB308] transition-colors"
                                                            >
                                                                Select Payment Option
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Payment Selection Action */}
                                                    {currentActiveTrip.status === 'Awaiting Payment Selection' && (
                                                        <div className="bg-[#1E1E1E] border border-[#FACC15] rounded-xl p-4 mt-4 animate-pulse-slow">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="p-2 bg-[#FACC15]/20 rounded-full text-[#FACC15]">
                                                                    <CreditCardIcon className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-white font-bold text-sm">Action Required</h4>
                                                                    <p className="text-xs text-gray-400">Please select how update you want to pay.</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    setPaymentTimingRide(currentActiveTrip);
                                                                    setIsPaymentTimingModalOpen(true);
                                                                }}
                                                                className="w-full py-2 bg-[#FACC15] text-black font-bold rounded-lg text-sm hover:bg-[#EAB308] transition-colors"
                                                            >
                                                                Select Payment Option
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Panel: Manual Control Instructions (No Automated Map Tracking) */}
                                    <div className="flex-1 relative bg-[#1E1E1E] p-8 flex flex-col items-center justify-center">
                                        <div className="text-center max-w-sm">
                                            <div className="w-16 h-16 bg-[#252525] rounded-full flex items-center justify center mx-auto mb-6 border-2 border-[#333]">
                                                <MapIcon className="w-8 h-8 text-[#FACC15]" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-3">Manual Pickup Mode</h3>
                                            <p className="text-gray-400 text-sm mb-6">
                                                No automated map tracking. Use the action buttons on the left to manually confirm each step of your trip.
                                            </p>
                                            <div className="bg-[#252525] border border-[#333] rounded-2xl p-4 text-left text-xs text-gray-300 space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-[#FACC15] font-bold text-sm">1</span>
                                                    <span>Click <strong>Confirm Pickup</strong> when driver arrives and you board</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <span className="text-[#FACC15] font-bold text-sm">2</span>
                                                    <span>Click <strong>End Trip</strong> when you arrive at destination</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <span className="text-[#FACC15] font-bold text-sm">3</span>
                                                    <span>Click <strong>Complete Payment</strong> to finish</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center space-y-6">
                                    <div className="w-24 h-24 bg-[#252525] rounded-full flex items-center justify-center mb-4">
                                        <CarIcon className="w-10 h-10 text-gray-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">No Active Trips</h2>
                                    <p className="text-gray-400 max-w-md">
                                        You don't have any trips in progress. Book a ride from the marketplace to see it here.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className="px-8 py-3 bg-[#FACC15] text-black font-bold rounded-xl hover:bg-[#EAB308] transition-colors"
                                    >
                                        Go to Marketplace
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {/* --- STATISTICS (OLD OVERVIEW) TAB --- */}
                    {activeTab === 'statistics' && (
                        <div className="space-y-8 animate-fadeIn p-6 lg:p-8">
                            {/* Quick Active Trip View if available */}
                            {currentActiveTrip && (
                                <div
                                    onClick={() => setActiveTab('active-trip')}
                                    className="bg-gradient-to-r from-[#FACC15]/10 to-transparent p-6 rounded-3xl border border-[#FACC15]/30 cursor-pointer hover:border-[#FACC15]/60 transition-all group"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FACC15] opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FACC15]"></span>
                                            </span>
                                            Active Trip
                                        </h3>
                                        <span className="text-sm text-[#FACC15] font-bold flex items-center gap-1 group-hover:underline">
                                            View Details <MapIcon className="w-4 h-4" />
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between bg-[#1E1E1E] p-4 rounded-2xl border border-[#333]">
                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">Route</div>
                                            <div className="text-xl font-bold text-white">{currentActiveTrip.origin} → {currentActiveTrip.destination}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-400 mb-1">Status</div>
                                            <div className={`text-lg font-bold ${currentActiveTrip.status === 'Pending' ? 'text-yellow-400' : 'text-green-400'}`}>
                                                {currentActiveTrip.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard
                                    title="Total Spent"
                                    value={`MWK ${(stats?.totalSpend ?? 0).toLocaleString()}`}
                                    subValue="Lifetime spending"
                                    icon={WalletIcon}
                                    onClick={() => setActiveTab('financials')}
                                />
                                <StatCard
                                    title="Total Trips"
                                    value={stats.totalRides}
                                    subValue="Completed rides"
                                    icon={CarIcon}
                                    onClick={() => setActiveTab('trips')}
                                />
                                <StatCard
                                    title="Distance"
                                    value={`${stats.totalDistance} km`}
                                    subValue="Traveled with Ridex"
                                    icon={MapIcon}
                                    onClick={() => setActiveTab('distance')}
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Main Chart: Spending */}
                                <div className="lg:col-span-2 bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A]">
                                    <h3 className="text-lg font-bold text-white mb-6">Monthly Spending</h3>
                                    <div className="h-72 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats.chartData}>
                                                <defs>
                                                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.5} />
                                                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                                    cursor={{ stroke: '#333' }}
                                                    formatter={(value: number) => [`MWK ${(value ?? 0).toLocaleString()}`, 'Spent']}
                                                />
                                                <Area type="monotone" dataKey="value" stroke="#FACC15" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Pie Chart: Ride Types */}
                                <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A] flex flex-col">
                                    <h3 className="text-lg font-bold text-white mb-4">Ride Preference</h3>
                                    <div className="flex-1 min-h-[250px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats.rideTypes}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {stats.rideTypes.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#333', borderRadius: '8px', color: '#fff' }} />
                                                <Legend verticalAlign="bottom" height={36} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>

                    )}
                    {/* --- MESSAGES TAB --- */}
                    {
                        activeTab === 'messages' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)] animate-fadeIn">
                                {/* Left Column: Conversation List */}
                                <div className="bg-[#1E1E1E] rounded-3xl border border-[#2A2A2A] overflow-hidden flex flex-col">
                                    <div className="p-4 border-b border-[#333]">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search messages..."
                                                className="w-full bg-[#252525] border border-[#333] rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none focus:border-[#FACC15]"
                                            />
                                            <SearchIcon className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto no-scrollbar">
                                        {conversations.map(chat => (
                                            <div
                                                key={chat.id}
                                                onClick={() => setActiveChatId(chat.id)}
                                                className={`p-4 border-b border-[#333] cursor-pointer hover:bg-[#252525] transition-colors ${activeChatId === chat.id ? 'bg-[#252525] border-l-4 border-l-[#FACC15]' : ''}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />
                                                        {chat.status === 'online' && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#1E1E1E]"></span>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-baseline mb-1">
                                                            <h4 className={`text-sm font-bold truncate ${activeChatId === chat.id ? 'text-white' : 'text-gray-300'}`}>{chat.name}</h4>
                                                            <span className="text-[10px] text-gray-500">{chat.time}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-400 truncate">{chat.lastMessage}</p>
                                                    </div>
                                                    {chat.unread > 0 && (
                                                        <span className="bg-[#FACC15] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{chat.unread}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Column: Chat Window */}
                                <div className="lg:col-span-2 bg-[#1E1E1E] rounded-3xl border border-[#2A2A2A] overflow-hidden flex flex-col">
                                    {activeChat ? (
                                        <>
                                            <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#252525]">
                                                <div className="flex items-center gap-3">
                                                    <img src={activeChat.avatar} alt={activeChat.name} className="w-10 h-10 rounded-full" />
                                                    <div>
                                                        <h3 className="text-white font-bold text-sm">{activeChat.name}</h3>
                                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${activeChat.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                                            {activeChat.status === 'online' ? 'Online' : 'Offline'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1E1E1E]">
                                                {activeChat.messages.map(msg => (
                                                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-[#FACC15] text-black rounded-tr-none' : 'bg-[#2A2A2A] text-gray-200 rounded-tl-none'}`}>
                                                            <p>{msg.text}</p>
                                                            <p className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-black/60' : 'text-gray-500'}`}>{msg.timestamp}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="p-4 border-t border-[#333] bg-[#252525]">
                                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={messageInput}
                                                        onChange={(e) => setMessageInput(e.target.value)}
                                                        placeholder="Type a message..."
                                                        className="flex-1 bg-[#1E1E1E] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]"
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={!messageInput.trim()}
                                                        className="p-3 bg-[#FACC15] text-black rounded-xl hover:bg-[#EAB308] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <SendIcon className="w-5 h-5" />
                                                    </button>
                                                </form>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                            <ChatBubbleIcon className="w-16 h-16 opacity-20 mb-4" />
                                            <p>Select a conversation to start messaging</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    }

                    {/* --- FINANCIALS TAB (REVENUE/SPENDING) --- */}
                    {
                        activeTab === 'financials' && (
                            <div className="max-w-6xl mx-auto animate-fadeIn space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-[#1E1E1E] p-6 rounded-3xl border border-[#2A2A2A] flex flex-col justify-between h-40">
                                        <h3 className="text-gray-400 text-sm font-medium">Total Spent</h3>
                                        <div className="text-3xl font-bold text-white">MWK {(stats?.totalSpend ?? 0).toLocaleString()}</div>
                                        <div className="text-xs text-green-400">+12% vs last month</div>
                                    </div>
                                    <div className="bg-[#1E1E1E] p-6 rounded-3xl border border-[#2A2A2A] flex flex-col justify-between h-40">
                                        <h3 className="text-gray-400 text-sm font-medium">Avg. Ride Cost</h3>
                                        <div className="text-3xl font-bold text-white">MWK 18,350</div>
                                        <div className="text-xs text-gray-500">Based on 24 rides</div>
                                    </div>
                                    <div className="bg-[#1E1E1E] p-6 rounded-3xl border border-[#2A2A2A] flex flex-col justify-between h-40">
                                        <h3 className="text-gray-400 text-sm font-medium">Payment Methods</h3>
                                        <div className="flex gap-2 mt-2">
                                            <div className="w-10 h-6 bg-white rounded flex items-center justify-center"><span className="text-blue-600 font-bold text-[8px]">VISA</span></div>
                                            <div className="w-10 h-6 bg-red-600 rounded flex items-center justify-center"><span className="text-white font-bold text-[8px]">AIRTEL</span></div>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-auto">2 Active Methods</div>
                                    </div>
                                </div>

                                <div className="bg-[#1E1E1E] rounded-3xl p-8 border border-[#2A2A2A]">
                                    <h3 className="text-lg font-bold text-white mb-6">Recent Transactions</h3>
                                    <div className="overflow-hidden rounded-xl border border-[#333]">
                                        <table className="w-full text-left text-sm text-gray-400">
                                            <thead className="bg-[#252525] text-gray-200 uppercase text-xs font-bold">
                                                <tr>
                                                    <th className="px-6 py-3">Date</th>
                                                    <th className="px-6 py-3">Description</th>
                                                    <th className="px-6 py-3">Payment Method</th>
                                                    <th className="px-6 py-3 text-right">Amount</th>
                                                    <th className="px-6 py-3 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#333]">
                                                {[
                                                    { date: 'Oct 26, 2023', desc: 'Ride Share to Lilongwe', method: 'Airtel Money', amount: 25000, status: 'Completed' },
                                                    { date: 'Oct 24, 2023', desc: 'City Commute', method: 'Cash (Physical)', amount: 5000, status: 'Completed' },
                                                    { date: 'Oct 20, 2023', desc: 'Cancelled Ride Fee', method: 'Mpamba', amount: 2500, status: 'Refunded' },
                                                    { date: 'Oct 18, 2023', desc: 'Vehicle Hire Deposit', method: 'Bank Transfer', amount: 150000, status: 'Pending' },
                                                ].map((tx, i) => (
                                                    <tr key={i} className="hover:bg-[#252525] transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">{tx.date}</td>
                                                        <td className="px-6 py-4 font-medium text-white">{tx.desc}</td>
                                                        <td className="px-6 py-4 flex items-center gap-2">
                                                            {tx.method.includes('Airtel') && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
                                                            {tx.method.includes('Mpamba') && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                                                            {tx.method.includes('Bank') && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                                            {tx.method.includes('Cash') && <div className="w-2 h-2 rounded-full bg-yellow-500"></div>}
                                                            {tx.method}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-white">MWK {(tx.amount ?? 0).toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${tx.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                                                                tx.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                    'bg-gray-500/20 text-gray-400'
                                                                }`}>{tx.status}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {/* --- TRIPS TAB (HISTORY) --- */}
                    {
                        activeTab === 'trips' && (
                            <div className="max-w-4xl mx-auto animate-fadeIn">

                                {/* Active Trips List */}
                                <h2 className="text-xl font-bold text-white mb-6">Active & Pending Trips</h2>
                                {activeTrips.length === 0 ? (
                                    <div className="bg-[#1E1E1E] border border-[#333] rounded-2xl p-8 text-center mb-8">
                                        <div className="w-16 h-16 bg-[#252525] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                                            <CarIcon className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-white font-bold mb-2">No Active Trips</h3>
                                        <p className="text-gray-400 text-sm">Your active and pending rides will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 mb-10">
                                        {activeTrips.map((trip: any) => (
                                            <div key={trip.id} className="bg-[#1E1E1E] border border-[#333] rounded-2xl p-6 hover:border-[#FACC15]/30 transition-all">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                                                ${trip.type === 'hire' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                                {trip.type === 'hire' ? 'Vehicle Hire' : 'Ride Share'}
                                                            </span>
                                                            <span className="text-gray-400 text-xs">• {trip.date}</span>
                                                        </div>
                                                        <h3 className="text-lg font-bold text-white">
                                                            {trip.type === 'hire' ? (trip.title || 'Vehicle Rental') : `${trip.origin} → ${trip.destination}`}
                                                        </h3>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-xs font-bold
                                                        ${trip.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            trip.status === 'Approved' || trip.status === 'Awaiting Payment Selection' ? 'bg-green-500/20 text-green-400' :
                                                                trip.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                                                                    'bg-gray-700 text-gray-300'}`}>
                                                        {trip.status}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#333]">
                                                    <div className="text-[#FACC15] font-bold">
                                                        MWK {(trip.price || 0).toLocaleString()}
                                                    </div>

                                                    <div className="flex gap-3">
                                                        {/* Payment Action */}
                                                        {trip.status === 'Awaiting Payment Selection' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setPaymentTimingRide(trip);
                                                                    setIsPaymentTimingModalOpen(true);
                                                                }}
                                                                className="px-4 py-2 bg-[#FACC15] text-black text-sm font-bold rounded-lg hover:bg-[#EAB308] transition-colors flex items-center gap-2"
                                                            >
                                                                <CreditCardIcon className="w-4 h-4" />
                                                                Select Pay Option
                                                            </button>
                                                        )}

                                                        {/* Track / View Details Action */}
                                                        {['In Progress', 'Inbound', 'Arrived', 'Payment Due', 'Handover Pending'].includes(trip.status) && (
                                                            <button
                                                                onClick={() => setActiveTab('active-trip')}
                                                                className="px-4 py-2 bg-[#252525] text-white text-sm font-bold rounded-lg hover:bg-[#333] transition-colors flex items-center gap-2"
                                                            >
                                                                <NavigationIcon className="w-4 h-4" />
                                                                Track Trip
                                                            </button>
                                                        )}

                                                        {/* Cancel Action (for pending) */}
                                                        {trip.status === 'Pending' && (
                                                            <button className="text-red-400 text-sm font-bold hover:text-red-300">
                                                                Cancel Request
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Past History Section */}
                                <h2 className="text-xl font-bold text-white mb-6">Trip History</h2>
                                {pastTrips.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">No past trips found.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {pastTrips.map(trip => (
                                            <div key={trip.id} className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-6 hover:border-[#FACC15]/30 transition-colors">
                                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                                                <span>{trip.date}</span>
                                                                <span>•</span>
                                                                <span>{trip.time}</span>
                                                            </div>
                                                            <div className={`text-xs font-bold px-2 py-0.5 rounded ${trip.status === 'Completed' ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                                                                {trip.status}
                                                            </div>
                                                        </div>

                                                        <div className="relative pl-4 border-l-2 border-[#333] space-y-6 ml-1">
                                                            <div className="relative">
                                                                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-gray-600 rounded-full border-2 border-[#1E1E1E]"></div>
                                                                <div className="text-white font-bold">{trip.origin}</div>
                                                            </div>
                                                            <div className="relative">
                                                                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-[#FACC15] rounded-full border-2 border-[#1E1E1E]"></div>
                                                                <div className="text-white font-bold">{trip.destination}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="md:w-48 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#333] pt-4 md:pt-0 md:pl-6">
                                                        <div className="flex items-center gap-3 mb-4 md:mb-0">
                                                            <img
                                                                src={`https://ui-avatars.com/api/?name=${typeof trip.driver === 'string' ? trip.driver : trip.driver?.name || 'Unknown'}&background=random`}
                                                                alt={typeof trip.driver === 'string' ? trip.driver : trip.driver?.name || 'Unknown'}
                                                                className="w-10 h-10 rounded-full border border-[#333]"
                                                            />
                                                            <div>
                                                                <div className="text-sm font-bold text-white">{typeof trip.driver === 'string' ? trip.driver : trip.driver?.name || 'Unknown Driver'}</div>
                                                                <div className="flex items-center text-[#FACC15] text-xs">
                                                                    {Array.from({ length: trip.rating || 0 }).map((_, i) => <span key={i}>★</span>)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <div className="text-gray-500 text-xs">Total Fare</div>
                                                            <div className="text-2xl font-bold text-white">MWK {(trip.price ?? 0).toLocaleString()}</div>
                                                        </div>

                                                        {trip.status === 'Completed' && !trip.rating && (
                                                            <button
                                                                onClick={() => openRatingModal(trip)}
                                                                className="mt-2 w-full py-1.5 bg-[#252525] text-[#FACC15] text-xs font-bold rounded-lg border border-[#333] hover:bg-[#333] transition-colors"
                                                            >
                                                                Rate Driver
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    }

                    {/* --- DISTANCE TAB --- */}
                    {
                        activeTab === 'distance' && (
                            <div className="max-w-6xl mx-auto animate-fadeIn space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-[#1E1E1E] p-6 rounded-3xl border border-[#2A2A2A] flex flex-col items-start">
                                        <h3 className="text-gray-400 text-sm font-medium mb-2">Total Distance</h3>
                                        <div className="text-4xl font-bold text-white">{stats.totalDistance} <span className="text-lg text-[#FACC15]">km</span></div>
                                    </div>
                                    <div className="bg-[#1E1E1E] p-6 rounded-3xl border border-[#2A2A2A] flex flex-col items-start">
                                        <h3 className="text-gray-400 text-sm font-medium mb-2">This Month</h3>
                                        <div className="text-4xl font-bold text-white">124 <span className="text-lg text-gray-500">km</span></div>
                                    </div>
                                    <div className="bg-[#1E1E1E] p-6 rounded-3xl border border-[#2A2A2A] flex flex-col items-start">
                                        <h3 className="text-gray-400 text-sm font-medium mb-2">Avg. Trip</h3>
                                        <div className="text-4xl font-bold text-white">14.2 <span className="text-lg text-gray-500">km</span></div>
                                    </div>
                                </div>

                                <div className="bg-[#1E1E1E] rounded-3xl p-8 border border-[#2A2A2A]">
                                    <h3 className="text-lg font-bold text-white mb-6">Distance Traveled History (km)</h3>
                                    <div className="h-80 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats.chartData.map((d: any) => ({ ...d, value: d.value * 1.5 }))}> {/* Mock scaling for distance demo */}
                                                <defs>
                                                    <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.5} />
                                                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                                    cursor={{ stroke: '#333' }}
                                                    formatter={(value: any) => [`${value} km`, 'Distance']}
                                                />
                                                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDistance)" name="Distance" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div>
            </main>


            {/* REQUEST MODAL (NO PAYMENT) */}
            {
                isRequestModalOpen && (
                    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 animate-fadeIn" onClick={() => setIsRequestModalOpen(false)}>
                        <div className="bg-[#1E1E1E] rounded-3xl max-w-md w-full border border-[#333] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

                            {requestStep === 'success' ? (
                                <div className="p-8 flex flex-col items-center justify-center text-center h-80">
                                    <div className="w-20 h-20 bg-[#FACC15]/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                        <CheckCircleIcon className="w-10 h-10 text-[#FACC15]" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">{bookingMode === 'negotiate' ? 'Offer Sent!' : 'Request Sent!'}</h2>
                                    <p className="text-gray-400">
                                        {bookingMode === 'negotiate'
                                            ? 'Your offer has been sent to the driver for approval.'
                                            : 'Your booking request has been sent to the driver.'}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-4">
                                        <span className="block text-orange-400 font-bold mb-1">Pending Driver Approval</span>
                                        Check "Active Trip" for live status updates.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-6 border-b border-[#333] flex justify-between items-center bg-[#252525]">
                                        <h3 className="text-xl font-bold text-white">Review & Request</h3>
                                        <button onClick={() => setIsRequestModalOpen(false)} className="text-gray-400 hover:text-white">
                                            <CloseIcon className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        {selectedBooking && (
                                            <div className="space-y-6">
                                                <div className="bg-[#121212] p-4 rounded-xl border border-[#333]">
                                                    <div className="text-xs text-[#FACC15] font-bold uppercase mb-2">Itinerary</div>
                                                    {bookingType === 'share' ? (
                                                        <div className="flex items-center gap-3 text-sm text-gray-300">
                                                            <span className="font-bold text-white">{selectedBooking.origin}</span>
                                                            <span className="text-gray-600">→</span>
                                                            <span className="font-bold text-white">{selectedBooking.destination}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="font-bold text-white">{selectedBooking.title}</div>
                                                    )}
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        {bookingType === 'share' ? `${selectedBooking.date} at ${selectedBooking.time}` : `Category: ${selectedBooking.category}`}
                                                    </div>
                                                </div>

                                                <div className="bg-[#252525] p-1 rounded-xl flex border border-[#333]">
                                                    <button
                                                        onClick={() => setBookingMode('fixed')}
                                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${bookingMode === 'fixed' ? 'bg-[#FACC15] text-black' : 'text-gray-400 hover:text-white'}`}
                                                    >
                                                        Listed Price
                                                    </button>
                                                    <button
                                                        onClick={() => setBookingMode('negotiate')}
                                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${bookingMode === 'negotiate' ? 'bg-[#FACC15] text-black' : 'text-gray-400 hover:text-white'}`}
                                                    >
                                                        Negotiate Offer
                                                    </button>
                                                </div>

                                                <div className="flex justify-between items-center py-2 border-b border-[#333]">
                                                    <span className="text-gray-400">
                                                        {bookingMode === 'fixed' ? 'Base Price' : 'Your Offer (MWK)'}
                                                    </span>
                                                    {bookingMode === 'fixed' ? (
                                                        <span className="text-white font-bold">
                                                            {bookingType === 'share' ? `MWK ${(selectedBooking?.price ?? 0).toLocaleString()}` : selectedBooking?.rate}
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center bg-[#121212] border border-[#333] rounded-lg px-2 w-32 focus-within:border-[#FACC15] ring-2 ring-transparent focus-within:ring-[#FACC15]/20 transition-all">
                                                            <span className="text-[#FACC15] text-xs mr-1">MWK</span>
                                                            <input
                                                                type="number"
                                                                value={offerPrice}
                                                                onChange={(e) => setOfferPrice(e.target.value)}
                                                                className="bg-transparent text-[#FACC15] font-bold text-right w-full py-1 outline-none text-lg"
                                                                placeholder="0.00"
                                                                onFocus={(e) => e.target.select()}
                                                                autoFocus
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-center pt-2">
                                                    <span className="text-lg font-bold text-white">Estimated Total</span>
                                                    <span className="text-2xl font-bold text-[#FACC15]">
                                                        MWK {(getCalculatedTotal() ?? 0).toLocaleString()}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-gray-500 text-center mt-2">
                                                    Payment will be collected after the trip is completed.
                                                </p>

                                                <button
                                                    onClick={handleRequestSubmit}
                                                    className="w-full py-4 bg-gradient-to-r from-[#FACC15] to-[#EAB308] text-black font-extrabold text-lg rounded-xl hover:from-[#EAB308] hover:to-[#CA8A04] transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transform hover:-translate-y-0.5 mt-4"
                                                >
                                                    {bookingMode === 'negotiate' ? 'Send Offer' : 'Send Request'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
            }

            {/* HANDOVER MODAL (For Hire Jobs - Payment Required) */}
            {isHandoverModalOpen && currentActiveTrip && (
                <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-md" style={{ pointerEvents: 'auto' }}>
                    <div className="bg-[#1E1E1E] rounded-3xl max-w-md w-full border-2 border-[#FACC15]/50 shadow-2xl overflow-hidden animate-slideUp">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#FACC15] to-[#EAB308] p-6 text-center relative">
                            {/* Close Button */}
                            <button
                                onClick={() => setIsHandoverModalOpen(false)}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                            >
                                <CloseIcon className="w-5 h-5 text-white" />
                            </button>
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🔄</span>
                            </div>
                            <h2 className="text-2xl font-bold text-black">Handover Awaiting Payment</h2>
                            {currentActiveTrip.driver?.name && (
                                <p className="text-black/80 text-sm mt-1">Driver: <span className="font-semibold">{currentActiveTrip.driver.name}</span></p>
                            )}
                            <p className="text-black/70 text-sm mt-2">Complete payment to confirm vehicle handover</p>
                        </div>

                        {/* Content */}
                        <div className="p-6 min-h-[300px]">
                            {paymentStep === 'processing' ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-8 animate-fadeIn">
                                    <div className="w-16 h-16 border-4 border-[#252525] border-t-[#FACC15] rounded-full animate-spin mb-4"></div>
                                    <h3 className="text-xl font-bold text-white mb-2">Processing Payment</h3>
                                    <p className="text-gray-400 text-sm">Please approve the prompt on your phone.</p>
                                </div>
                            ) : paymentStep === 'success' ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-8 animate-fadeIn">
                                    <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">Handover Complete!</h3>
                                    <p className="text-gray-400 text-sm">Vehicle is now in your possession.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="bg-[#252525] rounded-xl p-4 border border-[#333]">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-2">Trip Amount</p>
                                        <p className="text-2xl font-bold text-white">MWK {currentActiveTrip.price || 0}</p>
                                    </div>

                                    <div className="bg-[#FACC15]/10 border border-[#FACC15]/20 rounded-xl p-4 mb-4">
                                        <p className="text-sm text-[#FACC15] font-semibold mb-2">💳 Payment Required</p>
                                        <p className="text-xs text-gray-300">Complete mobile money payment to confirm handover.</p>
                                    </div>

                                    {/* Mobile Money Payment Form */}
                                    <div className="space-y-3">
                                        <div className="flex bg-[#252525] rounded-xl p-1 mb-4">
                                            <button
                                                onClick={() => setHandoverPaymentMethod('mobile')}
                                                className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${handoverPaymentMethod === 'mobile'
                                                    ? 'bg-[#FACC15] text-black shadow-lg'
                                                    : 'text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                Mobile Money
                                            </button>
                                            <button
                                                onClick={() => setHandoverPaymentMethod('cash')}
                                                className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${handoverPaymentMethod === 'cash'
                                                    ? 'bg-[#FACC15] text-black shadow-lg'
                                                    : 'text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                Cash
                                            </button>
                                        </div>

                                        {handoverPaymentMethod === 'mobile' ? (
                                            <>
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-2">Select Network</label>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setMobileProvider('airtel')}
                                                            className={`flex-1 py-3 rounded-lg text-sm font-bold border transition-all ${mobileProvider === 'airtel' ? 'bg-red-600 text-white border-red-600' : 'bg-[#121212] border-[#333] text-gray-500 hover:border-gray-500'}`}
                                                        >
                                                            📱 Airtel Money
                                                        </button>
                                                        <button
                                                            onClick={() => setMobileProvider('mpamba')}
                                                            className={`flex-1 py-3 rounded-lg text-sm font-bold border transition-all ${mobileProvider === 'mpamba' ? 'bg-green-600 text-white border-green-600' : 'bg-[#121212] border-[#333] text-gray-500 hover:border-gray-500'}`}
                                                        >
                                                            📱 Mpamba (TNM)
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-2">Your Mobile Number</label>
                                                    <input
                                                        type="text"
                                                        placeholder="+265..."
                                                        value={passengerPhone}
                                                        onChange={(e) => setPassengerPhone(e.target.value)}
                                                        className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-3 text-sm text-white focus:border-[#FACC15] outline-none"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="bg-[#121212] rounded-xl p-4 border border-[#333] text-center">
                                                <div className="w-12 h-12 bg-[#FACC15]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <span className="text-2xl">💵</span>
                                                </div>
                                                <p className="text-white font-bold text-sm mb-1">Pay Cash to Driver</p>
                                                <p className="text-gray-400 text-xs">Please ensure you have exact change to hand over to the driver.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {!['processing', 'success'].includes(paymentStep) && (
                            <div className="p-6 border-t border-[#333] space-y-3">
                                <button
                                    onClick={handleHandoverPaymentSelection}
                                    disabled={handoverPaymentMethod === 'mobile' && !passengerPhone}
                                    className={`w-full py-3 font-bold rounded-xl transition-all shadow-lg ${(handoverPaymentMethod === 'mobile' && passengerPhone) || handoverPaymentMethod === 'cash'
                                        ? 'bg-gradient-to-r from-[#FACC15] to-[#EAB308] text-black hover:from-[#EAB308] hover:to-[#CA8A04]'
                                        : 'bg-[#333] text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {handoverPaymentMethod === 'mobile' ? '💳 Pay & Confirm Handover' : '💵 Confirm Cash Payment'}
                                </button>
                                <button
                                    onClick={() => setIsHandoverModalOpen(false)}
                                    className="w-full py-3 bg-[#252525] text-gray-300 font-bold rounded-xl border border-[#333] hover:bg-[#333] transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* PAYMENT MODAL (Post-Trip) */}
            {
                isPaymentModalOpen && (
                    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 animate-fadeIn" onClick={() => { }}>
                        <div className="bg-[#1E1E1E] rounded-3xl max-w-md w-full border border-[#333] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

                            {paymentStep === 'processing' ? (
                                <div className="p-8 flex flex-col items-center justify-center text-center h-96">
                                    <div className="w-20 h-20 border-4 border-[#252525] border-t-[#FACC15] rounded-full animate-spin mb-6"></div>
                                    <h2 className="text-xl font-bold text-white mb-2">Processing Secure Payment...</h2>
                                    <p className="text-gray-400 text-sm">
                                        Please confirm the push request on your mobile device.
                                    </p>
                                    <div className="mt-6 bg-[#252525] px-4 py-2 rounded-lg text-xs text-[#FACC15] font-mono border border-[#FACC15]/20">
                                        Waiting for Webhook Confirmation...
                                    </div>
                                </div>
                            ) : paymentStep === 'success' ? (
                                <div className="p-8 flex flex-col items-center justify-center text-center h-96">
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                        <CheckCircleIcon className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                                    <p className="text-gray-400">
                                        Thank you for riding with Ridex.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-6 border-b border-[#333] bg-[#252525] text-center relative">
                                        <button
                                            onClick={() => setIsPaymentModalOpen(false)}
                                            className="absolute top-3 right-3 text-gray-400 hover:text-white hover:bg-[#333] rounded-full w-8 h-8 flex items-center justify-center transition"
                                            aria-label="Close"
                                        >
                                            <span className="text-2xl font-bold">×</span>
                                        </button>
                                        <h3 className="text-xl font-bold text-white">Secure Payment via PayChangu</h3>
                                        <p className="text-sm text-gray-400 mt-1">Complete your trip payment</p>
                                    </div>

                                    <div className="p-6">
                                        {/* Loading State */}
                                        {isLoadingDriverDetails ? (
                                            <div className="mb-6 bg-[#121212] p-6 rounded-xl border border-[#333] flex items-center justify-center">
                                                <div className="w-6 h-6 border-2 border-[#252525] border-t-[#FACC15] rounded-full animate-spin mr-3"></div>
                                                <span className="text-gray-400 text-sm">Loading driver details...</span>
                                            </div>
                                        ) : paymentError ? (
                                            <div className="mb-6 bg-red-500/10 border border-red-500/30 p-4 rounded-xl">
                                                <p className="text-red-400 text-sm">{paymentError}</p>
                                            </div>
                                        ) : driverPayoutDetails ? (
                                            <div className="mb-6 bg-[#121212] p-4 rounded-xl border border-[#333]">
                                                <div className="flex justify-between mb-3">
                                                    <span className="text-gray-500 text-xs uppercase font-bold">Recipient (Driver)</span>
                                                    <span className="text-xs text-[#FACC15] font-bold">{driverPayoutDetails.payoutMethod}</span>
                                                </div>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 bg-[#252525] rounded-full flex items-center justify-center">
                                                        {driverPayoutDetails.payoutMethod === 'Bank' ? (
                                                            <BankIcon className="w-5 h-5 text-blue-400" />
                                                        ) : (
                                                            <PhoneIcon className="w-5 h-5 text-[#FACC15]" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-white font-bold text-sm">{driverPayoutDetails.driverName}</div>
                                                        {driverPayoutDetails.payoutMethod === 'Bank' ? (
                                                            <>
                                                                <div className="text-xs text-gray-400">{driverPayoutDetails.bankName}</div>
                                                                <div className="text-xs text-[#FACC15] font-mono">
                                                                    {driverPayoutDetails.payoutAccountNumber}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="text-xs text-[#FACC15] font-mono">
                                                                {driverPayoutDetails.payoutMobileNumber}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-6 bg-[#121212] p-4 rounded-xl border border-[#333]">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-gray-500 text-xs uppercase font-bold">Recipient (Driver)</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-[#252525] rounded-full flex items-center justify-center">
                                                        <UserIcon className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-bold text-sm">{typeof currentActiveTrip?.driver === 'string' ? currentActiveTrip.driver : currentActiveTrip?.driver?.name || 'Unknown Driver'}</div>
                                                        <div className="text-xs text-gray-500">Payout details not available</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mb-6 text-center">
                                            <p className="text-gray-400 text-xs uppercase font-bold mb-1">Total Amount Due</p>
                                            <p className="text-3xl font-bold text-[#FACC15]">MWK {currentActiveTrip ? (currentActiveTrip.price || currentActiveTrip.acceptedPrice || 0).toLocaleString() : '0'}</p>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Mobile Money Option (Default) */}
                                            <div className="p-4 rounded-xl border-2 border-[#FACC15] bg-[#FACC15]/5">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-8 h-8 rounded-full bg-[#FACC15] flex items-center justify-center text-black">
                                                        <PhoneIcon className="w-4 h-4" />
                                                    </div>
                                                    <div className="font-bold text-white">Mobile Money Checkout</div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-xs text-gray-500 block mb-1">Select Network</label>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setMobileProvider('airtel')}
                                                                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${mobileProvider === 'airtel' ? 'bg-red-600 text-white border-red-600' : 'bg-[#121212] border-[#333] text-gray-500 hover:border-gray-500'}`}
                                                            >
                                                                Airtel Money
                                                            </button>
                                                            <button
                                                                onClick={() => setMobileProvider('mpamba')}
                                                                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${mobileProvider === 'mpamba' ? 'bg-green-600 text-white border-green-600' : 'bg-[#121212] border-[#333] text-gray-500 hover:border-gray-500'}`}
                                                            >
                                                                Mpamba (TNM)
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-xs text-gray-500 block mb-1">Your Mobile Number (Payer)</label>
                                                        <input
                                                            type="text"
                                                            placeholder="+265..."
                                                            value={passengerPhone}
                                                            onChange={(e) => setPassengerPhone(e.target.value)}
                                                            className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-3 text-sm text-white focus:border-[#FACC15] outline-none transition-colors"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleCompletePayment}
                                            className="w-full py-4 bg-[#FACC15] text-black font-bold rounded-xl hover:bg-[#EAB308] transition-all shadow-lg shadow-[#FACC15]/20 mt-6 flex items-center justify-center gap-2"
                                        >
                                            <LockClosedIcon className="w-4 h-4" />
                                            Pay Securely
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
            }

            {/* RATING MODAL */}
            {
                isRatingModalOpen && (
                    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 animate-fadeIn" onClick={() => setIsRatingModalOpen(false)}>
                        <div className="bg-[#1E1E1E] rounded-3xl max-w-sm w-full border border-[#333] shadow-2xl overflow-hidden p-6 text-center" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-end">
                                <button onClick={() => setIsRatingModalOpen(false)} className="text-gray-400 hover:text-white">
                                    <CloseIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="mb-4 flex flex-col items-center">
                                <img src={`https://ui-avatars.com/api/?name=${ratingTrip?.driver}&background=random`} alt="Driver" className="w-16 h-16 rounded-full border-2 border-[#FACC15] mb-3" />
                                <h3 className="text-xl font-bold text-white">Rate {ratingTrip?.driver}</h3>
                                <p className="text-gray-500 text-sm">How was your trip from {ratingTrip?.origin}?</p>
                            </div>

                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setSelectedRating(star)}
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <StarIcon className={`w-8 h-8 ${star <= (hoverRating || selectedRating) ? 'text-[#FACC15]' : 'text-gray-600'}`} />
                                    </button>
                                ))}
                            </div>

                            <textarea
                                placeholder="Leave a comment (optional)..."
                                value={ratingComment}
                                onChange={(e) => setRatingComment(e.target.value)}
                                className="w-full bg-[#252525] border border-[#333] rounded-xl p-3 text-sm text-white outline-none focus:border-[#FACC15] mb-6 h-24 resize-none"
                            ></textarea>

                            <button
                                onClick={submitRating}
                                disabled={selectedRating === 0}
                                className="w-full py-3 bg-[#FACC15] text-black font-bold rounded-xl hover:bg-[#EAB308] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit Rating
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Boarding Confirmation Modal */}
            {showBoardingModal && boardingRideId && (
                <div
                    className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
                    style={{ pointerEvents: 'auto' }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowBoardingModal(false);
                        }
                    }}
                >
                    <div
                        className="bg-[#1E1E1E] rounded-3xl p-8 max-w-md w-full border-2 border-[#FACC15] shadow-2xl shadow-[#FACC15]/20 animate-fadeIn"
                        style={{ pointerEvents: 'auto' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-center w-16 h-16 bg-[#FACC15] rounded-full mx-auto mb-6">
                            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4 text-center">🚗 Driver Arrived!</h3>
                        <p className="text-gray-300 mb-6 text-center leading-relaxed">
                            Your driver has arrived at the pickup location.<br />
                            <strong className="text-white">Please confirm when you've boarded the vehicle.</strong>
                        </p>
                        <p className="text-xs text-gray-500 mb-4 text-center">Ride ID: {boardingRideId}</p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('🔴 Not Yet clicked');
                                    setShowBoardingModal(false);
                                }}
                                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition-all cursor-pointer select-none active:scale-95"
                            >
                                Not Yet
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const currentRideId = boardingRideId; // Capture current value
                                    console.log('🟢🟢🟢 YES I HAVE BOARDED - CLICK! RideID:', currentRideId);

                                    if (!currentRideId) {
                                        console.error('❌ No ride ID available!');
                                        alert('Error: No ride ID. Please refresh and try again.');
                                        return;
                                    }

                                    // Close modal and mark as confirmed FIRST
                                    setBoardingConfirmed(prev => new Set(prev).add(currentRideId));
                                    setShowBoardingModal(false);
                                    setBoardingRideId(null);

                                    // Update status
                                    const rideIdNum = parseInt(currentRideId);
                                    setActiveTrips(prev => prev.map((t: any) =>
                                        t.id === rideIdNum ? { ...t, status: 'Boarded' } : t
                                    ));
                                    setHistory(prev => prev.map(h =>
                                        h.id === rideIdNum ? { ...h, status: 'Boarded' } : h
                                    ));

                                    setNotifications(prev => [{
                                        title: 'Boarding Confirmed',
                                        msg: 'Driver can now start the trip.',
                                        time: 'Just now',
                                        unread: true
                                    }, ...prev]);

                                    // Call API
                                    ApiService.confirmPickup(currentRideId)
                                        .then(() => console.log('✅ API success'))
                                        .catch(err => console.error('❌ API failed:', err));
                                }}
                                className="flex-1 px-4 py-3 bg-[#FACC15] text-black rounded-xl font-bold hover:bg-[#EAB308] transition-all shadow-lg shadow-[#FACC15]/30 cursor-pointer select-none active:scale-95"
                            >
                                ✅ Yes, I Have Boarded
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* End of Modals */}
            {/* Negotiation Modals */}
            {negotiationRide && (
                <NegotiationModal
                    isOpen={showNegotiationModal}
                    onClose={() => setShowNegotiationModal(false)}
                    originalPrice={negotiationRide.price}
                    minPrice={negotiationRide.minPrice || negotiationRide.price * 0.8}
                    maxPrice={negotiationRide.maxPrice || negotiationRide.price * 1.2}
                    onSubmitOffer={handleSubmitOffer}
                    negotiationHistory={negotiationHistory}
                    vehicleDetails={{
                        name: negotiationRide.driverName || 'Driver',
                        type: 'share',
                        origin: negotiationRide.origin,
                        destination: negotiationRide.destination
                    }}
                />
            )}

            {approvedRide && (
                <PaymentSelectionModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    amount={approvedRide.acceptedPrice || approvedRide.price}
                    onSelectPayment={handlePaymentSelection}
                    rideDetails={{
                        type: approvedRide.type || 'share',
                        origin: approvedRide.origin,
                        destination: approvedRide.destination,
                        driverName: approvedRide.driverName || 'Driver'
                    }}
                />
            )}

            {/* Boarding Confirmation Modal */}
            {showBoardingModal && (
                <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-[#1E1E1E] rounded-3xl max-w-md w-full border border-[#333] p-8 text-center">
                        <div className="text-6xl mb-4">🚗</div>
                        <h2 className="text-2xl font-bold text-white mb-4">Driver Ready for Pickup</h2>
                        <p className="text-gray-400 mb-6">
                            Your driver is ready to pick you up. Please confirm that you're boarding the vehicle.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBoardingModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmBoarding}
                                className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
                            >
                                ✅ Confirm Boarding
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pickup confirmation modal removed - manual pickup/drop-off/boarding happens in tracking tab */}
            {/* Payment Timing Selection Modal */}
            {isPaymentTimingModalOpen && paymentTimingRide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-[#1E1E1E] border border-[#333] rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
                        <button
                            onClick={() => setIsPaymentTimingModalOpen(false)}
                            className="absolute top-4 right-4 p-2 bg-[#252525] rounded-full hover:bg-[#333] transition-colors"
                        >
                            <CloseIcon className="w-5 h-5 text-gray-400" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#FACC15]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FACC15]/50">
                                <CreditCardIcon className="w-8 h-8 text-[#FACC15]" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Payment Timing</h2>
                            <p className="text-gray-400">
                                Your hire request for <span className="text-white font-bold">{paymentTimingRide.title || 'Vehicle'}</span> has been approved. When would you like to pay?
                            </p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => handlePaymentTimingSelection('now')}
                                className="w-full p-4 bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold rounded-xl transition-all flex items-center justify-between group"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="p-2 bg-black/10 rounded-lg"><CreditCardIcon className="w-5 h-5" /></span>
                                    Pay Now
                                </span>
                                <span className="text-xs font-bold bg-black/20 px-2 py-1 rounded">SECURE</span>
                            </button>

                            <button
                                onClick={() => handlePaymentTimingSelection('pickup')}
                                className="w-full p-4 bg-[#252525] hover:bg-[#333] border border-[#333] hover:border-[#FACC15]/50 text-white font-bold rounded-xl transition-all flex items-center justify-between group"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="p-2 bg-black/20 rounded-lg"><HandshakeIcon className="w-5 h-5 text-gray-400 group-hover:text-white" /></span>
                                    Pay on Pickup
                                </span>
                                <span className="text-xs text-gray-500 group-hover:text-gray-300">CASH / CARD</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Handover Payment Modal */}

        </div >
    );
};