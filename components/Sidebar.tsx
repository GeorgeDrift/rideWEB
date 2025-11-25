
import React from 'react';
import { DashboardIcon, CarIcon, UsersIcon, SteeringWheelIcon, CloseIcon, TagIcon, ChatBubbleIcon, GlobeIcon, LogoutIcon } from './Icons';
import { View } from '../types';

interface SidebarProps {
    activeView: View;
    setActiveView: (view: View) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onLogout: () => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                    ? 'bg-primary-500/10 dark:bg-primary-500/10 bg-primary-50 text-primary-600 dark:text-primary-500 border-l-4 border-primary-500'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
        >
            {icon}
            <span className="ml-4">{label}</span>
        </button>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen, onLogout }) => {
    
    const handleNavigation = (view: View) => {
        setActiveView(view);
        if(window.innerWidth < 1024) {
            setIsOpen(false);
        }
    }

    const navItems = [
        { id: 'dashboard', icon: <DashboardIcon className="h-5 w-5" />, label: 'Dashboard' },
        { id: 'map', icon: <GlobeIcon className="h-5 w-5" />, label: 'Live Map' },
        { id: 'rides', icon: <CarIcon className="h-5 w-5" />, label: 'Rides' },
        { id: 'drivers', icon: <SteeringWheelIcon className="h-5 w-5" />, label: 'Drivers' },
        { id: 'riders', icon: <UsersIcon className="h-5 w-5" />, label: 'Riders' },
        { id: 'pricing', icon: <TagIcon className="h-5 w-5" />, label: 'Pricing & Surge' },
        { id: 'chat', icon: <ChatBubbleIcon className="h-5 w-5" />, label: ' Chat' },
    ];

    const sidebarContent = (
      <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-20 px-4 border-b border-gray-200 dark:border-dark-700">
                <div className="flex items-center">
                    <div className="bg-primary-500 rounded-lg h-8 w-8 flex items-center justify-center">
                      <SteeringWheelIcon className="h-5 w-5 text-white dark:text-dark-900"/>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white ml-3">Ridex</span>
                </div>
                 <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <CloseIcon className="h-6 w-6" />
                </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
                {navItems.map(item => (
                    <NavItem 
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeView === item.id}
                        onClick={() => handleNavigation(item.id as View)}
                    />
                ))}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-dark-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <img className="h-10 w-10 rounded-full object-cover ring-2 ring-primary-500" src="https://picsum.photos/id/1005/100/100" alt="Admin"/>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Admin</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">admin@ridex.com</p>
                        </div>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <LogoutIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
    
    return (
        <>
            <div className={`fixed inset-0 z-30 bg-black/50 dark:bg-black/80 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
            <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-white dark:bg-dark-800 shadow-xl border-r border-gray-200 dark:border-dark-700 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {sidebarContent}
            </aside>
        </>
    );
};
