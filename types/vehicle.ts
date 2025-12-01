export interface Vehicle {
    id: string;
    name?: string;
    make: string;          // Toyota, Honda, Ford, etc.
    model: string;         // Prado, Fit, Ranger, etc.
    year: number;
    category: VehicleCategory;
    subCategory?: string;
    color: string;
    licensePlate: string;
    vin?: string;
    status: 'available' | 'on-trip' | 'maintenance' | 'inactive';
    driverId?: string;
    driverName?: string;
    features: string[];
    capacity: {
        passengers: number;
        cargo?: string;
    };
    images: string[];
    pricing?: {
        perKm: number;
        perHour: number;
        perDay: number;
    };
    location?: {
        lat: number;
        lng: number;
        lastUpdated: Date;
    };
    createdAt?: Date;
    updatedAt?: Date;
}

export type VehicleCategory =
    | 'Sedan'
    | 'SUV'
    | 'Truck'
    | 'Van'
    | 'Minibus'
    | 'Bus'
    | 'Motorcycle'
    | 'Tractor'
    | 'Heavy Machinery'
    | 'Hatchback'
    | 'Pickup'
    | 'Farming Equipment'
    | 'Construction Equipment'
    | string;

export interface VehicleSearchFilters {
    category?: VehicleCategory;
    make?: string;
    model?: string;
    year?: { min?: number; max?: number };
    status?: Vehicle['status'];
    searchQuery?: string;
}

export const VEHICLE_CATEGORIES: VehicleCategory[] = [
    'Sedan',
    'SUV',
    'Truck',
    'Van',
    'Minibus',
    'Bus',
    'Motorcycle',
    'Tractor',
    'Heavy Machinery',
    'Hatchback',
    'Pickup',
    'Farming Equipment',
    'Construction Equipment'
];

export const POPULAR_MAKES = [
    // Passenger Vehicles
    'Toyota',
    'Honda',
    'Ford',
    'Nissan',
    'Mazda',
    'Mitsubishi',
    'Isuzu',
    'Mercedes-Benz',
    'BMW',
    'Volkswagen',
    'Hyundai',
    'Kia',
    'Suzuki',
    'Subaru',
    'Land Rover',
    'Jeep',
    'Chevrolet',
    'Peugeot',
    'Renault',
    'Fiat',
    // Motorcycles
    'Yamaha',
    'Honda Motorcycles',
    'Kawasaki',
    'Suzuki Motorcycles',
    'Harley-Davidson',
    'Bajaj',
    'TVS',
    // Farming & Agricultural
    'John Deere',
    'Massey Ferguson',
    'New Holland',
    'Case IH',
    'Kubota',
    'Mahindra',
    // Construction & Heavy Machinery
    'Caterpillar',
    'Komatsu',
    'Volvo Construction',
    'JCB',
    'Hitachi',
    'Liebherr'
];

export const POPULAR_MODELS: Record<string, string[]> = {
    // Passenger Vehicles
    'Toyota': ['Prado', 'Hilux', 'Corolla', 'Camry', 'RAV4', 'Land Cruiser', 'Fortuner', 'Vitz', 'Yaris', 'Hiace'],
    'Honda': ['Fit', 'Civic', 'Accord', 'CR-V', 'HR-V', 'City', 'Jazz'],
    'Ford': ['Ranger', 'F-150', 'Explorer', 'Escape', 'Focus', 'Fiesta', 'Everest'],
    'Nissan': ['Navara', 'X-Trail', 'Qashqai', 'Patrol', 'Juke', 'Altima', 'Sentra'],
    'Mazda': ['CX-5', 'CX-3', 'Mazda3', 'Mazda6', 'BT-50', 'CX-9'],
    'Mitsubishi': ['L200', 'Pajero', 'Outlander', 'ASX', 'Lancer', 'Triton'],
    'Isuzu': ['D-Max', 'MU-X', 'NPR', 'FTR', 'Trooper'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLE', 'GLC', 'Sprinter'],
    'BMW': ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7'],
    'Volkswagen': ['Golf', 'Polo', 'Passat', 'Tiguan', 'Amarok', 'Touareg'],
    'Hyundai': ['Tucson', 'Santa Fe', 'Elantra', 'Accent', 'i10', 'i20'],
    'Kia': ['Sportage', 'Sorento', 'Rio', 'Picanto', 'Cerato', 'Seltos'],
    'Suzuki': ['Swift', 'Vitara', 'Jimny', 'Alto', 'Baleno', 'Ertiga'],
    'Land Rover': ['Defender', 'Discovery', 'Range Rover', 'Range Rover Sport', 'Evoque'],
    'Jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade'],

    // Motorcycles
    'Yamaha': ['YZF-R1', 'YZF-R6', 'MT-07', 'MT-09', 'FZ', 'XSR900', 'Tenere 700'],
    'Honda Motorcycles': ['CBR1000RR', 'CBR600RR', 'CB500X', 'CRF450', 'Africa Twin', 'Gold Wing'],
    'Kawasaki': ['Ninja 650', 'Ninja ZX-10R', 'Z900', 'Versys 650', 'KLX450'],
    'Suzuki Motorcycles': ['GSX-R1000', 'GSX-R750', 'V-Strom 650', 'Hayabusa', 'Boulevard'],
    'Harley-Davidson': ['Street 750', 'Iron 883', 'Fat Boy', 'Road King', 'Sportster'],
    'Bajaj': ['Pulsar', 'Dominar', 'Avenger', 'CT100', 'Platina'],
    'TVS': ['Apache', 'Jupiter', 'Ntorq', 'Star City', 'Radeon'],

    // Farming & Agricultural Equipment
    'John Deere': ['5075E', '6120M', '7230R', '8R Series', '9RX Series', 'Gator', 'X9 Combine'],
    'Massey Ferguson': ['5710', '6713', '7719', '8730', 'MF 400 Series', 'Ideal Combine'],
    'New Holland': ['T4', 'T6', 'T7', 'T8', 'CR Series Combine', 'Boomer Compact'],
    'Case IH': ['Farmall', 'Maxxum', 'Puma', 'Magnum', 'Axial-Flow Combine'],
    'Kubota': ['M Series', 'L Series', 'B Series', 'MX Series', 'RTV Utility'],
    'Mahindra': ['575 DI', '475 DI', 'Arjun', 'Yuvraj', 'Jivo'],

    // Construction & Heavy Machinery
    'Caterpillar': ['D6 Dozer', '320 Excavator', '950 Wheel Loader', '730 Truck', 'Motor Grader'],
    'Komatsu': ['PC200 Excavator', 'D65 Dozer', 'WA380 Loader', 'HD785 Truck'],
    'Volvo Construction': ['EC220 Excavator', 'L120 Loader', 'A40 Truck', 'SD115 Compactor'],
    'JCB': ['3CX Backhoe', 'JS220 Excavator', '457 Loader', 'Fastrac Tractor'],
    'Hitachi': ['ZX200 Excavator', 'ZW220 Loader', 'EH3500 Truck'],
    'Liebherr': ['R 956 Excavator', 'L 566 Loader', 'LTM 1300 Crane']
};
