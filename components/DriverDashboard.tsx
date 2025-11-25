
import React, { useState, useEffect, useRef } from 'react';
import {
    CarIcon, MapIcon, SteeringWheelIcon, DashboardIcon,
    SearchIcon, CloseIcon, MenuIcon, PlusIcon, CheckBadgeIcon,
    PencilIcon, TrashIcon, CreditCardIcon, PhoneIcon, ChatIcon, SendIcon,
    BriefcaseIcon, TruckIcon, PackageIcon, HandshakeIcon, StarIcon, DocumentIcon
} from './Icons';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { ApiService, Conversation, Message } from '../services/api';

// --- Local Icon Definitions ---

const BellIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const MoreIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
);

const ChartBarIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
    </svg>
);

const ExportIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const LocationMarkerIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const SpinnerIcon = ({ className }: { className?: string }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const BookmarkIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
);

interface DriverDashboardProps {
    onLogout: () => void;
}

const hireCategories = [
    "Small Cars (Sedans & Hatchbacks)",
    "Standard & Executive Cars",
    "SUVs & 4x4s",
    "Minibuses & Vans",
    "Pickups & Utilities",
    "Trucks & Logistics",
    "Buses & Coaches",
    "Construction & Heavy Machinery",
    "Agricultural & Farm Equipment",
    "Special Purpose",
    "Light Vehicles"
];

