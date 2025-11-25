
export type View = 'dashboard' | 'rides' | 'drivers' | 'riders' | 'revenue' | 'pricing' | 'disputes' | 'reports' | 'total-rides' | 'ride-share' | 'for-hire' | 'chat' | 'map';

export type RideStatus = 'Completed' | 'In Progress' | 'Cancelled' | 'Scheduled';
export type DriverStatus = 'Approved' | 'Pending' | 'Suspended';
export type RiderStatus = 'Active' | 'Flagged' | 'Suspended';
export type RideType = 'Ride Share' | 'For Hire';
export type UserRole = 'admin' | 'driver' | 'rider';


export interface Ride {
  id: string;
  rider: {
    name: string;
    avatar: string;
  };
  driver: {
    name:string;
    avatar: string;
  };
  type: RideType;
  origin: string;
  destination: string;
  fare: number;
  date: string;
  status: RideStatus;
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  vehicle: string;
  licensePlate: string;
  totalRides: number;
  rating: number;
  status: DriverStatus;
  joinDate: string;
}

export interface Rider {
    id: string;
    name: string;
    avatar: string;
    totalRides: number;
    memberSince: string;
    status: RiderStatus;
}

export interface RevenueData {
  name: string;
  revenue: number;
}

export interface RidesData {
  name: string;
  rides: number;
}