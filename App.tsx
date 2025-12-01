
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { RidesManagement } from './components/RidesManagement';
import { DriverManagement } from './components/DriverManagement';
import { RiderManagement } from './components/RiderManagement';
import { RevenuePage } from './components/RevenuePage';
import { PricingSettings } from './components/PricingSettings';
import { TotalRidesPage } from './components/TotalRidesPage';
import { RideSharePage } from './components/RideSharePage';
import { ForHirePage } from './components/ForHirePage';
import { ChatPage } from './components/ChatPage';
import { MapPage } from './components/MapPage';
import { LoginPage } from './components/LoginPage';
import { DriverDashboard } from './components/DriverDashboard';
import { RiderDashboard } from './components/RiderDashboard';
import { View, UserRole } from './types';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [userRole, setUserRole] = useState<UserRole>('admin');
        const [profile, setProfile] = useState<any | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState<View>('dashboard');

    const getTitle = (view: View) => {
        switch (view) {
            case 'dashboard': return 'Analytics Dashboard';
            case 'rides': return 'Rides Management';
            case 'drivers': return 'Driver Management';
            case 'riders': return 'Rider Management';
            case 'revenue': return 'Revenue Analytics';
            case 'pricing': return 'Pricing & Surge Settings';
            case 'disputes': return 'Dispute Resolution';
            case 'total-rides': return 'Rides Analytics';
            case 'ride-share': return 'Ride Share Analytics';
            case 'for-hire': return 'For Hire Analytics';
            case 'chat': return 'Support Chat';
            case 'map': return 'Live Operations Map';
            default: return 'Dashboard';
        }
    };

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <Dashboard onNavigate={setActiveView} />;
            case 'rides': return <RidesManagement onNavigate={setActiveView} />;
            case 'drivers': return <DriverManagement />;
            case 'riders': return <RiderManagement />;
            case 'revenue': return <RevenuePage onBack={() => setActiveView('dashboard')} />;
            case 'pricing': return <PricingSettings />;
            case 'total-rides': return <TotalRidesPage onBack={() => setActiveView('dashboard')} />;
            case 'ride-share': return <RideSharePage onBack={() => setActiveView('rides')} />;
            case 'for-hire': return <ForHirePage onBack={() => setActiveView('rides')} />;
            case 'chat': return <ChatPage />;
            case 'map': return <MapPage />;
            default: return <Dashboard onNavigate={setActiveView} />;
        }
    };

    useEffect(() => {
        // If a token exists, try to fetch profile and auto-login
        const token = localStorage.getItem('token');
        if (!token) return;

        (async () => {
            try {
                const resp = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!resp.ok) {
                    localStorage.removeItem('token');
                    return;
                }
                    const user = await resp.json();
                    setUserRole(user.role || 'admin');
                    setProfile(user);
                setIsAuthenticated(true);
            } catch (e) {
                console.warn('Auto-login failed', e);
                localStorage.removeItem('token');
            }
        })();
    }, []);

    const handleLogin = async (role: UserRole) => {
        setUserRole(role);
        // try to fetch profile now that a token should be present
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const resp = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
                if (resp.ok) {
                    const user = await resp.json();
                    setProfile(user);
                }
            } catch (err) { console.warn('Failed to fetch profile after login', err); }
        }
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserRole('admin'); // Reset to default
            setProfile(null);
        localStorage.removeItem('token');
    };

    // Theme handled by ThemeProvider/ThemeToggle

    if (!isAuthenticated) {
        return <LoginPage onLogin={handleLogin} />;
    }

    // If authenticated as driver, show the specific driver dashboard
    if (userRole === 'driver') {
        return <DriverDashboard onLogout={handleLogout} />;
    }

    // If authenticated as rider/passenger, show the specific rider dashboard
    if (userRole === 'rider') {
        return <RiderDashboard onLogout={handleLogout} />;
    }

    // Default Admin View
    return (
        <div className="h-screen overflow-hidden flex bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <Sidebar
                activeView={activeView}
                setActiveView={setActiveView}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                onLogout={handleLogout}
                    profile={profile}
            />
            <div className="flex-1 flex flex-col transition-all duration-300 lg:ml-64">
                <Header
                    title={getTitle(activeView)}
                    onMenuClick={() => setSidebarOpen(true)}
                    onNavigate={setActiveView}
                />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto no-scrollbar">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;