const subscriptionPlans = {
    '1m': { id: '1m', label: 'Monthly', price: 49900, discount: 0, billing: 'Billed monthly' },
    '3m': { id: '3m', label: 'Quarterly', price: 134900, discount: 10, billing: 'Billed every 3 months' },
    '6m': { id: '6m', label: 'Bi-Annual', price: 254900, discount: 15, billing: 'Billed every 6 months' },
    '1y': { id: '1y', label: 'Yearly', price: 479900, discount: 20, billing: 'Billed annually' }
};

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ onLogout }) => {
    // Global State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'tracking' | 'history' | 'subscription' | 'trips' | 'distance' | 'hours' | 'ontime' | 'inventory' | 'messages' | 'documents'>('overview');
    const [driverProfile] = useState(ApiService.getDriverProfile());

    // Interactive Features State
    const [isOnline, setIsOnline] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [selectedTimeRange, setSelectedTimeRange] = useState<'Last Week' | 'Last Month' | 'This Year'>('Last Week');

    const searchInputRef = useRef<HTMLInputElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Notifications Data - Initialized from API
    const [notifications, setNotifications] = useState(ApiService.getDriverNotifications());
    const unreadCount = notifications.filter(n => n.unread).length;

    // Subscription Page State
    const [selectedDuration, setSelectedDuration] = useState<'1m' | '3m' | '6m' | '1y'>('1m');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile' | null>(null);
    const [mobileProvider, setMobileProvider] = useState<'airtel' | 'mpamba'>('airtel');
    const [isSubscriptionPaid, setIsSubscriptionPaid] = useState(false);
    const [subStartDate] = useState(new Date().getDate() < 15 ? new Date(new Date().setMonth(new Date().getMonth() - 1)) : new Date());
    const [subEndDate] = useState(new Date(new Date().setMonth(subStartDate.getMonth() + 1)));

    // Analytics State
    const [profitRange, setProfitRange] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
    const [settleAmount, setSettleAmount] = useState('');
    const [settleDesc, setSettleDesc] = useState('');

    // Transactions Data - Initialized from API
    const [transactions, setTransactions] = useState(ApiService.getDriverTransactions());

    // Vehicles Inventory State
    const [myVehicles, setMyVehicles] = useState(ApiService.getDriverVehicles().map(v => ({
        ...v,
        category: 'Trucks & Logistics', // Default fallback for mock data
        rate: 'MWK 150,000/day' // Default fallback
    })));

    // Add Vehicle State
    const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
    const [newVehicle, setNewVehicle] = useState({
        name: '',
        plate: '',
        category: hireCategories[0],
        rate: '',
        status: 'Available'
    });

    // Booking Modal State
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingItem, setBookingItem] = useState<any>(null);
    const [bookingType, setBookingType] = useState<'share' | 'hire'>('share');
    const [clientInfo, setClientInfo] = useState({ name: '', id: '' });

    // Messaging State
    const [conversations, setConversations] = useState<Conversation[]>(ApiService.getDriverConversations());
    const [activeChatId, setActiveChatId] = useState<string>(conversations[0]?.id || '');
    const [messageInput, setMessageInput] = useState('');

    // Jobs State
    const [jobType, setJobType] = useState<'share' | 'hire'>('share');
    const [newRide, setNewRide] = useState({ origin: '', destination: '', date: '', time: '', price: '', seats: '' });
    const [editingId, setEditingId] = useState<number | null>(null); // Track which listing is being edited

    // Mock Requests for Driver Approval
    const [incomingRequests, setIncomingRequests] = useState([
        { id: 101, type: 'share', title: 'Ride Request', user: 'Alice Wonder', route: 'Blantyre → Lilongwe', date: 'Oct 30', seats: 1, price: 25000 },
        { id: 102, type: 'hire', title: '3-Ton Truck Hire', user: 'Bob Builder', location: 'Lilongwe', duration: '2 Days', price: 400000 }
    ]);

    // Initialized from API
    const [activePosts, setActivePosts] = useState(ApiService.getDriverActivePosts());
    const [newHireJob, setNewHireJob] = useState({ title: '', category: 'Small Cars (Sedans & Hatchbacks)', location: '', rate: '' });
    const [myHirePosts, setMyHirePosts] = useState(ApiService.getDriverHirePosts());
    const [contractedJobs, setContractedJobs] = useState(ApiService.getDriverContractedJobs().map(job => ({
        ...job,
        clientName: '', // Add default client name
        clientId: ''    // Add default client id
    })));

    // Documents/Verification Page State
    const [payoutMethod, setPayoutMethod] = useState<'Bank' | 'Airtel Money' | 'Mpamba'>('Bank');
    const [payoutDetails, setPayoutDetails] = useState<any>({});
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [licensePreview, setLicensePreview] = useState<string | null>(null);
    const [documentsSaving, setDocumentsSaving] = useState(false);

    // --- Interactive Logic ---

    // Click outside handler for notifications
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleJobAction = (jobId: number, currentStatus: string) => {
        let nextStatus = currentStatus;
        if (currentStatus === 'Scheduled') nextStatus = 'Inbound';
        else if (currentStatus === 'Inbound') nextStatus = 'Arrived';
        else if (currentStatus === 'Arrived') nextStatus = 'In Progress'; // Ideally waits for rider
        else if (currentStatus === 'Boarded') nextStatus = 'In Progress';
        else if (currentStatus === 'In Progress') nextStatus = 'Payment Due';
        else if (currentStatus === 'Payment Due') nextStatus = 'Completed';

        setContractedJobs(contractedJobs.map(j =>
            j.id === jobId ? { ...j, status: nextStatus } : j
        ));
    };

    // Filtered Transactions based on Search
    const filteredTransactions = transactions.filter(t =>
        t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.amount.toString().includes(searchQuery)
    );

    // Filtered Jobs based on Search
    const filteredContractedJobs = contractedJobs.filter(j =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.destination.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleExportCSV = () => {
        setIsExporting(true);
        // Simulate processing delay
        setTimeout(() => {
            const headers = ["ID,Description,Date,Amount,Method,Details"];
            const rows = transactions.map(t => `${t.id},${t.desc},${t.date},${t.amount},${t.method},${t.sub}`);
            const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "ridex_transactions.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setIsExporting(false);
        }, 1500);
    };

    const markAllNotificationsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
    };

    const cycleTimeRange = () => {
        const ranges = ['Last Week', 'Last Month', 'This Year'] as const;
        const currentIndex = ranges.indexOf(selectedTimeRange);
        const nextIndex = (currentIndex + 1) % ranges.length;
        setSelectedTimeRange(ranges[nextIndex]);
    };

    const handlePostRide = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRide.origin || !newRide.destination) return;

        if (editingId) {
            // Update existing ride
            setActivePosts(activePosts.map(p => p.id === editingId ? {
                ...p,
                origin: newRide.origin,
                destination: newRide.destination,
                date: newRide.date,
                time: newRide.time,
                price: Number(newRide.price),
                seats: Number(newRide.seats)
            } : p));
            setEditingId(null);
        } else {
            // Create new ride
            const post = {
                id: Date.now(), // Note: ApiService types might use string ID if stricter, but number is fine here for React state
                origin: newRide.origin,
                destination: newRide.destination,
                date: newRide.date || new Date().toISOString().split('T')[0],
                time: newRide.time || '12:00',
                price: Number(newRide.price) || 0,
                seats: Number(newRide.seats) || 1
            };
            // @ts-ignore: simple ID mismatch for demo
            setActivePosts([post, ...activePosts]);
        }
        setNewRide({ origin: '', destination: '', date: '', time: '', price: '', seats: '' });
    };

    const handlePostHireJob = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHireJob.title || !newHireJob.location) return;

        if (editingId) {
            // Update existing listing
            setMyHirePosts(myHirePosts.map(p => p.id === editingId ? {
                ...p,
                title: newHireJob.title,
                category: newHireJob.category,
                location: newHireJob.location,
                rate: newHireJob.rate
            } : p));
            setEditingId(null);
        } else {
            // Create new listing
            const post = {
                id: Date.now(),
                title: newHireJob.title,
                category: newHireJob.category,
                location: newHireJob.location,
                rate: newHireJob.rate,
                status: 'Active'
            };
            // @ts-ignore: simple ID mismatch for demo
            setMyHirePosts([post, ...myHirePosts]);
        }
        setNewHireJob({ title: '', category: hireCategories[0], location: '', rate: '' });
    }

    const cancelEdit = () => {
        setEditingId(null);
        setNewRide({ origin: '', destination: '', date: '', time: '', price: '', seats: '' });
        setNewHireJob({ title: '', category: hireCategories[0], location: '', rate: '' });
    };

    const startEditRide = (post: any) => {
        setEditingId(post.id);
        setNewRide({
            origin: post.origin,
            destination: post.destination,
            date: post.date,
            time: post.time,
            price: post.price.toString(),
            seats: post.seats.toString()
        });
        setJobType('share');
    };

    const startEditHire = (post: any) => {
        setEditingId(post.id);
        setNewHireJob({
            title: post.title,
            category: post.category,
            location: post.location,
            rate: post.rate
        });
        setJobType('hire');
    };

    const openBookingModal = (item: any, type: 'share' | 'hire') => {
        setBookingItem(item);
        setBookingType(type);
        setClientInfo({ name: '', id: '' });
        setIsBookingModalOpen(true);
    };

    const handleConfirmBooking = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingItem) return;

        if (bookingType === 'share') {
            const newJob = {
                id: Date.now(),
                title: `Ride Share Request`,
                origin: bookingItem.origin,
                destination: bookingItem.destination,
                date: bookingItem.date,
                payout: bookingItem.price,
                status: 'Scheduled',
                type: 'share',
                clientName: clientInfo.name,
                clientId: clientInfo.id
            };
            // @ts-ignore
            setContractedJobs([newJob, ...contractedJobs]);
            setActivePosts(activePosts.filter(p => p.id !== bookingItem.id));
        } else {
            const newJob = {
                id: Date.now(),
                title: bookingItem.title,
                origin: bookingItem.location,
                destination: 'Client Site', // Generic placeholder
                date: new Date().toISOString().split('T')[0], // Assume effective immediately
                payout: parseFloat(bookingItem.rate.replace(/[^0-9.]/g, '')) || 150,
                status: 'Scheduled',
                type: 'hire',
                clientName: clientInfo.name,
                clientId: clientInfo.id
            };
            // @ts-ignore
            setContractedJobs([newJob, ...contractedJobs]);
            setMyHirePosts(myHirePosts.filter(p => p.id !== bookingItem.id));
        }

        if (editingId === bookingItem.id) cancelEdit();
        setIsBookingModalOpen(false);
        setBookingItem(null);
    };

    const handleApproveRequest = (id: number) => {
        // Logic to move to contracted jobs
        const req = incomingRequests.find(r => r.id === id);
        if (req) {
            const newJob = {
                id: Date.now(),
                title: req.title,
                origin: req.type === 'share' ? (req.route?.split(' → ')[0] ?? '') : req.location,
                destination: req.type === 'share' ? (req.route?.split(' → ')[1] ?? 'Client Site') : 'Client Site',
                date: req.date || 'ASAP',
                payout: req.price,
                status: 'Scheduled',
                type: req.type,
                clientName: req.user,
                clientId: 'REQ-' + req.id
            };
            // @ts-ignore
            setContractedJobs([newJob, ...contractedJobs]);
            setIncomingRequests(incomingRequests.filter(r => r.id !== id));
            alert('Request Approved! Added to your jobs.');
        }
    };

    const handleDeclineRequest = (id: number) => {
        setIncomingRequests(incomingRequests.filter(r => r.id !== id));
    };

    const handleSelectInventory = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const vehicleId = Number(e.target.value);
        const vehicle = myVehicles.find(v => v.id === vehicleId);

        if (vehicle) {
            setNewHireJob({
                ...newHireJob,
                title: `${vehicle.name} Available`,
                category: vehicle.category,
                rate: vehicle.rate || ''
            });
        }
    };

    const handleAddVehicle = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVehicle.name || !newVehicle.plate) return;

        const newItem = {
            id: Date.now(),
            name: newVehicle.name,
            plate: newVehicle.plate,
            status: newVehicle.status,
            category: newVehicle.category,
            rate: newVehicle.rate
        };

        // @ts-ignore
        setMyVehicles([...myVehicles, newItem]);
        setNewVehicle({ name: '', plate: '', category: hireCategories[0], rate: '', status: 'Available' });
        setIsAddVehicleOpen(false);
    };

    const handleDeleteVehicle = (id: number) => {
        if (window.confirm('Are you sure you want to delete this vehicle from your fleet?')) {
            setMyVehicles(myVehicles.filter(v => v.id !== id));
        }
    };

    const handleAddSettlement = () => {
        if (!settleAmount) return;
        const amount = parseFloat(settleAmount);
        const newTx = {
            id: Date.now(),
            type: 'Settlement',
            desc: settleDesc || 'Physical Settlement',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            amount: amount,
            method: 'Physical',
            sub: 'Settled Manually'
        };
        // @ts-ignore: simple ID mismatch for demo
        setTransactions([newTx, ...transactions]);
        setSettleAmount('');
        setSettleDesc('');
    };

    const handlePayment = () => {
        setTimeout(() => {
            setIsSubscriptionPaid(true);
            setPaymentMethod(null);
            alert('Payment processed successfully! Calendar updated.');
        }, 1000);
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

    // Documents Page Handlers
    const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLicenseFile(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setLicensePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDocumentsSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setDocumentsSaving(true);

        // Simulate API call to save documents
        setTimeout(() => {
            setDocumentsSaving(false);
            alert("Documents saved successfully! Your verification is pending admin approval.");
        }, 1500);
    };


    // --- Mock Data for Visuals (Loaded from API where applicable) ---
    // const myVehicles is now state

    const profitChartData = {
        Weekly: [
            { name: 'Mon', value: 45000 }, { name: 'Tue', value: 52000 }, { name: 'Wed', value: 48000 },
            { name: 'Thu', value: 60000 }, { name: 'Fri', value: 85000 }, { name: 'Sat', value: 92000 }, { name: 'Sun', value: 75000 }
        ],
        Monthly: [
            { name: 'Jan', value: 1200000 }, { name: 'Feb', value: 1450000 }, { name: 'Mar', value: 1380000 },
            { name: 'Apr', value: 1650000 }, { name: 'May', value: 1820000 }, { name: 'Jun', value: 2100000 },
            { name: 'Jul', value: 2250000 }, { name: 'Aug', value: 2400000 }, { name: 'Sep', value: 2350000 },
            { name: 'Oct', value: 2510000 }, { name: 'Nov', value: 420000 }, { name: 'Dec', value: 0 }
        ],
        Yearly: [
            { name: '2020', value: 15000000 }, { name: '2021', value: 18500000 }, { name: '2022', value: 21000000 }, { name: '2023', value: 26500000 }
        ]
    };

    // Analytics Data
    const tripHistoryData = [
        { name: 'Week 1', share: 12, hire: 4 },
        { name: 'Week 2', share: 15, hire: 5 },
        { name: 'Week 3', share: 18, hire: 3 },
        { name: 'Week 4', share: 22, hire: 7 },
    ];

    const distanceData = [
        { name: 'Mon', km: 120 },
        { name: 'Tue', km: 180 },
        { name: 'Wed', km: 150 },
        { name: 'Thu', km: 220 },
        { name: 'Fri', km: 300 },
        { name: 'Sat', km: 250 },
        { name: 'Sun', km: 80 },
    ];

    const drivingHoursData = [
        { name: 'Mon', day: 6, night: 2 },
        { name: 'Tue', day: 7, night: 1 },
        { name: 'Wed', day: 5, night: 3 },
        { name: 'Thu', day: 8, night: 4 },
        { name: 'Fri', day: 6, night: 5 },
        { name: 'Sat', day: 4, night: 6 },
        { name: 'Sun', day: 2, night: 0 },
    ];

    const onTimeData = [
        { name: 'On Time', value: 85, color: '#22c55e' },
        { name: 'Late (<15m)', value: 10, color: '#FACC15' },
        { name: 'Late (>15m)', value: 5, color: '#ef4444' },
    ];


    const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const octDays = Array.from({ length: 31 }, (_, i) => i + 1);
    const novDays = Array.from({ length: 30 }, (_, i) => i + 1);

    // Reusable Components
    const MapWidget = () => (
        <div className="bg-[#1E1E1E] rounded-3xl p-4 border border-[#2A2A2A] h-full relative min-h-[400px] shadow-lg shadow-black/20 hover:shadow-[0_0_30px_rgba(250,204,21,0.1)] hover:border-[#FACC15]/30 transition-all duration-300">
            <div className="w-full h-full rounded-2xl bg-[#121212] relative overflow-hidden opacity-100 border border-[#333]">
                <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <path d="M100 400 L200 300 L250 320 L400 150 L600 180 L700 100" stroke="#333" strokeWidth="8" fill="none" />
                    <path d="M100 400 L200 300 L250 320 L400 150 L600 180 L700 100" stroke="#FACC15" strokeWidth="3" fill="none" strokeDasharray="10 5" />
                </svg>

                {/* Online Pulse Indicator on Map */}
                {isOnline && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-96 h-96 border border-[#FACC15]/20 rounded-full animate-ping"></div>
                    </div>
                )}

                <div className="absolute top-[150px] left-[400px] transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                        <div className="w-16 h-16 bg-[#FACC15]/20 rounded-full animate-ping absolute inset-0"></div>
                        <div className="w-16 h-16 bg-[#FACC15]/10 rounded-full flex items-center justify-center relative z-10 backdrop-blur-sm border border-[#FACC15]/30">
                            <div className="w-3 h-3 bg-[#FACC15] rounded-full shadow-[0_0_10px_#FACC15]"></div>
                        </div>
                        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 mt-4 bg-[#1E1E1E] border border-[#FACC15]/50 text-white px-3 py-2 rounded-lg shadow-xl min-w-[180px]">
                            <div className="flex items-center gap-2 mb-1">
                                <LocationMarkerIcon className="w-4 h-4 text-[#FACC15]" />
                                <span className="font-bold text-xs text-[#FACC15]">Current Location</span>
                            </div>
                            <div className="text-xs text-gray-300 font-medium">Area 18 Roundabout</div>
                            <div className="text-[10px] text-gray-500">Lilongwe, Malawi</div>
                        </div>
                    </div>
                </div>

                <div className="absolute right-4 bottom-12 flex flex-col gap-2">
                    <button className="w-8 h-8 bg-[#1E1E1E] border border-[#333] text-white rounded-lg flex items-center justify-center shadow-lg font-bold text-lg hover:bg-[#252525]">+</button>
                    <button className="w-8 h-8 bg-[#1E1E1E] border border-[#333] text-white rounded-lg flex items-center justify-center shadow-lg font-bold text-lg hover:bg-[#252525]">-</button>
                </div>
                <div className="absolute right-4 bottom-4">
                    <button className="w-8 h-8 bg-[#FACC15] text-black rounded-lg flex items-center justify-center shadow-lg hover:bg-[#EAB308]">
                        <LocationMarkerIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    const CurrentTripWidget = () => (
        <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A] h-full shadow-lg shadow-black/20 flex flex-col hover:shadow-[0_0_30px_rgba(250,204,21,0.1)] hover:border-[#FACC15]/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Current trip</h3>
                <button className="p-1 bg-[#2A2A2A] rounded-lg text-gray-400"><MoreIcon className="w-4 h-4" /></button>
            </div>

            <div className="relative pl-4 space-y-6 flex-1 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#2A2A2A]">
                {/* Trip steps - static for demo */}
                <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-[#2A2A2A] bg-[#1E1E1E] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-transparent border border-[#FACC15]"></div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Departure</p>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-white">Blantyre</span>
                        <span className="text-xs text-gray-400">12:45 PM</span>
                    </div>
                </div>
                {/* ... Middle Stops ... */}
                <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-[#2A2A2A] bg-[#1E1E1E] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#FACC15]/20 flex items-center justify-center">
                            <div className="w-1 h-1 bg-[#FACC15] rounded-full"></div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Stop</p>
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-300">Ntcheu</span>
                        <span className="text-xs text-gray-400">15:45 PM</span>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-[#2A2A2A] bg-[#1E1E1E] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Arrival</p>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-white">Lilongwe, Area 3</span>
                        <span className="text-xs text-gray-400">18:30 PM</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-[#252525] rounded-xl flex items-center text-[#FACC15] text-sm font-medium border border-[#FACC15]/20">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Duration: 5 hours 45 min
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#121212] text-white font-sans overflow-hidden selection:bg-[#FACC15] selection:text-black">

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
            )}

            <aside className={`fixed lg:relative z-50 w-64 h-full bg-[#1E1E1E] border-r border-[#2A2A2A] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="h-20 flex items-center px-8 border-b border-[#2A2A2A]">
                    <SteeringWheelIcon className="w-8 h-8 text-[#FACC15] mr-3" />
                    <span className="text-xl font-bold tracking-wide">Ridex</span>
                    <button className="ml-auto lg:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-2">
                    <button onClick={() => setActiveTab('overview')} className={`flex items-center w-full px-4 py-3 rounded-xl font-bold transition-transform hover:scale-105 ${activeTab === 'overview' ? 'text-black bg-[#FACC15]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <DashboardIcon className="w-5 h-5 mr-3" /> Overview
                    </button>
                    <button onClick={() => setActiveTab('messages')} className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'messages' ? 'text-white bg-[#2A2A2A]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <ChatIcon className="w-5 h-5 mr-3" /> Messages
                    </button>
                    <button onClick={() => setActiveTab('jobs')} className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'jobs' ? 'text-white bg-[#2A2A2A]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <BriefcaseIcon className="w-5 h-5 mr-3" /> Jobs
                    </button>
                    <button onClick={() => setActiveTab('inventory')} className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'inventory' ? 'text-white bg-[#2A2A2A]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <TruckIcon className="w-5 h-5 mr-3" /> Inventory
                    </button>
                    <button onClick={() => setActiveTab('tracking')} className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'tracking' ? 'text-white bg-[#2A2A2A]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <MapIcon className="w-5 h-5 mr-3" /> Tracking
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'history' ? 'text-white bg-[#2A2A2A]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <ChartBarIcon className="w-5 h-5 mr-3" /> Analytics
                    </button>
                    <button onClick={() => setActiveTab('documents')} className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'documents' ? 'text-white bg-[#2A2A2A]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <DocumentIcon className="w-5 h-5 mr-3" /> Documents
                    </button>
                    <button onClick={() => setActiveTab('subscription')} className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'subscription' ? 'text-white bg-[#2A2A2A]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
                        <CreditCardIcon className="w-5 h-5 mr-3" /> Subscription
                    </button>
                </nav>

                <div className="p-4 border-t border-[#2A2A2A]">
                    <button onClick={onLogout} className="flex items-center w-full px-4 py-3 text-gray-400 hover:text-[#FACC15] hover:bg-[#2A2A2A] rounded-xl font-medium transition-colors">
                        <span className="mr-3">Log Out</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="h-20 flex items-center justify-between px-6 lg:px-10 bg-[#121212] border-b border-[#2A2A2A] shrink-0 z-30">
                    <div className="flex items-center">
                        <button className="lg:hidden mr-4 text-gray-400" onClick={() => setSidebarOpen(true)}>
                            <MenuIcon className="w-6 h-6" />
                        </button>
                        <div className="hidden md:flex items-center space-x-4">
                            {['overview', 'jobs', 'messages', 'inventory', 'tracking', 'history'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`${activeTab === tab ? 'bg-[#1E1E1E] text-white border border-[#383838]' : 'text-gray-500 hover:text-white'} px-5 py-2 rounded-full text-sm font-medium transition-colors capitalize`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 lg:space-x-6">
                        {/* Interactive Search */}
                        <div className="relative flex items-center">
                            <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-64 bg-[#252525] border border-[#333] rounded-xl px-3 py-1.5' : 'w-8'}`}>
                                {isSearchOpen && (
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search jobs, transactions..."
                                        className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500"
                                        autoFocus
                                        onBlur={() => {
                                            if (!searchQuery) setIsSearchOpen(false);
                                        }}
                                    />
                                )}
                                <button
                                    onClick={() => {
                                        setIsSearchOpen(true);
                                        setTimeout(() => searchInputRef.current?.focus(), 100);
                                    }}
                                    className={`text-gray-400 hover:text-white transition-colors ${isSearchOpen ? '' : 'w-full'}`}
                                >
                                    <SearchIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Interactive Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="text-gray-400 hover:text-white transition-colors relative p-1"
                            >
                                <BellIcon className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-[#FACC15] rounded-full animate-pulse"></span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {notificationsOpen && (
                                <div className="absolute right-0 top-full mt-4 w-80 bg-[#1E1E1E] border border-[#333] rounded-xl shadow-2xl overflow-hidden z-50">
                                    <div className="p-4 border-b border-[#333] flex justify-between items-center">
                                        <h4 className="font-bold text-white text-sm">Notifications</h4>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllNotificationsRead} className="text-xs text-[#FACC15] hover:underline">Mark all read</button>
                                        )}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto no-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500 text-xs">No notifications</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id} className={`p-4 border-b border-[#333] hover:bg-[#252525] transition-colors ${n.unread ? 'bg-[#FACC15]/5' : ''}`}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`text-sm font-bold ${n.unread ? 'text-white' : 'text-gray-400'}`}>{n.title}</span>
                                                        <span className="text-[10px] text-gray-500">{n.time}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400">{n.msg}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-8 w-[1px] bg-[#2A2A2A]"></div>
                        <div className="flex items-center gap-3">
                            <img src={driverProfile.avatar} alt="Driver" className="w-9 h-9 rounded-full border border-[#FACC15]" />
                            <div className="hidden lg:block text-right">
                                <div className="text-sm font-bold text-white">{driverProfile.name}</div>
                                {/* DRIVER RATING IMPLEMENTATION */}
                                <div className="flex items-center justify-end gap-1">
                                    <StarIcon className="w-3 h-3 text-[#FACC15]" />
                                    <span className="text-[#FACC15] text-xs font-bold">{driverProfile.rating}</span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">{driverProfile.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
                    <div className="max-w-8xl mx-auto space-y-8">

                        {/* Header Section (hidden on specific pages to avoid clutter) */}
                        {!['subscription', 'trips', 'distance', 'hours', 'ontime', 'inventory', 'messages', 'documents'].includes(activeTab) && (
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm font-medium">Good morning,</p>
                                    <h1 className="text-3xl font-bold text-white mt-1">{driverProfile.name}</h1>
                                </div>
                                <div className="flex items-center gap-3 self-start md:self-auto">
                                    {/* Interactive Date Range */}
                                    <button
                                        onClick={cycleTimeRange}
                                        className="flex items-center px-4 py-2 bg-[#1E1E1E] text-gray-300 rounded-xl text-sm font-medium border border-[#2A2A2A] hover:bg-[#252525] transition-colors hover:shadow-lg hover:shadow-[#FACC15]/10 min-w-[120px] justify-center"
                                    >
                                        <CalendarIcon className="w-4 h-4 mr-2" /> {selectedTimeRange}
                                    </button>

                                    {/* Interactive CSV Export */}
                                    <button
                                        onClick={handleExportCSV}
                                        disabled={isExporting}
                                        className="flex items-center px-4 py-2 bg-[#1E1E1E] text-gray-300 rounded-xl text-sm font-medium border border-[#2A2A2A] hover:bg-[#252525] transition-colors hover:shadow-lg hover:shadow-[#FACC15]/10"
                                    >
                                        {isExporting ? <SpinnerIcon className="w-4 h-4 mr-2" /> : <ExportIcon className="w-4 h-4 mr-2" />}
                                        {isExporting ? 'Exporting...' : 'Export CSV'}
                                    </button>

                                    {/* Interactive Online Toggle */}
                                    <button
                                        onClick={() => setIsOnline(!isOnline)}
                                        className={`flex items-center px-6 py-2 rounded-xl text-sm font-bold shadow-lg transition-all transform active:scale-95 ${isOnline ? 'bg-[#FACC15] text-black hover:bg-[#EAB308]' : 'bg-[#2A2A2A] text-gray-400 hover:text-white hover:shadow-[#FACC15]/20'}`}
                                    >
                                        {isOnline && <span className="w-2 h-2 rounded-full bg-black mr-2 animate-pulse"></span>}
                                        {isOnline ? 'Online' : 'Go Online'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Online Status Banner */}
                        {isOnline && activeTab === 'overview' && (
                            <div className="bg-gradient-to-r from-[#FACC15]/20 to-transparent p-3 rounded-xl border border-[#FACC15]/30 flex items-center gap-3 animate-fadeIn">
                                <SpinnerIcon className="w-5 h-5 text-[#FACC15]" />
                                <span className="text-[#FACC15] font-bold text-sm">Scanning for nearby requests...</span>
                            </div>
                        )}

                        {/* --- New: Messages Page --- */}
                        {activeTab === 'messages' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)] animate-fadeIn">
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
                                                <button className="text-gray-400 hover:text-white"><MoreIcon className="w-5 h-5" /></button>
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
                                            <ChatIcon className="w-16 h-16 opacity-20 mb-4" />
                                            <p>Select a conversation to start messaging</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'overview' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                    {/* Subscription Card */}
                                    <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#FACC15]/50 flex flex-col justify-between h-48 group hover:shadow-[0_0_30px_rgba(250,204,21,0.2)] transition-all duration-300 shadow-lg shadow-black/20 relative overflow-hidden">
                                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#FACC15]/10 rounded-full blur-xl"></div>
                                        <div className="flex items-center gap-2 text-[#FACC15] text-sm font-medium z-10">
                                            <div className="p-1.5 bg-[#FACC15]/20 rounded-lg text-[#FACC15]">
                                                <CreditCardIcon className="w-4 h-4" />
                                            </div>
                                            Subscription
                                        </div>
                                        <div className="z-10">
                                            <div className="text-2xl font-bold text-white mb-1">Premium</div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400">
                                                    {isSubscriptionPaid ? 'Active' : 'Expired'}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('subscription')}
                                            className="w-full py-2 bg-[#FACC15] text-black text-sm font-bold rounded-xl hover:bg-[#EAB308] transition-colors z-10"
                                        >
                                            Manage Plan
                                        </button>
                                    </div>

                                    {/* Total Trips Card (Clickable) */}
                                    <div
                                        onClick={() => setActiveTab('trips')}
                                        className="cursor-pointer bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A] flex flex-col justify-between h-48 group hover:border-[#FACC15]/50 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-[0_0_30px_rgba(250,204,21,0.1)]"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                                                <div className="p-1.5 bg-[#2A2A2A] rounded-lg text-[#FACC15]">
                                                    <CarIcon className="w-4 h-4" />
                                                </div>
                                                Total trips
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-4xl font-bold text-white mb-2">99 <span className="text-sm font-medium text-gray-500">t</span></div>
                                            <div className="flex items-center gap-2">
                                                <span className="bg-[#FACC15]/10 text-[#FACC15] text-xs font-bold px-2 py-0.5 rounded">+3.4%</span>
                                                <span className="text-xs text-gray-500">in this period</span>
                                            </div>
                                        </div>
                                        <div className="flex items-end gap-1 h-8 mt-2 opacity-80">
                                            {[40, 60, 45, 80, 55, 70].map((h, i) => (
                                                <div key={i} className="w-full bg-[#FACC15] rounded-t-sm opacity-90" style={{ height: `${h}%` }}></div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Distance Driven Card (Clickable) */}
                                    <div
                                        onClick={() => setActiveTab('distance')}
                                        className="cursor-pointer bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A] flex flex-col justify-between h-48 group hover:border-[#FACC15]/50 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-[0_0_30px_rgba(250,204,21,0.1)]"
                                    >
                                        <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                                            <div className="p-1.5 bg-[#2A2A2A] rounded-lg text-[#FACC15]">
                                                <MapIcon className="w-4 h-4" />
                                            </div>
                                            Distance driven
                                        </div>
                                        <div className="text-4xl font-bold text-white mt-auto mb-4">1407 <span className="text-sm font-medium text-gray-500">km</span></div>
                                        <div className="flex items-end gap-1.5 h-10 mt-2">
                                            {[20, 40, 60, 80, 50, 30, 70].map((h, i) => (
                                                <div key={i} className={`flex-1 rounded-t-md ${i > 3 ? 'bg-[#FACC15]' : 'bg-[#333]'}`} style={{ height: `${h}%` }}></div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Driving Hours Card (Clickable) */}
                                    <div
                                        onClick={() => setActiveTab('hours')}
                                        className="cursor-pointer bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A] flex flex-col justify-between h-48 group hover:border-[#FACC15]/50 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-[0_0_30px_rgba(250,204,21,0.1)]"
                                    >
                                        <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                                            <div className="p-1.5 bg-[#2A2A2A] rounded-lg text-[#FACC15]">
                                                <SteeringWheelIcon className="w-4 h-4" />
                                            </div>
                                            Driving hours
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="w-2 h-2 rounded-full bg-[#FACC15]"></span>
                                                    <span className="text-xs text-gray-400">Day time</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-[#333]"></span>
                                                    <span className="text-xs text-gray-400">Night time</span>
                                                </div>
                                                <div className="text-3xl font-bold text-white mt-3">14<span className="text-xl text-gray-500">h</span> 56<span className="text-xl text-gray-500">m</span></div>
                                            </div>
                                            <div className="relative w-16 h-16">
                                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                                    <path className="text-[#2A2A2A]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                                    <path className="text-[#FACC15]" strokeDasharray="70, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* On-time Rate Card (Clickable) */}
                                    <div
                                        onClick={() => setActiveTab('ontime')}
                                        className="cursor-pointer bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A] flex flex-col justify-between h-48 group hover:border-[#FACC15]/50 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-[0_0_30px_rgba(250,204,21,0.1)]"
                                    >
                                        <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                                            <div className="p-1.5 bg-[#2A2A2A] rounded-lg text-[#FACC15]">
                                                <DashboardIcon className="w-4 h-4" />
                                            </div>
                                            On-time rate
                                        </div>
                                        <div className="flex items-end justify-between mt-auto">
                                            <div className="text-4xl font-bold text-white">47 <span className="text-sm font-medium text-gray-500">%</span></div>
                                            <div className="w-24 h-12">
                                                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50">
                                                    <defs>
                                                        <linearGradient id="gradientGold" x1="0" x2="0" y1="0" y2="1">
                                                            <stop offset="0%" stopColor="#FACC15" stopOpacity="0.5" />
                                                            <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
                                                        </linearGradient>
                                                    </defs>
                                                    <path d="M0 50 C 20 40, 40 45, 60 20 S 80 30, 100 5" fill="url(#gradientGold)" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />
                                                    <circle cx="100" cy="5" r="3" fill="#FACC15" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Standard Overview Widgets */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[400px] lg:h-[450px]">

                                    <div className="lg:col-span-3 bg-[#1E1E1E] rounded-3xl p-4 border border-[#2A2A2A] shadow-lg shadow-black/20 flex flex-col h-full overflow-hidden hover:shadow-[0_0_30px_rgba(250,204,21,0.1)] hover:border-[#FACC15]/30 transition-all duration-300">
                                        <div className="flex items-center justify-between mb-2 shrink-0">
                                            <h3 className="text-base font-bold text-white">Schedule</h3>
                                            <button className="p-1 bg-[#2A2A2A] rounded-lg text-gray-400 hover:text-white"><MoreIcon className="w-3 h-3" /></button>
                                        </div>

                                        <div className="grid grid-cols-7 gap-1 text-center mb-2 shrink-0 border-b border-[#2A2A2A] pb-2">
                                            {weekDays.map(d => <span key={d} className="text-[10px] text-gray-500 font-medium">{d}</span>)}
                                        </div>

                                        <div className="overflow-y-auto pr-1 no-scrollbar flex-1">
                                            <div className="text-xs font-bold text-[#FACC15] mb-2 mt-1 sticky top-0 bg-[#1E1E1E] py-1 z-10">October</div>
                                            <div className="grid grid-cols-7 gap-1 text-center mb-4">
                                                {Array.from({ length: 2 }).map((_, i) => <div key={`empty-${i}`}></div>)}
                                                {octDays.map((d) => (
                                                    <div key={`oct-${d}`} className={`h-7 w-7 flex items-center justify-center rounded-lg text-xs font-medium ${d === 24 ? 'bg-[#FACC15] text-black shadow-lg' : [5, 12, 19, 26].includes(d) ? 'bg-[#252525] text-gray-300' : 'text-gray-500 hover:bg-[#252525] cursor-pointer'}`}>
                                                        {d}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="text-xs font-bold text-[#FACC15] mb-2 mt-1 sticky top-0 bg-[#1E1E1E] py-1 z-10">November</div>
                                            <div className="grid grid-cols-7 gap-1 text-center">
                                                {Array.from({ length: 5 }).map((_, i) => <div key={`empty-nov-${i}`}></div>)}
                                                {novDays.map((d) => (
                                                    <div key={`nov-${d}`} className={`h-7 w-7 flex items-center justify-center rounded-lg text-xs font-medium ${d === 15 ? 'bg-[#2A2A2A] text-[#FACC15] border border-[#FACC15]/30' : 'text-gray-500 hover:bg-[#252525] cursor-pointer'}`}>
                                                        {d}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-3 bg-[#1E1E1E] rounded-3xl p-5 border border-[#2A2A2A] shadow-lg shadow-black/20 flex flex-col h-full overflow-hidden hover:shadow-[0_0_30px_rgba(250,204,21,0.1)] hover:border-[#FACC15]/30 transition-all duration-300">
                                        <div className="flex items-center justify-between mb-3 shrink-0">
                                            <h3 className="text-base font-bold text-white">My Vehicles</h3>
                                            <div className="flex gap-2">
                                                <button onClick={() => setIsAddVehicleOpen(true)} className="bg-[#FACC15] text-black p-1 rounded hover:bg-[#EAB308]"><PlusIcon className="w-3 h-3" /></button>
                                                <div className="bg-[#FACC15]/10 text-[#FACC15] text-xs font-bold px-2 py-0.5 rounded-full">{myVehicles.length}</div>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto pr-1 space-y-3 no-scrollbar">
                                            {myVehicles.map(v => (
                                                <div key={v.id} className="bg-[#252525] p-3 rounded-xl border border-[#333] hover:border-[#FACC15]/30 transition-colors group cursor-pointer">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="h-8 w-8 bg-[#1E1E1E] rounded-lg flex items-center justify-center border border-[#333] opacity-70 group-hover:opacity-100 transition-all text-[#FACC15]">
                                                            <TruckIcon className="w-4 h-4" />
                                                        </div>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${v.status === 'On-Route' ? 'bg-green-500/20 text-green-400' : v.status === 'Maintenance' || v.status === 'Service' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'}`}>
                                                            {v.status}
                                                        </span>
                                                    </div>
                                                    <div className="font-bold text-white text-sm">{v.name}</div>
                                                    <div className="text-xs text-gray-500 flex justify-between items-center mt-1">
                                                        <span>{v.plate}</span>
                                                        {v.status === 'On-Route' && <span className="w-1.5 h-1.5 bg-[#FACC15] rounded-full animate-pulse"></span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-6 h-full">
                                        <MapWidget />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* --- New: Inventory Page --- */}
                        {activeTab === 'inventory' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setActiveTab('overview')}
                                            className="p-2 rounded-xl bg-[#252525] hover:bg-[#333] text-gray-400 hover:text-white transition-colors"
                                        >
                                            <ArrowLeftIcon className="w-5 h-5" />
                                        </button>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">Fleet Inventory</h2>
                                            <p className="text-sm text-gray-400">Manage your vehicle listings and availability.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsAddVehicleOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#FACC15] text-black rounded-xl font-bold hover:bg-[#EAB308] transition-colors"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                        Add Vehicle
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {myVehicles.map(vehicle => (
                                        <div key={vehicle.id} className="bg-[#1E1E1E] rounded-3xl p-5 border border-[#2A2A2A] group hover:border-[#FACC15]/50 transition-all duration-300 relative">
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDeleteVehicle(vehicle.id)}
                                                    className="p-2 bg-[#252525] hover:bg-red-900/30 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 bg-[#252525] rounded-xl flex items-center justify-center text-[#FACC15] border border-[#333]">
                                                    <TruckIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white text-lg leading-tight">{vehicle.name}</h3>
                                                    <span className="text-xs text-gray-500 font-mono">{vehicle.plate}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between items-center p-2 bg-[#252525] rounded-lg border border-[#333]">
                                                    <span className="text-gray-400">Category</span>
                                                    <span className="text-white font-medium truncate max-w-[100px]" title={vehicle.category}>{vehicle.category}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-[#252525] rounded-lg border border-[#333]">
                                                    <span className="text-gray-400">Rate</span>
                                                    <span className="text-[#FACC15] font-bold">{vehicle.rate}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-[#252525] rounded-lg border border-[#333]">
                                                    <span className="text-gray-400">Status</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${vehicle.status === 'Available' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                                        {vehicle.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add New Card (Visual Placeholder) */}
                                    <div
                                        onClick={() => setIsAddVehicleOpen(true)}
                                        className="bg-[#1E1E1E] rounded-3xl p-5 border border-[#2A2A2A] border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-[#252525] hover:border-[#FACC15]/30 transition-all min-h-[200px]"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-[#252525] flex items-center justify-center text-gray-500 group-hover:text-[#FACC15] transition-colors">
                                            <PlusIcon className="w-8 h-8" />
                                        </div>
                                        <span className="font-bold text-gray-400">Add New Vehicle</span>
                                    </div>
                                </div>

                                {/* Add Vehicle Modal */}
                                {isAddVehicleOpen && (
                                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setIsAddVehicleOpen(false)}>
                                        <div className="bg-[#1E1E1E] rounded-3xl p-8 max-w-md w-full border border-[#333] shadow-2xl" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-xl font-bold text-white">Add Vehicle to Fleet</h3>
                                                <button onClick={() => setIsAddVehicleOpen(false)} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                                            </div>

                                            <form onSubmit={handleAddVehicle} className="space-y-4">
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 block">Vehicle Name</label>
                                                    <input type="text" required value={newVehicle.name} onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]" placeholder="e.g. 5-Ton Truck" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 block">License Plate</label>
                                                    <input type="text" required value={newVehicle.plate} onChange={e => setNewVehicle({ ...newVehicle, plate: e.target.value })} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]" placeholder="e.g. MC 1234" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 block">Category</label>
                                                    <select value={newVehicle.category} onChange={e => setNewVehicle({ ...newVehicle, category: e.target.value })} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]">
                                                        {hireCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs text-gray-500 mb-1 block">Default Rate</label>
                                                        <input type="text" value={newVehicle.rate} onChange={e => setNewVehicle({ ...newVehicle, rate: e.target.value })} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]" placeholder="e.g. 200/day" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500 mb-1 block">Status</label>
                                                        <select value={newVehicle.status} onChange={e => setNewVehicle({ ...newVehicle, status: e.target.value })} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]">
                                                            <option value="Available">Available</option>
                                                            <option value="Maintenance">Maintenance</option>
                                                            <option value="Service">Service</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <button type="submit" className="w-full bg-[#FACC15] text-black font-bold py-3 rounded-xl mt-4 hover:bg-[#EAB308] transition-colors">
                                                    Add Vehicle
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- Documents/Verification Page --- */}
                        {activeTab === 'documents' && (
                            <div className="animate-fadeIn space-y-6 max-w-5xl mx-auto">
                                <div className="flex items-center gap-4 mb-6">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className="p-2 rounded-xl bg-[#252525] hover:bg-[#333] text-gray-400 hover:text-white transition-colors"
                                    >
                                        <ArrowLeftIcon className="w-5 h-5" />
                                    </button>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Documents & Verification</h2>
                                        <p className="text-sm text-gray-400">Upload your driver's license and payment details for verification.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleDocumentsSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left Column: Payment Details */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Payment Configuration Card */}
                                        <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A] relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <CreditCardIcon className="w-5 h-5 text-green-500" />
                                                Payment Details
                                            </h3>

                                            <div className="mb-6">
                                                <label className="text-xs text-gray-500 mb-2 block uppercase font-bold">Preferred Payment Method</label>
                                                <div className="flex bg-[#252525] p-1 rounded-xl border border-[#333]">
                                                    {['Bank', 'Airtel Money', 'Mpamba'].map((method) => (
                                                        <button
                                                            key={method}
                                                            type="button"
                                                            onClick={() => setPayoutMethod(method as any)}
                                                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${payoutMethod === method ? 'bg-[#FACC15] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-[#333]'}`}
                                                        >
                                                            {method}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {payoutMethod === 'Bank' ? (
                                                <div className="space-y-4 animate-fadeIn">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-xs text-gray-500 mb-1 block">Bank Name</label>
                                                            <select
                                                                value={payoutDetails.bankName || ''}
                                                                onChange={(e) => setPayoutDetails({ ...payoutDetails, bankName: e.target.value })}
                                                                className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]"
                                                                required
                                                            >
                                                                <option value="">Select Bank</option>
                                                                <option value="National Bank">National Bank of Malawi</option>
                                                                <option value="Standard Bank">Standard Bank</option>
                                                                <option value="FDH Bank">FDH Bank</option>
                                                                <option value="NBS Bank">NBS Bank</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-500 mb-1 block">Account Number</label>
                                                            <input
                                                                type="text"
                                                                value={payoutDetails.accountNumber || ''}
                                                                onChange={(e) => setPayoutDetails({ ...payoutDetails, accountNumber: e.target.value })}
                                                                className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]"
                                                                placeholder="0000000000"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500 mb-1 block">Account Holder Name</label>
                                                        <input
                                                            type="text"
                                                            value={payoutDetails.accountName || ''}
                                                            onChange={(e) => setPayoutDetails({ ...payoutDetails, accountName: e.target.value })}
                                                            className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]"
                                                            placeholder="Full Name"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="animate-fadeIn">
                                                    <label className="text-xs text-gray-500 mb-1 block">Mobile Number ({payoutMethod})</label>
                                                    <div className="relative">
                                                        <PhoneIcon className="w-5 h-5 text-gray-500 absolute left-4 top-3" />
                                                        <input
                                                            type="text"
                                                            value={payoutDetails.mobileNumber || ''}
                                                            onChange={(e) => setPayoutDetails({ ...payoutDetails, mobileNumber: e.target.value })}
                                                            className="w-full bg-[#252525] border border-[#333] rounded-xl pl-12 pr-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]"
                                                            placeholder="+265..."
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column: License Upload */}
                                    <div className="space-y-6">
                                        <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A] flex flex-col h-full">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <DocumentIcon className="w-5 h-5 text-[#FACC15]" />
                                                Driver's License
                                            </h3>

                                            <div className="mb-6">
                                                <label className="text-xs text-gray-500 mb-2 block">Upload License (Front)</label>

                                                {licensePreview ? (
                                                    <div className="relative group rounded-xl overflow-hidden border border-[#333]">
                                                        <img src={licensePreview} alt="License Preview" className="w-full h-40 object-cover" />
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                type="button"
                                                                onClick={() => { setLicensePreview(null); setLicenseFile(null); }}
                                                                className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#333] rounded-xl cursor-pointer hover:border-[#FACC15] hover:bg-[#252525] transition-all">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                                            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-[#FACC15]">Click to upload</span> or drag and drop</p>
                                                            <p className="text-xs text-gray-500">PNG, JPG, PDF (MAX. 5MB)</p>
                                                        </div>
                                                        <input type="file" className="hidden" onChange={handleLicenseUpload} accept="image/*,application/pdf" required />
                                                    </label>
                                                )}
                                            </div>

                                            <div className="mt-auto bg-[#252525] p-4 rounded-xl border border-[#333]">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-gray-400 text-xs">Verification Status</span>
                                                    <span className="text-yellow-400 text-xs font-bold bg-yellow-900/30 px-2 py-0.5 rounded">Pending</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500">
                                                    Upload your license to unlock verified status and access premium jobs.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-3">
                                        <button
                                            type="submit"
                                            disabled={documentsSaving}
                                            className="w-full bg-[#FACC15] text-black font-bold py-4 rounded-xl hover:bg-[#EAB308] transition-all shadow-lg shadow-[#FACC15]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {documentsSaving ? <SpinnerIcon className="w-5 h-5" /> : <CheckBadgeIcon className="w-5 h-5" />}
                                            {documentsSaving ? 'Saving Documents...' : 'Save & Submit for Verification'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* --- New: Total Trips Page --- */}
                        {activeTab === 'trips' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex items-center gap-4 mb-4">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className="p-2 rounded-xl bg-[#252525] hover:bg-[#333] text-gray-400 hover:text-white transition-colors"
                                    >
                                        <ArrowLeftIcon className="w-5 h-5" />
                                    </button>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Total Trips Analytics</h2>
                                        <p className="text-sm text-gray-400">Detailed breakdown of your trip history and types.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A]">
                                        <h3 className="text-lg font-bold text-white mb-4">Trip Volume Trend</h3>
                                        <div className="h-80 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={tripHistoryData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.5} />
                                                    <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                                        cursor={{ fill: '#252525' }}
                                                    />
                                                    <Legend verticalAlign="top" align="right" iconType="circle" />
                                                    <Bar dataKey="share" name="Ride Share" fill="#FACC15" radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="hire" name="For Hire" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A]">
                                            <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400 text-sm">Total Trips</span>
                                                    <span className="text-white font-bold text-xl">99</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400 text-sm">Completed</span>
                                                    <span className="text-green-400 font-bold">92</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400 text-sm">Cancelled</span>
                                                    <span className="text-red-400 font-bold">7</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A]">
                                            <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between text-gray-300">
                                                    <span>Share: Blantyre -&gt; Lilongwe</span>
                                                    <span className="text-[#FACC15]">+MWK 25,000</span>
                                                </div>
                                                <div className="flex justify-between text-gray-300">
                                                    <span>Hire: Ind. Transport</span>
                                                    <span className="text-blue-400">+MWK 450,000</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- New: Distance Driven Page --- */}
                        {activeTab === 'distance' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex items-center gap-4 mb-4">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className="p-2 rounded-xl bg-[#252525] hover:bg-[#333] text-gray-400 hover:text-white transition-colors"
                                    >
                                        <ArrowLeftIcon className="w-5 h-5" />
                                    </button>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Distance Analytics</h2>
                                        <p className="text-sm text-gray-400">Mileage tracking and vehicle efficiency.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A]">
                                        <h3 className="text-lg font-bold text-white mb-4">Weekly Mileage (km)</h3>
                                        <div className="h-80 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={distanceData}>
                                                    <defs>
                                                        <linearGradient id="colorKm" x1="0" y1="0" x2="0" y2="1">
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
                                                    />
                                                    <Area type="monotone" dataKey="km" stroke="#FACC15" fillOpacity={1} fill="url(#colorKm)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A]">
                                            <h3 className="text-lg font-bold text-white mb-4">Odometer</h3>
                                            <div className="text-4xl font-mono text-[#FACC15] mb-2">124,592 <span className="text-sm text-gray-500">km</span></div>
                                            <p className="text-xs text-gray-500">Total vehicle mileage recorded.</p>
                                        </div>
                                        <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A]">
                                            <h3 className="text-lg font-bold text-white mb-4">Efficiency</h3>
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-gray-400 text-sm">Avg Speed</span>
                                                <span className="text-white font-bold">65 km/h</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400 text-sm">Fuel/Energy</span>
                                                <span className="text-green-400 font-bold">Good</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- New: Driving Hours Page --- */}
                        {activeTab === 'hours' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex items-center gap-4 mb-4">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className="p-2 rounded-xl bg-[#252525] hover:bg-[#333] text-gray-400 hover:text-white transition-colors"
                                    >
                                        <ArrowLeftIcon className="w-5 h-5" />
                                    </button>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Time Management</h2>
                                        <p className="text-sm text-gray-400">Analyze your driving, online, and resting hours.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A]">
                                        <h3 className="text-lg font-bold text-white mb-4">Driving Hours Distribution</h3>
                                        <div className="h-80 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={drivingHoursData} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#333" opacity={0.5} />
                                                    <XAxis type="number" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis dataKey="name" type="category" stroke="#666" fontSize={12} tickLine={false} axisLine={false} width={40} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                                        cursor={{ fill: '#252525' }}
                                                    />
                                                    <Legend verticalAlign="top" align="right" iconType="circle" />
                                                    <Bar dataKey="day" name="Day Time" stackId="a" fill="#FACC15" radius={[0, 4, 4, 0]} />
                                                    <Bar dataKey="night" name="Night Time" stackId="a" fill="#555" radius={[0, 4, 4, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A] flex flex-col">
                                        <h3 className="text-lg font-bold text-white mb-4">Activity Breakdown</h3>
                                        <div className="space-y-4">
                                            <div className="bg-[#252525] p-4 rounded-xl">
                                                <div className="text-gray-400 text-xs mb-1">Total Online</div>
                                                <div className="text-2xl font-bold text-white">45h 20m</div>
                                            </div>
                                            <div className="bg-[#252525] p-4 rounded-xl border border-[#FACC15]/20">
                                                <div className="text-gray-400 text-xs mb-1">Active Driving</div>
                                                <div className="text-2xl font-bold text-[#FACC15]">32h 15m</div>
                                            </div>
                                            <div className="bg-[#252525] p-4 rounded-xl">
                                                <div className="text-gray-400 text-xs mb-1">Idle/Waiting</div>
                                                <div className="text-2xl font-bold text-gray-400">13h 05m</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- New: On-Time Rate Page --- */}
                        {activeTab === 'ontime' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex items-center gap-4 mb-4">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className="p-2 rounded-xl bg-[#252525] hover:bg-[#333] text-gray-400 hover:text-white transition-colors"
                                    >
                                        <ArrowLeftIcon className="w-5 h-5" />
                                    </button>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Performance & Punctuality</h2>
                                        <p className="text-sm text-gray-400">Track your arrival times and customer satisfaction.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A] flex flex-col items-center justify-center">
                                        <h3 className="text-lg font-bold text-white mb-2 self-start">On-Time Rate</h3>
                                        <div className="h-64 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={onTimeData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {onTimeData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#333', borderRadius: '8px', color: '#fff' }} />
                                                    <Legend verticalAlign="bottom" height={36} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="text-center mt-[-140px] mb-[80px] pointer-events-none">
                                            <div className="text-3xl font-bold text-white">85%</div>
                                            <div className="text-xs text-gray-500">Punctual</div>
                                        </div>
                                    </div>

                                    <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A]">
                                        <h3 className="text-lg font-bold text-white mb-4">Recent Feedback</h3>
                                        <div className="space-y-4 max-h-80 overflow-y-auto no-scrollbar">
                                            {[
                                                { user: 'Alice', rating: 5, comment: 'Arrived exactly on time!', time: '2h ago' },
                                                { user: 'Bob', rating: 4, comment: 'Slightly late but communicated well.', time: '5h ago' },
                                                { user: 'Charlie', rating: 5, comment: 'Perfect timing for the airport run.', time: '1d ago' },
                                                { user: 'David', rating: 3, comment: '10 mins late pickup.', time: '2d ago' },
                                            ].map((fb, i) => (
                                                <div key={i} className="bg-[#252525] p-4 rounded-xl border border-[#333]">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-bold text-white text-sm">{fb.user}</span>
                                                        <span className="text-[10px] text-gray-500">{fb.time}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[#FACC15] text-xs mb-1">
                                                        {Array.from({ length: fb.rating }).map((_, j) => <span key={j}>★</span>)}
                                                    </div>
                                                    <p className="text-xs text-gray-400">{fb.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'subscription' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn h-[calc(100vh-140px)]">
                                {/* Left Column: Calendar & Status */}
                                <div className="lg:col-span-7 flex flex-col gap-6 h-full overflow-y-auto pr-2 no-scrollbar">
                                    <div className="bg-[#1E1E1E] rounded-3xl p-8 border border-[#FACC15]/30 relative overflow-hidden">
                                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#FACC15]/10 rounded-full blur-2xl"></div>

                                        <div className="flex items-center gap-4 mb-6 relative z-10">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${isSubscriptionPaid ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-red-500/20 border-red-500 text-red-500'}`}>
                                                {isSubscriptionPaid ? <CheckBadgeIcon className="w-6 h-6" /> : <CreditCardIcon className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">Professional Plan</h2>
                                                <p className={`font-medium ${isSubscriptionPaid ? 'text-green-400' : 'text-red-400'}`}>
                                                    {isSubscriptionPaid ? 'Active Subscription' : 'Payment Pending'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 mb-4 relative z-10">
                                            <div className="bg-[#252525] p-4 rounded-2xl flex-1 border border-[#333]">
                                                <p className="text-xs text-gray-400 uppercase font-bold">Cycle Start</p>
                                                <p className="text-lg font-bold text-white">{subStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                            </div>
                                            <div className="bg-[#252525] p-4 rounded-2xl flex-1 border border-[#333]">
                                                <p className="text-xs text-gray-400 uppercase font-bold">Cycle End</p>
                                                <p className="text-lg font-bold text-white">{subEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visual Calendar */}
                                    <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A] flex-1 flex flex-col">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold text-white">Coverage Calendar</h3>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-[#FACC15]"></span> Paid</div>
                                                <div className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-[#333]"></span> Unpaid</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-7 gap-2 text-center mb-2 border-b border-[#333] pb-4">
                                            {weekDays.map((d, i) => <span key={i} className="text-gray-500 font-bold text-sm">{d}</span>)}
                                        </div>

                                        <div className="grid grid-cols-7 gap-2 flex-1 content-start">
                                            {/* Mocking current month days */}
                                            {Array.from({ length: 3 }).map((_, i) => <div key={`pre-${i}`}></div>)}
                                            {Array.from({ length: 30 }).map((_, i) => {
                                                const day = i + 1;
                                                const isPaidDay = isSubscriptionPaid && (day >= 15 || day <= 15);

                                                return (
                                                    <div
                                                        key={day}
                                                        className={`
                                                            aspect-square rounded-xl flex items-center justify-center text-sm font-bold border transition-all
                                                            ${isPaidDay
                                                                ? 'bg-[#FACC15]/20 border-[#FACC15] text-[#FACC15] shadow-[0_0_10px_rgba(250,204,21,0.2)]'
                                                                : 'bg-[#252525] border-[#333] text-gray-500'}
                                                        `}
                                                    >
                                                        {day}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {isSubscriptionPaid && (
                                            <p className="text-center text-xs text-gray-400 mt-4">
                                                Your subscription is active from {subStartDate.toLocaleDateString()} to {subEndDate.toLocaleDateString()}.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: Upgrade & Actions */}
                                <div className="lg:col-span-5 flex flex-col gap-6 h-full overflow-y-auto pr-2 no-scrollbar">

                                    {!paymentMethod ? (
                                        // Plan Selection View
                                        <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A] h-full">
                                            <h3 className="text-xl font-bold text-white mb-4">Extend or Upgrade</h3>
                                            <p className="text-gray-400 text-sm mb-6">Select a package to extend your coverage.</p>

                                            <div className="space-y-4">
                                                {(Object.entries(subscriptionPlans) as [keyof typeof subscriptionPlans, any][]).map(([key, plan]) => (
                                                    <div
                                                        key={key}
                                                        onClick={() => setSelectedDuration(key)}
                                                        className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 relative group ${selectedDuration === key ? 'bg-[#FACC15]/10 border-[#FACC15]' : 'bg-[#252525] border-transparent hover:border-[#444]'}`}
                                                    >
                                                        {plan.discount > 0 && (
                                                            <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold px-2 py-1 rounded-full">
                                                                -{plan.discount}%
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedDuration === key ? 'border-[#FACC15]' : 'border-gray-600'}`}>
                                                                {selectedDuration === key && <div className="w-2.5 h-2.5 rounded-full bg-[#FACC15]"></div>}
                                                            </div>
                                                            <div>
                                                                <h4 className={`font-bold ${selectedDuration === key ? 'text-[#FACC15]' : 'text-white'}`}>{plan.label}</h4>
                                                                <div className="text-xs text-gray-500">{plan.billing}</div>
                                                            </div>
                                                            <div className="ml-auto text-xl font-bold text-white">MWK {plan.price.toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => setPaymentMethod('mobile')}
                                                className="w-full mt-8 bg-[#FACC15] text-black font-bold py-4 rounded-xl hover:bg-[#EAB308] transition-transform transform active:scale-95 shadow-lg shadow-[#FACC15]/20"
                                            >
                                                Proceed to Payment
                                            </button>
                                        </div>
                                    ) : (
                                        // Payment Method View (Inline)
                                        <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A] flex flex-col h-full">
                                            <button
                                                onClick={() => setPaymentMethod(null)}
                                                className="text-xs text-gray-500 hover:text-white mb-6 flex items-center gap-1 self-start"
                                            >
                                                ← Back to plans
                                            </button>

                                            <h3 className="text-xl font-bold text-white mb-6">Checkout</h3>

                                            <div className="bg-[#252525] rounded-2xl p-4 mb-6 border border-[#333]">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-gray-400 text-sm">Selected Plan</span>
                                                    <span className="text-white font-bold">{subscriptionPlans[selectedDuration].label}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400 text-sm">Total</span>
                                                    <span className="text-[#FACC15] font-bold text-xl">MWK {subscriptionPlans[selectedDuration].price.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 mb-6">
                                                <button
                                                    onClick={() => setPaymentMethod('mobile')}
                                                    className={`flex-1 py-3 px-2 rounded-xl border text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'mobile' ? 'bg-[#FACC15]/20 border-[#FACC15] text-[#FACC15]' : 'bg-[#252525] border-[#333] text-gray-400'}`}
                                                >
                                                    <PhoneIcon className="w-5 h-5" />
                                                    Mobile
                                                </button>
                                                <button
                                                    onClick={() => setPaymentMethod('card')}
                                                    className={`flex-1 py-3 px-2 rounded-xl border text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'card' ? 'bg-[#FACC15]/20 border-[#FACC15] text-[#FACC15]' : 'bg-[#252525] border-[#333] text-gray-400'}`}
                                                >
                                                    <CreditCardIcon className="w-5 h-5" />
                                                    Card
                                                </button>
                                            </div>

                                            {paymentMethod === 'mobile' && (
                                                <div className="space-y-4 animate-fadeIn flex-1">
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Provider</label>
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={() => setMobileProvider('airtel')}
                                                                className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${mobileProvider === 'airtel' ? 'bg-red-600 text-white border-red-500' : 'bg-[#121212] border-[#333] text-gray-500'}`}
                                                            >
                                                                Airtel
                                                            </button>
                                                            <button
                                                                onClick={() => setMobileProvider('mpamba')}
                                                                className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${mobileProvider === 'mpamba' ? 'bg-green-600 text-white border-green-500' : 'bg-[#121212] border-[#333] text-gray-500'}`}
                                                            >
                                                                Mpamba
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Phone Number</label>
                                                        <input type="text" placeholder="+265..." className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#FACC15]" />
                                                    </div>
                                                </div>
                                            )}

                                            {paymentMethod === 'card' && (
                                                <div className="space-y-4 animate-fadeIn flex-1">
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Card Details</label>
                                                        <input type="text" placeholder="Card Number" className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#FACC15] mb-3" />
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <input type="text" placeholder="MM/YY" className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#FACC15]" />
                                                            <input type="text" placeholder="CVC" className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#FACC15]" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                onClick={handlePayment}
                                                className="w-full mt-auto bg-[#FACC15] text-black font-bold py-4 rounded-xl hover:bg-[#EAB308] transition-transform transform active:scale-95 shadow-lg shadow-[#FACC15]/20"
                                            >
                                                Confirm Payment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'tracking' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
                                <div className="lg:col-span-4 h-full">
                                    <CurrentTripWidget />
                                </div>
                                <div className="lg:col-span-8 h-full">
                                    <MapWidget />
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A]">
                                        <h2 className="text-2xl font-bold text-white mb-6">Financial Analytics</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                            <div className="bg-[#252525] p-4 rounded-2xl border border-[#333]">
                                                <div className="text-gray-400 text-xs font-medium mb-1">Total Earnings</div>
                                                <div className="text-2xl font-bold text-white">MWK 425,930</div>
                                                <div className="text-green-400 text-xs mt-1">+MWK 12,400 this week</div>
                                            </div>
                                            <div className="bg-[#252525] p-4 rounded-2xl border border-[#333]">
                                                <div className="text-gray-400 text-xs font-medium mb-1">Total Trips</div>
                                                <div className="text-2xl font-bold text-white">142</div>
                                                <div className="text-gray-500 text-xs mt-1">Avg MWK 2,990/trip</div>
                                            </div>
                                            <div className="bg-[#252525] p-4 rounded-2xl border border-[#333]">
                                                <div className="text-gray-400 text-xs font-medium mb-1">Net Profit</div>
                                                <div className="text-2xl font-bold text-[#FACC15]">MWK 382,010</div>
                                                <div className="text-gray-500 text-xs mt-1">After expenses</div>
                                            </div>
                                        </div>

                                        <div className="mb-8 bg-[#252525] rounded-2xl p-5 border border-[#333]">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-base font-bold text-white">Profit Trends</h3>
                                                <div className="flex bg-[#1E1E1E] rounded-lg p-1 border border-[#333]">
                                                    {(['Weekly', 'Monthly', 'Yearly'] as const).map((range) => (
                                                        <button
                                                            key={range}
                                                            onClick={() => setProfitRange(range)}
                                                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${profitRange === range ? 'bg-[#FACC15] text-black' : 'text-gray-500 hover:text-white'}`}
                                                        >
                                                            {range}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="h-64 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={profitChartData[profitRange]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.5} />
                                                        <XAxis
                                                            dataKey="name"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fill: '#6b7280', fontSize: 12 }}
                                                            dy={10}
                                                        />
                                                        <YAxis
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fill: '#6b7280', fontSize: 12 }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#333', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                                            itemStyle={{ color: '#FACC15' }}
                                                            cursor={{ stroke: '#333', strokeWidth: 1 }}
                                                            formatter={(value) => `MWK ${value.toLocaleString()}`}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="value"
                                                            stroke="#FACC15"
                                                            strokeWidth={2}
                                                            fillOpacity={1}
                                                            fill="url(#colorProfit)"
                                                            name="Profit"
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="mb-6 bg-[#252525] rounded-2xl p-5 border border-[#333] border-l-4 border-l-[#FACC15]">
                                            <h3 className="text-sm font-bold text-white mb-3">Physical Payment Settlement</h3>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <input
                                                    type="number"
                                                    placeholder="Amount (MWK)"
                                                    value={settleAmount}
                                                    onChange={(e) => setSettleAmount(e.target.value)}
                                                    className="bg-[#1E1E1E] border border-[#333] text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-[#FACC15] w-full sm:w-32"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Description (e.g. Cash from Rider #442)"
                                                    value={settleDesc}
                                                    onChange={(e) => setSettleDesc(e.target.value)}
                                                    className="bg-[#1E1E1E] border border-[#333] text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-[#FACC15] flex-1"
                                                />
                                                <button
                                                    onClick={handleAddSettlement}
                                                    className="bg-[#FACC15] text-black text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#EAB308] transition-colors whitespace-nowrap"
                                                >
                                                    Mark as Settled
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-2">
                                                Use this form to record physical cash payments or direct settlements that occur outside the automated system. These will be added to your profit tracking.
                                            </p>
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-4">Transaction History</h3>
                                        <div className="space-y-3 h-[300px] overflow-y-auto pr-2 no-scrollbar">
                                            {filteredTransactions.length === 0 ? (
                                                <div className="text-gray-500 text-center p-4 border border-dashed border-[#333] rounded-xl">
                                                    No transactions found matching "{searchQuery}"
                                                </div>
                                            ) : (
                                                filteredTransactions.map((tx) => (
                                                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#252525] border border-[#333] hover:border-[#FACC15]/30 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${tx.type === 'Settlement' ? 'bg-[#FACC15]/10 border border-[#FACC15]/30 text-[#FACC15]' : 'bg-[#333] text-gray-400'}`}>
                                                                {tx.type === 'Settlement' ? <HandshakeIcon className="w-5 h-5" /> : <PackageIcon className="w-5 h-5" />}
                                                            </div>
                                                            <div>
                                                                <div className="text-white font-bold text-sm">{tx.desc}</div>
                                                                <div className="text-xs text-gray-500">{tx.date} • {tx.sub}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[#FACC15] font-bold">+MWK {tx.amount.toLocaleString()}</div>
                                                            <div className="text-xs text-gray-500">{tx.method}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'jobs' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">

                                {/* Left Column: Post a Job / Ride */}
                                <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A]">

                                    {/* Incoming Requests Section */}
                                    {incomingRequests.length > 0 && (
                                        <div className="mb-8">
                                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                                Incoming Requests
                                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">{incomingRequests.length}</span>
                                            </h2>
                                            <div className="space-y-4">
                                                {incomingRequests.map(req => (
                                                    <div key={req.id} className="bg-[#252525] p-4 rounded-2xl border border-[#333] flex flex-col gap-3 hover:border-[#FACC15]/30 transition-all">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-black font-bold ${req.type === 'share' ? 'bg-[#FACC15]' : 'bg-purple-500'}`}>
                                                                    {req.type === 'share' ? <CarIcon className="w-5 h-5" /> : <BriefcaseIcon className="w-5 h-5" />}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-white text-sm">{req.title}</h4>
                                                                    <div className="text-xs text-gray-400">
                                                                        <span className="text-white font-medium">{req.user}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-lg font-bold text-white">MWK {req.price.toLocaleString()}</div>
                                                                <div className="text-[10px] text-gray-500 uppercase">{req.type === 'share' ? 'Trip Fare' : 'Total Rate'}</div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-[#1E1E1E] p-2 rounded-lg text-xs text-gray-300 flex justify-between">
                                                            <span>{req.type === 'share' ? req.route : req.location}</span>
                                                            <span className="text-gray-500">{req.type === 'share' ? `${req.date} • ${req.seats} seat(s)` : req.duration}</span>
                                                        </div>

                                                        <div className="flex gap-2 mt-1">
                                                            <button onClick={() => handleDeclineRequest(req.id)} className="flex-1 py-2 rounded-xl border border-[#333] text-gray-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all text-xs font-bold">Decline</button>
                                                            <button onClick={() => handleApproveRequest(req.id)} className="flex-1 py-2 rounded-xl bg-green-600 text-white hover:bg-green-500 transition-all text-xs font-bold shadow-lg shadow-green-600/20">Approve Request</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="h-px w-full bg-[#333] my-6"></div>
                                        </div>
                                    )}

                                    <h2 className="text-xl font-bold text-white mb-6">{editingId ? 'Edit Listing' : 'Post Availability'}</h2>

                                    {!editingId && (
                                        <div className="flex bg-[#252525] rounded-xl p-1 mb-6 border border-[#333]">
                                            <button
                                                onClick={() => setJobType('share')}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${jobType === 'share' ? 'bg-[#FACC15] text-black' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                Share a Ride
                                            </button>
                                            <button
                                                onClick={() => setJobType('hire')}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${jobType === 'hire' ? 'bg-[#FACC15] text-black' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                For Hire
                                            </button>
                                        </div>
                                    )}

                                    {jobType === 'share' ? (
                                        <form onSubmit={handlePostRide} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 block">Origin</label>
                                                    <input type="text" required value={newRide.origin} onChange={e => setNewRide({ ...newRide, origin: e.target.value })} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]" placeholder="e.g. Blantyre" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 block">Destination</label>
                                                    <input type="text" required value={newRide.destination} onChange={e => setNewRide({ ...newRide, destination: e.target.value })} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]" placeholder="e.g. Lilongwe" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 block">Date</label>
                                                    <input type="date" required value={newRide.date} onChange={e => setNewRide({ ...newRide, date: e.target.value })} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 block">Time</label>
                                                    <input type="time" required value={newRide.time} onChange={e => setNewRide({ ...newRide, time: e.target.value })} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 block">Price (MWK)</label>
                                                    <input type="number" required value={newRide.price} onChange={e => setNewRide({ ...newRide, price: e.target.value })} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]" placeholder="25000" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 block">Seats</label>
                                                    <input type="number" required value={newRide.seats} onChange={e => setNewRide({ ...newRide, seats: e.target.value })} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]" placeholder="3" />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {editingId && (
                                                    <button type="button" onClick={cancelEdit} className="flex-1 bg-[#252525] text-white font-bold py-3 rounded-xl mt-4 hover:bg-[#333] transition-colors border border-[#333]">
                                                        Cancel
                                                    </button>
                                                )}
                                                <button type="submit" className="flex-1 bg-[#FACC15] text-black font-bold py-3 rounded-xl mt-4 hover:bg-[#EAB308] transition-colors">
                                                    {editingId ? 'Update Ride' : 'Post Ride'}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <form onSubmit={handlePostHireJob} className="space-y-4">
                                            {!editingId && (
                                                <div className="bg-[#252525] p-3 rounded-xl border border-[#333] mb-4">
                                                    <label className="text-xs text-gray-500 mb-1 block">Select from Inventory (Optional)</label>
                                                    <select onChange={handleSelectInventory} className="w-full bg-[#1E1E1E] border border-[#333] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#FACC15]">
                                                        <option value="">-- Select Vehicle --</option>
                                                        {myVehicles.map(v => (
                                                            <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">Ad Title</label>
                                                <input type="text" required value={newHireJob.title} onChange={e => setNewHireJob({ ...newHireJob, title: e.target.value })} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]" placeholder="e.g. 5-Ton Truck Available" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">Category</label>
                                                <select value={newHireJob.category} onChange={e => setNewHireJob({ ...newHireJob, category: e.target.value })} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]">
                                                    {hireCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 block">Base Location</label>
                                                    <input type="text" required value={newHireJob.location} onChange={e => setNewHireJob({ ...newHireJob, location: e.target.value })} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]" placeholder="e.g. Lilongwe" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 block">Rate / Day (MWK)</label>
                                                    <input type="text" required value={newHireJob.rate} onChange={e => setNewHireJob({ ...newHireJob, rate: e.target.value })} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]" placeholder="e.g. 200000" />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {editingId && (
                                                    <button type="button" onClick={cancelEdit} className="flex-1 bg-[#252525] text-white font-bold py-3 rounded-xl mt-4 hover:bg-[#333] transition-colors border border-[#333]">
                                                        Cancel
                                                    </button>
                                                )}
                                                <button type="submit" className="flex-1 bg-[#FACC15] text-black font-bold py-3 rounded-xl mt-4 hover:bg-[#EAB308] transition-colors">
                                                    {editingId ? 'Update Listing' : 'Post for Hire'}
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Your Active Posts List */}
                                    <div className="mt-8">
                                        <h3 className="text-sm font-bold text-white mb-4">Your Active Listings</h3>
                                        <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
                                            {jobType === 'share' ? (
                                                activePosts.map(post => (
                                                    <div key={post.id} className="bg-[#252525] p-3 rounded-xl border border-[#333] flex justify-between items-center group">
                                                        <div>
                                                            <div className="text-sm font-bold text-white">{post.origin} → {post.destination}</div>
                                                            <div className="text-xs text-gray-500">{post.date} @ {post.time} • {post.seats} seats</div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-[#FACC15] font-bold mr-2">MWK {post.price.toLocaleString()}</div>
                                                            <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                                                <button onClick={() => startEditRide(post)} className="p-1.5 bg-[#333] rounded-lg text-gray-400 hover:text-white hover:bg-[#444]" title="Edit Listing">
                                                                    <PencilIcon className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => openBookingModal(post, 'share')} className="p-1.5 bg-[#333] rounded-lg text-green-400 hover:text-green-300 hover:bg-[#444]" title="Mark as Booked">
                                                                    <CheckBadgeIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                myHirePosts.map(post => (
                                                    <div key={post.id} className="bg-[#252525] p-3 rounded-xl border border-[#333] flex justify-between items-center group">
                                                        <div>
                                                            <div className="text-sm font-bold text-white">{post.title}</div>
                                                            <div className="text-xs text-gray-500">{post.category} • {post.location}</div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-right">
                                                                <div className="text-[#FACC15] font-bold">{post.rate}</div>
                                                                <div className="text-[10px] text-gray-500">{post.status}</div>
                                                            </div>
                                                            <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity ml-2">
                                                                <button onClick={() => startEditHire(post)} className="p-1.5 bg-[#333] rounded-lg text-gray-400 hover:text-white hover:bg-[#444]">
                                                                    <PencilIcon className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => openBookingModal(post, 'hire')} className="p-1.5 bg-[#333] rounded-lg text-green-400 hover:text-green-300 hover:bg-[#444]">
                                                                    <CheckBadgeIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Contracted Jobs */}
                                <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-[#2A2A2A] flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-white">Contracted Jobs</h2>
                                        <div className="bg-[#252525] rounded-lg p-1 flex">
                                            <button className="px-3 py-1 text-xs font-bold bg-[#FACC15] text-black rounded-md">Active</button>
                                            <button className="px-3 py-1 text-xs font-bold text-gray-500 hover:text-white transition-colors">History</button>
                                        </div>
                                    </div>

                                    <div className="relative mb-4">
                                        <input
                                            type="text"
                                            placeholder="Search jobs..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-[#252525] border border-[#333] rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-[#FACC15]"
                                        />
                                        <SearchIcon className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
                                        {filteredContractedJobs.map(job => (
                                            <div key={job.id} className="bg-[#252525] p-4 rounded-2xl border border-[#333] hover:border-[#FACC15]/30 transition-colors relative overflow-hidden">
                                                <div className={`absolute top-0 left-0 w-1 h-full ${job.type === 'share' ? 'bg-[#FACC15]' : 'bg-purple-500'}`}></div>
                                                <div className="flex justify-between items-start mb-3 pl-2">
                                                    <div>
                                                        <h3 className="font-bold text-white text-sm">{job.title}</h3>
                                                        <p className="text-xs text-gray-400 mt-0.5">Client: {job.clientName || 'Direct Booking'} <span className="text-gray-600">({job.clientId || 'ID-99'})</span></p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${job.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 animate-pulse' : 'bg-gray-700 text-gray-300'}`}>
                                                        {job.status}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 mb-4 pl-2">
                                                    <div className="flex-1 bg-[#1E1E1E] p-2 rounded-lg">
                                                        <p className="text-[10px] text-gray-500 uppercase">From</p>
                                                        <p className="text-xs text-white font-medium truncate" title={job.origin}>{job.origin}</p>
                                                    </div>
                                                    <div className="text-gray-500">→</div>
                                                    <div className="flex-1 bg-[#1E1E1E] p-2 rounded-lg">
                                                        <p className="text-[10px] text-gray-500 uppercase">To</p>
                                                        <p className="text-xs text-white font-medium truncate" title={job.destination}>{job.destination}</p>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center pl-2 pt-2 border-t border-[#333]">
                                                    <div className="text-lg font-bold text-[#FACC15]">MWK {job.payout.toLocaleString()}</div>

                                                    {/* Driver Action Buttons based on Status */}
                                                    {job.status === 'Scheduled' && (
                                                        <button onClick={() => handleJobAction(job.id, 'Scheduled')} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500">
                                                            Start Pickup
                                                        </button>
                                                    )}
                                                    {job.status === 'Inbound' && (
                                                        <button onClick={() => handleJobAction(job.id, 'Inbound')} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-500">
                                                            Arrived
                                                        </button>
                                                    )}
                                                    {job.status === 'Arrived' && (
                                                        <button className="px-3 py-1.5 bg-gray-700 text-gray-300 text-xs font-bold rounded-lg cursor-not-allowed" disabled>
                                                            Waiting for Rider...
                                                        </button>
                                                    )}
                                                    {job.status === 'Boarded' && (
                                                        <button onClick={() => handleJobAction(job.id, 'Boarded')} className="px-3 py-1.5 bg-[#FACC15] text-black text-xs font-bold rounded-lg hover:bg-[#EAB308] animate-pulse">
                                                            Start Trip
                                                        </button>
                                                    )}
                                                    {job.status === 'In Progress' && (
                                                        <button onClick={() => handleJobAction(job.id, 'In Progress')} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-500">
                                                            Complete Job
                                                        </button>
                                                    )}
                                                    {job.status === 'Payment Due' && (
                                                        <button onClick={() => handleJobAction(job.id, 'Payment Due')} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-500">
                                                            Confirm Payment
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Booking Modal */}
            {isBookingModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={() => setIsBookingModalOpen(false)}>
                    <div className="bg-[#1E1E1E] rounded-3xl p-8 max-w-md w-full border border-[#333] shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Confirm Booking</h3>
                            <button onClick={() => setIsBookingModalOpen(false)} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                        </div>

                        <form onSubmit={handleConfirmBooking} className="space-y-4">
                            <div className="p-4 bg-[#252525] rounded-xl mb-4">
                                <div className="text-sm text-gray-300 font-medium mb-1">{bookingType === 'share' ? 'Ride Share' : 'Vehicle Hire'}</div>
                                <div className="text-white font-bold text-lg">{bookingType === 'share' ? `${bookingItem.origin} → ${bookingItem.destination}` : bookingItem.title}</div>
                                <div className="text-[#FACC15] font-bold mt-1">{bookingType === 'share' ? `MWK ${bookingItem.price}` : bookingItem.rate}</div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Client Name</label>
                                <input type="text" required value={clientInfo.name} onChange={e => setClientInfo({ ...clientInfo, name: e.target.value })} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]" placeholder="e.g. John Phiri" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Client Phone / ID</label>
                                <input type="text" required value={clientInfo.id} onChange={e => setClientInfo({ ...clientInfo, id: e.target.value })} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FACC15]" placeholder="e.g. +265 99..." />
                            </div>

                            <button type="submit" className="w-full bg-[#FACC15] text-black font-bold py-3 rounded-xl mt-4 hover:bg-[#EAB308] transition-colors">
                                Confirm & Add to Schedule
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
