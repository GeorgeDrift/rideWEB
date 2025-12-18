
export interface VehicleCategoryType {
    id: string;
    name: string;
    icon: string;
    subCategories: string[];
}

export interface MainCategoryType {
    id: string;
    title: string;
    categories: VehicleCategoryType[];
}

export const VEHICLE_HIRE_CATEGORIES: MainCategoryType[] = [
    {
        id: 'passenger',
        title: 'Passenger Vehicles',
        categories: [
            { id: 'sedan', name: 'Sedan', icon: 'CarIcon', subCategories: [] },
            { id: 'hatchback', name: 'Hatchback', icon: 'CarIcon', subCategories: [] },
            { id: 'coupe', name: 'Coupe', icon: 'CarIcon', subCategories: [] },
            { id: 'convertible', name: 'Convertible', icon: 'CarIcon', subCategories: [] },
            { id: 'station_wagon', name: 'Station Wagon', icon: 'CarIcon', subCategories: [] },
            { id: 'suv', name: 'SUV', icon: 'CarIcon', subCategories: [] },
            { id: 'crossover', name: 'Crossover', icon: 'CarIcon', subCategories: [] },
            { id: 'limousine', name: 'Limousine', icon: 'CarIcon', subCategories: [] },
            { id: 'taxi', name: 'Taxi', icon: 'CarIcon', subCategories: [] },
            { id: 'minibus', name: 'Minibus', icon: 'BusIcon', subCategories: [] },
            { id: 'bus', name: 'Bus', icon: 'BusIcon', subCategories: [] },
        ]
    },
    {
        id: 'commercial',
        title: 'Commercial',
        categories: [
            { id: 'pickup', name: 'Pickup', icon: 'TruckIcon', subCategories: [] },
            { id: 'cargo_van', name: 'Cargo Van', icon: 'TruckIcon', subCategories: [] },
            { id: 'panel_van', name: 'Panel Van', icon: 'TruckIcon', subCategories: [] },
            { id: 'light_truck', name: 'Light Truck', icon: 'TruckIcon', subCategories: [] },
            { id: 'heavy_truck', name: 'Heavy Truck', icon: 'TruckIcon', subCategories: [] },
            { id: 'lorry', name: 'Lorry', icon: 'TruckIcon', subCategories: [] },
            { id: 'articulated_truck', name: 'Articulated Truck', icon: 'TruckIcon', subCategories: [] },
            { id: 'trailer_truck', name: 'Trailer Truck', icon: 'TruckIcon', subCategories: [] },
            { id: 'fuel_tanker', name: 'Fuel Tanker', icon: 'TruckIcon', subCategories: [] },
            { id: 'refrigerated_truck', name: 'Refrigerated Truck', icon: 'TruckIcon', subCategories: [] },
        ]
    },
    {
        id: 'construction',
        title: 'Construction',
        categories: [
            { id: 'dump_truck', name: 'Dump Truck', icon: 'TruckIcon', subCategories: [] },
            { id: 'cement_mixer', name: 'Cement Mixer', icon: 'TruckIcon', subCategories: [] },
            { id: 'tractor_const', name: 'Tractor (Construction)', icon: 'TruckIcon', subCategories: [] },
            { id: 'bulldozer', name: 'Bulldozer', icon: 'TruckIcon', subCategories: [] },
            { id: 'excavator', name: 'Excavator', icon: 'TruckIcon', subCategories: [] },
            { id: 'road_roller', name: 'Road Roller', icon: 'TruckIcon', subCategories: [] },
            { id: 'crane_truck', name: 'Crane Truck', icon: 'TruckIcon', subCategories: [] },
        ]
    },
    {
        id: 'special',
        title: 'Special',
        categories: [
            { id: 'tow_truck', name: 'Tow Truck', icon: 'TruckIcon', subCategories: [] },
            { id: 'car_carrier', name: 'Car Carrier', icon: 'TruckIcon', subCategories: [] },
            { id: 'garbage_truck', name: 'Garbage Truck', icon: 'TruckIcon', subCategories: [] },
            { id: 'mobile_crane', name: 'Mobile Crane', icon: 'TruckIcon', subCategories: [] },
            { id: 'street_sweeper', name: 'Street Sweeper', icon: 'TruckIcon', subCategories: [] },
            { id: 'armoured_vehicle', name: 'Armoured Vehicle', icon: 'TruckIcon', subCategories: [] },
        ]
    },
    {
        id: 'farm_machinery',
        title: 'Farm Machinery',
        categories: [
            { id: 'tractor_farm', name: 'Tractor', icon: 'TruckIcon', subCategories: ['Standard', 'Compact', 'Track', 'Utility'] },
            { id: 'seed_drill', name: 'Seed Drill', icon: 'TruckIcon', subCategories: [] },
            { id: 'planter', name: 'Planter', icon: 'TruckIcon', subCategories: [] },
            { id: 'transplanter', name: 'Transplanter', icon: 'TruckIcon', subCategories: [] },
            { id: 'broadcast_seeder', name: 'Broadcast Seeder', icon: 'TruckIcon', subCategories: [] },
            { id: 'plough', name: 'Plough', icon: 'TruckIcon', subCategories: [] },
            { id: 'harrow', name: 'Harrow', icon: 'TruckIcon', subCategories: [] },
            { id: 'rotary_tiller', name: 'Rotavator / Rotary Tiller', icon: 'TruckIcon', subCategories: [] },
            { id: 'cultivator', name: 'Cultivator', icon: 'TruckIcon', subCategories: [] },
            { id: 'ridger', name: 'Ridger', icon: 'TruckIcon', subCategories: [] },
            { id: 'irrigation_pump', name: 'Irrigation Pump', icon: 'TruckIcon', subCategories: [] },
            { id: 'sprinkler_system', name: 'Sprinkler System (Mobile)', icon: 'TruckIcon', subCategories: [] },
            { id: 'drip_irrigation', name: 'Drip Irrigation Rig', icon: 'TruckIcon', subCategories: [] },
            { id: 'combine_harvester', name: 'Combine Harvester', icon: 'TruckIcon', subCategories: [] },
            { id: 'forage_harvester', name: 'Forage Harvester', icon: 'TruckIcon', subCategories: [] },
            { id: 'sugarcane_harvester', name: 'Sugarcane Harvester', icon: 'TruckIcon', subCategories: [] },
            { id: 'potato_harvester', name: 'Potato Harvester', icon: 'TruckIcon', subCategories: [] },
            { id: 'corn_harvester', name: 'Corn Harvester', icon: 'TruckIcon', subCategories: [] },
            { id: 'thresher', name: 'Thresher', icon: 'TruckIcon', subCategories: [] },
            { id: 'grain_dryer', name: 'Grain Dryer', icon: 'TruckIcon', subCategories: [] },
            { id: 'bale_wrapper', name: 'Bale Wrapper', icon: 'TruckIcon', subCategories: [] },
            { id: 'chopper', name: 'Chopper / Shredder', icon: 'TruckIcon', subCategories: [] },
            { id: 'farm_trailer', name: 'Farm Trailer', icon: 'TruckIcon', subCategories: [] },
            { id: 'wagon', name: 'Wagon', icon: 'TruckIcon', subCategories: [] },
            { id: 'utv', name: 'Utility Vehicle (UTV)', icon: 'TruckIcon', subCategories: [] },
            { id: 'small_pickup_farm', name: 'Small Pickup (Farm)', icon: 'TruckIcon', subCategories: [] },
        ]
    }
];
