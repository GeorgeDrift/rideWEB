
export interface VehicleCategoryType {
    id: string;
    name: string;
    icon: string; // We'll use string identifiers for icons and map them in the component
    subCategories: string[];
}

export interface MainCategoryType {
    id: string;
    title: string;
    categories: VehicleCategoryType[];
}

export const VEHICLE_HIRE_CATEGORIES: MainCategoryType[] = [
    {
        id: 'personal',
        title: 'Personal Vehicles',
        categories: [
            { id: 'sedan', name: 'Sedan', icon: 'CarIcon', subCategories: ['Economy', 'Luxury', 'Standard'] },
            { id: 'hatchback', name: 'Hatchback', icon: 'CarIcon', subCategories: ['Compact', 'Sport'] },
            { id: 'suv', name: 'SUV', icon: 'CarIcon', subCategories: ['4x4', 'Crossover', 'Full-size'] },
            { id: 'pickup', name: 'Pickup', icon: 'TruckIcon', subCategories: ['Single Cab', 'Double Cab', '4x4'] },
        ]
    },
    {
        id: 'passenger',
        title: 'Passenger Vehicles',
        categories: [
            { id: 'minibus', name: 'Minibus', icon: 'BusIcon', subCategories: ['15 Seater', '26 Seater'] },
            { id: 'coaster', name: 'Coaster', icon: 'BusIcon', subCategories: ['Standard', 'Executive'] },
            { id: 'exec_bus', name: 'Executive Bus', icon: 'BusIcon', subCategories: ['Luxury Coach', 'Sleeper'] },
            { id: 'vip_van', name: 'VIP Van', icon: 'BusIcon', subCategories: ['Alphard', 'Elgrand', 'V-Class'] },
        ]
    },
    {
        id: 'commercial',
        title: 'Commercial Vehicles',
        categories: [
            { id: 'flatbed', name: 'Flatbed Truck', icon: 'TruckIcon', subCategories: ['Small', 'Medium', 'Large'] },
            { id: 'box_truck', name: 'Box Truck', icon: 'TruckIcon', subCategories: ['Closed', 'Van'] },
            { id: 'refrigerated', name: 'Refrigerated', icon: 'TruckIcon', subCategories: ['Cold Chain'] },
            { id: 'curtain', name: 'Curtain-Side', icon: 'TruckIcon', subCategories: [] },
            { id: 'canter', name: 'Canter', icon: 'TruckIcon', subCategories: ['Light Duty'] },
            { id: 'hgv', name: 'Heavy Goods', icon: 'TruckIcon', subCategories: ['10-Ton', '20-Ton', 'Long-Haul'] },
            { id: 'tanker', name: 'Tanker', icon: 'TruckIcon', subCategories: ['Water', 'Fuel', 'Chemical'] },
            { id: 'tipper', name: 'Tipper', icon: 'TruckIcon', subCategories: ['Dump Truck'] },
            { id: 'specialized', name: 'Specialized', icon: 'TruckIcon', subCategories: ['Tow Truck', 'Crane Truck', 'Vacuum Truck', 'Skip Loader'] },
        ]
    },
    {
        id: 'construction',
        title: 'Construction Machinery',
        categories: [
            { id: 'tipper_const', name: 'Tipper', icon: 'TruckIcon', subCategories: [] },
            { id: 'excavator', name: 'Excavator', icon: 'TruckIcon', subCategories: [] },
            { id: 'grader', name: 'Grader', icon: 'TruckIcon', subCategories: [] },
            { id: 'loader', name: 'Loader', icon: 'TruckIcon', subCategories: [] },
            { id: 'bulldozer', name: 'Bulldozer', icon: 'TruckIcon', subCategories: [] },
        ]
    },
    {
        id: 'farm',
        title: 'Farm Machinery',
        categories: [
            { id: 'tractor', name: 'Tractor', icon: 'TruckIcon', subCategories: [] },
            { id: 'planter', name: 'Planter', icon: 'TruckIcon', subCategories: [] },
            { id: 'harvester', name: 'Harvester', icon: 'TruckIcon', subCategories: [] },
            { id: 'sprayer', name: 'Boom Sprayer', icon: 'TruckIcon', subCategories: [] },
        ]
    }
];
