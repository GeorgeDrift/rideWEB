
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

interface RiderDashboardProps {
    onLogout: () => void;
}

// --- Mock Map Component ---
const MockMap = ({ status }: { status?: string }) => (
    <div className="w-full h-full bg-[#1a1a1a] relative overflow-hidden">
        {/* Map Background Pattern */}
        <div className="absolute inset-0 opacity-10"
            style={{
                backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }}>
        </div>

        {/* Mock Roads */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
            <path d="M-100 200 L 300 250 L 500 150 L 800 400 L 1200 350" stroke="#2a2a2a" strokeWidth="40" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M400 -50 L 450 300 L 400 800" stroke="#2a2a2a" strokeWidth="35" fill="none" strokeLinecap="round" strokeLinejoin="round" />

            {/* Active Route Line */}
            <path d="M300 250 L 500 150 L 800 400" stroke="#FACC15" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10 5" className="animate-pulse" />
        </svg>

        {/* Markers */}
        <div className="absolute top-[250px] left-[300px] transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-[#1E1E1E] px-2 py-1 rounded text-[10px] text-white font-bold shadow-lg whitespace-nowrap border border-[#333] opacity-0 group-hover:opacity-100 transition-opacity">
                Pickup Location
            </div>
        </div>

        <div className="absolute top-[400px] left-[800px] transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-[#1E1E1E] px-2 py-1 rounded text-[10px] text-white font-bold shadow-lg whitespace-nowrap border border-[#333] opacity-0 group-hover:opacity-100 transition-opacity">
                Destination
            </div>
        </div>

        {/* Driver Car (Animated) */}
        <div className={`absolute top-[200px] left-[400px] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-[5000ms] ease-linear ${status === 'Arrived' ? 'translate-x-[-100px] translate-y-[50px]' : ''}`}>
            <div className="w-16 h-16 bg-[#FACC15]/10 rounded-full animate-ping absolute inset-0"></div>
            <div className="relative w-12 h-12 bg-[#FACC15] rounded-full border-2 border-black flex items-center justify-center shadow-2xl z-10">
                <CarIcon className="w-6 h-6 text-black" />
            </div>
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {status === 'Arrived' ? 'Driver Here' : 'Driver • 2 min away'}
            </div>
        </div>

        {/* Overlay Info */}
        <div className="absolute top-4 right-4 bg-[#1E1E1E]/90 backdrop-blur-md p-4 rounded-xl border border-[#333] shadow-lg max-w-xs">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">Live Traffic</span>
            </div>
            <div className="text-xs text-gray-400">Optimal route selected. Traffic is light on the M1 highway.</div>
        </div>
    </div>
);

// --- Mock Database for Driver Numbers ---
const MOCK_DRIVER_DB: Record<string, string> = {
    'Alex Driver': '+265 991 234 567',
    'Mike Ross': '+265 888 765 432',
    'John Doe': '+265 999 111 222',
    // Fallback
    'default': '+265 999 000 000'
};

const getDriverPhone = (driverName: string): string => {
    return MOCK_DRIVER_DB[driverName] || MOCK_DRIVER_DB['default'];
};

export const RiderDashboard: React.FC<RiderDashboardProps> = ({ onLogout }) => {
    // State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'market' | 'trips' | 'active-trip' | 'financials' | 'distance' | 'messages'>('overview');
    const [marketTab, setMarketTab] = useState<'share' | 'hire'>('share');
    const [searchTerm, setSearchTerm] = useState('');

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
    const [conversations, setConversations] = useState<Conversation[]>(ApiService.getRiderConversations());
    const [activeChatId, setActiveChatId] = useState<string>(conversations[0]?.id || '');
    const [messageInput, setMessageInput] = useState('');

    // Data
    const [profile] = useState(ApiService.getRiderProfile());
    const [stats] = useState(ApiService.getRiderStats());

    // Initialize history
    const [history, setHistory] = useState<any[]>([
        ...ApiService.getRiderHistory(),
        {
            id: 99,
            date: new Date().toLocaleDateString(),
            time: '10:00',
            origin: 'Zomba',
            destination: 'Blantyre',
            price: 20000,
            status: 'Completed',
            driver: 'Mike Ross',
            rating: 4,
            timestamp: Date.now() - 10000000
        }
    ]);

    // Listings Data
    const [rideShareListings] = useState<DriverRidePost[]>(ApiService.getAllRideSharePosts());
    const [forHireListings] = useState<DriverHirePost[]>(ApiService.getAllForHirePosts());

    // Helper to separate active vs past trips
    // Statuses: Pending -> Inbound -> Arrived -> In Progress -> Payment Due -> Completed
    const activeTrips = history.filter(h => ['Pending', 'Approved', 'Inbound', 'Arrived', 'In Progress', 'Waiting for Pickup', 'Payment Due'].includes(h.status));
    const pastTrips = history.filter(h => ['Completed', 'Cancelled', 'Refunded'].includes(h.status));
    const currentActiveTrip = activeTrips.find(t => t.status !== 'Pending') || activeTrips[0]; // Prioritize non-pending

    // Auto-Status Simulation Effect (To show flow without driver interaction in this demo)
    useEffect(() => {
        const interval = setInterval(() => {
            setHistory(currentHistory => {
                let hasChanges = false;
                const updatedHistory = currentHistory.map(trip => {
                    const timeDiff = Date.now() - (trip.timestamp || 0);

                    // 1. Pending -> Inbound (Approved) after 3s
                    if (trip.status === 'Pending' && timeDiff > 3000) {
                        hasChanges = true;
                        return { ...trip, status: 'Inbound', driver: trip.driver || 'Alex Driver' };
                    }
                    // 2. Inbound -> Arrived after 8s
                    if (trip.status === 'Inbound' && timeDiff > 8000) {
                        hasChanges = true;
                        return { ...trip, status: 'Arrived' };
                    }
                    // 3. In Progress -> Payment Due after 20s (Simulated trip end)
                    if (trip.status === 'In Progress' && timeDiff > 20000) {
                        hasChanges = true;
                        return { ...trip, status: 'Payment Due' };
                    }
                    return trip;
                });
                return hasChanges ? updatedHistory : currentHistory;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Auto-Open Payment Modal when status becomes 'Payment Due'
    useEffect(() => {
        if (currentActiveTrip?.status === 'Payment Due' && !isPaymentModalOpen) {
            setIsPaymentModalOpen(true);
            setPaymentStep('method');
        }
    }, [currentActiveTrip?.status]);

    // Fetch Driver Payout Details when Payment Modal Opens
    useEffect(() => {
        const fetchPaymentData = async () => {
            if (isPaymentModalOpen && currentActiveTrip) {
                setIsLoadingDriverDetails(true);
                setPaymentError(null);

                try {
                    // Fetch driver payout details
                    // For demo purposes, we'll use a mock driver ID based on driver name
                    // In production, you'd get the actual driver ID from the trip data
                    const driverIdMap: Record<string, string> = {
                        'Alex Driver': 'D-001',
                        'Mike Ross': 'D-002',
                        'John Doe': 'D-003'
                    };
                    const driverId = driverIdMap[currentActiveTrip.driver] || 'D-001';

                    const payoutDetails = await ApiService.getDriverPayoutDetails(driverId);

                    if (payoutDetails) {
                        setDriverPayoutDetails(payoutDetails);
                    } else {
                        setPaymentError("Driver hasn't configured payout details yet.");
                    }

                    // Fetch mobile money operators
                    const operators = await ApiService.getMobileMoneyOperators();
                    setMobileMoneyOperators(operators);

                } catch (error) {
                    console.error('Error fetching payment data:', error);
                    setPaymentError('Failed to load payment information. Please try again.');
                } finally {
                    setIsLoadingDriverDetails(false);
                }
            }
        };

        fetchPaymentData();
    }, [isPaymentModalOpen, currentActiveTrip]);

    // Filtered Listings
    const filteredRideShares = rideShareListings.filter(post =>
        post.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.origin.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredHireListings = forHireListings.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    const handleRequestSubmit = () => {
        if (!selectedBooking) return;

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

        setHistory(prev => [newTrip, ...prev]);
        setRequestStep('success');

        setTimeout(() => {
            setIsRequestModalOpen(false);
            setRequestStep('review');
            setSelectedBooking(null);
            // Note: We are NOT auto-switching tabs here based on user feedback
            // But a toast or notification would be good in a real app
        }, 1500);
    };

    const handleConfirmBoarding = () => {
        if (currentActiveTrip) {
            const updatedHistory = history.map(h => h.id === currentActiveTrip.id ? { ...h, status: 'In Progress' } : h);
            setHistory(updatedHistory);
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
            // Get the provider ref ID based on selected mobile provider
            const providerRefId = mobileProvider === 'airtel' ? 'airtel_mw' : 'tnm_mpamba_mw';

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
            console.log(`Amount: MWK ${currentActiveTrip.price.toLocaleString()}`);
            console.log(`Provider: ${mobileProvider}`);

            // Call PayChangu API
            const response = await ApiService.initiatePayment(paymentData);

            if (response.status === 'error') {
                throw new Error(response.message);
            }

            // Store charge ID for verification
            if (response.data?.charge_id) {
                setCurrentChargeId(response.data.charge_id);

                // Start polling for payment verification
                pollPaymentStatus(response.data.charge_id);
            } else {
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
                        <DashboardIcon className="w-5 h-5 mr-3" /> Overview
                    </button>

                    <button
                        onClick={() => setActiveTab('active-trip')}
                        className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'active-trip' ? 'text-white bg-[#2A2A2A] border border-[#FACC15]/30' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}
                    >
                        <NavigationIcon className={`w-5 h-5 mr-3 ${activeTab === 'active-trip' ? 'text-[#FACC15]' : ''}`} />
                        Active Trip
                        {activeTrips.length > 0 && <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
                    </button>

                    <button onClick={() => setActiveTab('messages')} className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'messages' ? 'text-white bg-[#2A2A2A]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <ChatBubbleIcon className="w-5 h-5 mr-3" /> Messages
                    </button>
                    <button onClick={() => setActiveTab('market')} className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'market' ? 'text-white bg-[#2A2A2A]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <MarketIcon className="w-5 h-5 mr-3" /> Marketplace
                    </button>
                    <button onClick={() => setActiveTab('trips')} className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'trips' ? 'text-white bg-[#2A2A2A]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <HistoryIcon className="w-5 h-5 mr-3" /> My Trips
                    </button>
                    <button onClick={() => setActiveTab('financials')} className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'financials' ? 'text-white bg-[#2A2A2A]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <WalletIcon className="w-5 h-5 mr-3" /> Financials
                    </button>
                    <button onClick={() => setActiveTab('distance')} className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'distance' ? 'text-white bg-[#2A2A2A]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <MapIcon className="w-5 h-5 mr-3" /> Distance
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
                <header className="h-20 flex items-center justify-between px-6 lg:px-10 bg-[#121212] border-b border-[#2A2A2A] shrink-0 z-30">
                    <div className="flex items-center">
                        <button className="lg:hidden mr-4 text-gray-400" onClick={() => setSidebarOpen(true)}>
                            <MenuIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-white hidden md:block">
                            {activeTab === 'overview' ? 'Dashboard' :
                                activeTab === 'messages' ? 'Messages' :
                                    activeTab === 'market' ? 'Ride Market' :
                                        activeTab === 'trips' ? 'My Trips' :
                                            activeTab === 'active-trip' ? 'Active Trip' :
                                                activeTab === 'financials' ? 'Total Spent' :
                                                    'Distance Analytics'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Bar for Market */}
                        {activeTab === 'market' && (
                            <div className="relative hidden md:block">
                                <input
                                    type="text"
                                    placeholder={marketTab === 'share' ? "Search destinations..." : "Search vehicle types..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-[#1E1E1E] border border-[#333] rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-[#FACC15] outline-none w-64"
                                />
                                <SearchIcon className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#252525] rounded-full flex items-center justify-center border border-[#333]">
                                <UserIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className={`flex-1 overflow-y-auto ${activeTab === 'active-trip' ? 'p-0' : 'p-6 lg:p-8'}`}>

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
                                                    {currentActiveTrip.status === 'Inbound' ? 'Driver is on the way.' :
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
                                        </div>

                                        <div className="p-6 flex-1 overflow-y-auto">
                                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Driver Details</h3>
                                            <div className="flex items-center gap-4 mb-6 bg-[#252525] p-4 rounded-xl border border-[#333]">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${currentActiveTrip.driver}&background=random`}
                                                    alt="Driver"
                                                    className="w-12 h-12 rounded-full border-2 border-[#FACC15]"
                                                />
                                                <div>
                                                    <div className="text-white font-bold">{currentActiveTrip.driver}</div>
                                                    <div className="text-xs text-gray-400">Toyota Corolla • MC 9928</div>
                                                    <div className="flex items-center gap-1 text-[#FACC15] text-xs mt-1">
                                                        <StarIcon className="w-3 h-3" /> 4.9
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 mb-6">
                                                <button className="flex-1 py-3 bg-[#252525] text-white rounded-xl font-bold text-sm hover:bg-[#333] transition-colors flex items-center justify-center gap-2 border border-[#333]">
                                                    <PhoneIcon className="w-4 h-4" /> Call
                                                </button>
                                                <button
                                                    onClick={() => setActiveTab('messages')}
                                                    className="flex-1 py-3 bg-[#FACC15] text-black rounded-xl font-bold text-sm hover:bg-[#EAB308] transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <ChatBubbleIcon className="w-4 h-4" /> Message
                                                </button>
                                            </div>

                                            {/* NEW SECTION HERE */}
                                            {(currentActiveTrip.status === 'In Progress' || currentActiveTrip.status === 'Payment Due') && (
                                                <div className="pt-6 border-t border-[#2A2A2A]">
                                                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Trip Actions</h3>
                                                    {currentActiveTrip.status === 'In Progress' && (
                                                        <button
                                                            onClick={handleManualEndTrip}
                                                            className="w-full py-3 border-2 border-red-500/30 text-red-400 rounded-xl font-bold text-sm hover:bg-red-500/10 hover:border-red-500/50 transition-colors"
                                                        >
                                                            End Trip Manually
                                                        </button>
                                                    )}
                                                    {currentActiveTrip.status === 'Payment Due' && (
                                                        <button
                                                            onClick={() => {
                                                                setIsPaymentModalOpen(true);
                                                                setPaymentStep('method');
                                                            }}
                                                            className="w-full py-3 bg-[#FACC15] text-black rounded-xl font-bold text-sm hover:bg-[#EAB308] transition-colors shadow-lg animate-pulse"
                                                        >
                                                            Complete Payment
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Panel: Mock Map */}
                                    <div className="flex-1 relative bg-[#1E1E1E]">
                                        <MockMap status={currentActiveTrip.status} />
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
                                        onClick={() => setActiveTab('market')}
                                        className="px-8 py-3 bg-[#FACC15] text-black font-bold rounded-xl hover:bg-[#EAB308] transition-colors"
                                    >
                                        Go to Marketplace
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- OVERVIEW TAB --- */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-fadeIn">
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
                                            Track Live <MapIcon className="w-4 h-4" />
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
                                    value={`MWK ${stats.totalSpend.toLocaleString()}`}
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
                                                    formatter={(value: number) => [`MWK ${value.toLocaleString()}`, 'Spent']}
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
                    {activeTab === 'messages' && (
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
                    )}

                    {/* --- MARKET TAB (DRIVER POSTS) --- */}
                    {activeTab === 'market' && (
                        <div className="animate-fadeIn">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                                <div className="bg-[#1E1E1E] p-1 rounded-xl border border-[#2A2A2A] flex">
                                    <button
                                        onClick={() => setMarketTab('share')}
                                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${marketTab === 'share' ? 'bg-[#FACC15] text-black' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Ride Share
                                    </button>
                                    <button
                                        onClick={() => setMarketTab('hire')}
                                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${marketTab === 'hire' ? 'bg-[#FACC15] text-black' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        For Hire
                                    </button>
                                </div>
                                <p className="text-gray-500 text-sm">
                                    Browse listings posted directly by drivers.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {marketTab === 'share' ? (
                                    filteredRideShares.length > 0 ? (
                                        filteredRideShares.map(post => (
                                            <div key={post.id} className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A] hover:border-[#FACC15]/50 transition-all group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-[#252525] rounded-full flex items-center justify-center text-[#FACC15]">
                                                            <CarIcon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-white text-sm">{post.driverName}</h4>
                                                            <div className="flex items-center gap-1 text-xs text-[#FACC15]">
                                                                <StarIcon className="w-3 h-3" /> {post.driverRating}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-[#FACC15]/10 text-[#FACC15] px-3 py-1 rounded-lg font-bold text-sm">
                                                        MWK {post.price.toLocaleString()}
                                                    </div>
                                                </div>

                                                <div className="space-y-3 mb-6">
                                                    <div className="flex items-center justify-between p-3 bg-[#252525] rounded-xl">
                                                        <div>
                                                            <div className="text-[10px] text-gray-500 uppercase font-bold">From</div>
                                                            <div className="text-white font-bold text-sm">{post.origin}</div>
                                                        </div>
                                                        <div className="text-gray-600">→</div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-500 uppercase font-bold">To</div>
                                                            <div className="text-white font-bold text-sm">{post.destination}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1 bg-[#252525] p-2 rounded-lg text-center">
                                                            <div className="text-[10px] text-gray-500 uppercase">Date</div>
                                                            <div className="text-xs font-bold text-white">{post.date}</div>
                                                        </div>
                                                        <div className="flex-1 bg-[#252525] p-2 rounded-lg text-center">
                                                            <div className="text-[10px] text-gray-500 uppercase">Time</div>
                                                            <div className="text-xs font-bold text-white">{post.time}</div>
                                                        </div>
                                                        <div className="flex-1 bg-[#252525] p-2 rounded-lg text-center">
                                                            <div className="text-[10px] text-gray-500 uppercase">Seats</div>
                                                            <div className="text-xs font-bold text-white">{post.seats}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => initiateRequest(post, 'share')}
                                                    className="w-full py-3 bg-[#FACC15] text-black font-bold rounded-xl hover:bg-[#EAB308] transition-colors"
                                                >
                                                    Request Ride
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-10 text-gray-500">No ride share listings found.</div>
                                    )
                                ) : (
                                    filteredHireListings.length > 0 ? (
                                        filteredHireListings.map(post => (
                                            <div key={post.id} className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A] hover:border-[#FACC15]/50 transition-all group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <div className="text-xs text-[#FACC15] font-bold uppercase tracking-wider mb-1">{post.category}</div>
                                                        <h3 className="text-lg font-bold text-white leading-tight">{post.title}</h3>
                                                    </div>
                                                    <div className="w-8 h-8 bg-[#252525] rounded-full flex items-center justify-center text-gray-400">
                                                        <BriefcaseIcon className="w-4 h-4" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-6 text-sm">
                                                    <div className="flex justify-between border-b border-[#333] pb-2">
                                                        <span className="text-gray-500">Location</span>
                                                        <span className="text-white">{post.location}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-[#333] pb-2">
                                                        <span className="text-gray-500">Rate</span>
                                                        <span className="text-white font-bold">{post.rate}</span>
                                                    </div>
                                                    <div className="flex justify-between pt-1">
                                                        <span className="text-gray-500">Driver</span>
                                                        <span className="text-white">{post.driverName} ({post.driverRating}★)</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => initiateRequest(post, 'hire')}
                                                    className="w-full py-3 bg-[#252525] text-white border border-[#333] font-bold rounded-xl hover:bg-[#FACC15] hover:text-black hover:border-[#FACC15] transition-all"
                                                >
                                                    Request Hire
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-10 text-gray-500">No vehicle listings found.</div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- FINANCIALS TAB (REVENUE/SPENDING) --- */}
                    {activeTab === 'financials' && (
                        <div className="max-w-6xl mx-auto animate-fadeIn space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-[#1E1E1E] p-6 rounded-3xl border border-[#2A2A2A] flex flex-col justify-between h-40">
                                    <h3 className="text-gray-400 text-sm font-medium">Total Spent</h3>
                                    <div className="text-3xl font-bold text-white">MWK {stats.totalSpend.toLocaleString()}</div>
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
                                                    <td className="px-6 py-4 text-right font-bold text-white">MWK {tx.amount.toLocaleString()}</td>
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
                    )}

                    {/* --- TRIPS TAB (HISTORY) --- */}
                    {activeTab === 'trips' && (
                        <div className="max-w-4xl mx-auto animate-fadeIn">

                            {/* Active Trips Link / Teaser */}
                            {activeTrips.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('active-trip')}
                                    className="w-full mb-8 bg-gradient-to-r from-[#1E1E1E] to-[#252525] border border-[#FACC15]/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(250,204,21,0.05)] hover:border-[#FACC15] transition-all group text-left"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <span className="relative flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FACC15] opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FACC15]"></span>
                                                </span>
                                                Go to Active Trip
                                            </h3>
                                            <p className="text-sm text-gray-400 mt-1">You have {activeTrips.length} trip(s) in progress or pending.</p>
                                        </div>
                                        <div className="bg-[#FACC15] p-2 rounded-full text-black group-hover:scale-110 transition-transform">
                                            <NavigationIcon className="w-5 h-5" />
                                        </div>
                                    </div>
                                </button>
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
                                                            src={`https://ui-avatars.com/api/?name=${trip.driver}&background=random`}
                                                            alt={trip.driver}
                                                            className="w-10 h-10 rounded-full border border-[#333]"
                                                        />
                                                        <div>
                                                            <div className="text-sm font-bold text-white">{trip.driver}</div>
                                                            <div className="flex items-center text-[#FACC15] text-xs">
                                                                {Array.from({ length: trip.rating || 0 }).map((_, i) => <span key={i}>★</span>)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-gray-500 text-xs">Total Fare</div>
                                                        <div className="text-2xl font-bold text-white">MWK {trip.price.toLocaleString()}</div>
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
                    )}

                    {/* --- DISTANCE TAB --- */}
                    {activeTab === 'distance' && (
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
                                        <AreaChart data={stats.chartData.map(d => ({ ...d, value: d.value * 1.5 }))}> {/* Mock scaling for distance demo */}
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
                    )}
                </div>
            </main>

            {/* REQUEST MODAL (NO PAYMENT) */}
            {isRequestModalOpen && (
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
                                                        {bookingType === 'share' ? `MWK ${selectedBooking.price.toLocaleString()}` : selectedBooking.rate}
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center bg-[#121212] border border-[#333] rounded-lg px-2 w-32 focus-within:border-[#FACC15]">
                                                        <span className="text-[#FACC15] text-xs mr-1">MWK</span>
                                                        <input
                                                            type="number"
                                                            value={offerPrice}
                                                            onChange={(e) => setOfferPrice(e.target.value)}
                                                            className="bg-transparent text-white font-bold text-right w-full py-1 outline-none"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-lg font-bold text-white">Estimated Total</span>
                                                <span className="text-2xl font-bold text-[#FACC15]">
                                                    MWK {getCalculatedTotal().toLocaleString()}
                                                </span>
                                            </div>

                                            <p className="text-xs text-gray-500 text-center mt-2">
                                                Payment will be collected after the trip is completed.
                                            </p>

                                            <button
                                                onClick={handleRequestSubmit}
                                                className="w-full py-4 bg-[#FACC15] text-black font-bold rounded-xl hover:bg-[#EAB308] transition-all shadow-lg shadow-[#FACC15]/20 mt-4"
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
            )}

            {/* PAYMENT MODAL (Post-Trip) */}
            {isPaymentModalOpen && (
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
                                <div className="p-6 border-b border-[#333] bg-[#252525] text-center">
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
                                                    <div className="text-white font-bold text-sm">{currentActiveTrip?.driver || 'Unknown Driver'}</div>
                                                    <div className="text-xs text-gray-500">Payout details not available</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mb-6 text-center">
                                        <p className="text-gray-400 text-xs uppercase font-bold mb-1">Total Amount Due</p>
                                        <p className="text-3xl font-bold text-[#FACC15]">MWK {currentActiveTrip ? currentActiveTrip.price.toLocaleString() : '0'}</p>
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
            )}

            {/* RATING MODAL */}
            {isRatingModalOpen && (
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
            )}

        </div>
    );
};
