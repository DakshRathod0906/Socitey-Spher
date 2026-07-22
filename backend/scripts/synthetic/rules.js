export const FLAT_TYPES = {
    '1BHK': { carpetArea: 600, bedrooms: 1, bathrooms: 1, balconies: 1, parkingSlots: 1, maintenanceRate: 4.5, residentsMin: 1, residentsMax: 2, vehiclesMin: 0, vehiclesMax: 1 },
    '2BHK': { carpetArea: 900, bedrooms: 2, bathrooms: 2, balconies: 2, parkingSlots: 1, maintenanceRate: 4.5, residentsMin: 2, residentsMax: 4, vehiclesMin: 1, vehiclesMax: 2 },
    '3BHK': { carpetArea: 1300, bedrooms: 3, bathrooms: 3, balconies: 3, parkingSlots: 2, maintenanceRate: 4.5, residentsMin: 3, residentsMax: 6, vehiclesMin: 2, vehiclesMax: 3 },
    '4BHK': { carpetArea: 1800, bedrooms: 4, bathrooms: 4, balconies: 4, parkingSlots: 2, maintenanceRate: 4.5, residentsMin: 4, residentsMax: 7, vehiclesMin: 2, vehiclesMax: 4 },
    '5BHK': { carpetArea: 2500, bedrooms: 5, bathrooms: 5, balconies: 5, parkingSlots: 3, maintenanceRate: 4.5, residentsMin: 5, residentsMax: 8, vehiclesMin: 3, vehiclesMax: 5 }
};

export const SOCIETY_PROFILES = [
    { 
        key: 'LUXURY', 
        name: 'Grand Royale Residencies', 
        city: 'Mumbai', 
        state: 'Maharashtra',
        characteristics: {
            flatMix: { '1BHK': 0.05, '2BHK': 0.20, '3BHK': 0.45, '4BHK': 0.20, '5BHK': 0.10 },
            visitorCountMultiplier: 1.0,
            vehicleCountMultiplier: 2.0,
            expenseBase: 1.5,
            complaintMultiplier: 0.5,
            complaintWeights: { 'PLUMBING': 0.1, 'ELECTRICAL': 0.2, 'CLEANING': 0.1, 'SECURITY': 0.3, 'LIFT': 0.1, 'OTHER': 0.2 }
        }
    },
    { 
        key: 'FAMILY', 
        name: 'Greenwood Family Estate', 
        city: 'Pune', 
        state: 'Maharashtra',
        characteristics: {
            flatMix: { '1BHK': 0.10, '2BHK': 0.45, '3BHK': 0.35, '4BHK': 0.08, '5BHK': 0.02 },
            visitorCountMultiplier: 2.0, // lots of guests, deliveries, tutors
            vehicleCountMultiplier: 1.5,
            expenseBase: 1.0,
            complaintMultiplier: 1.0,
            complaintWeights: { 'PLUMBING': 0.3, 'ELECTRICAL': 0.2, 'CLEANING': 0.2, 'SECURITY': 0.1, 'LIFT': 0.1, 'OTHER': 0.1 }
        }
    },
    { 
        key: 'AFFORDABLE', 
        name: 'Sunrise Apartments', 
        city: 'Delhi', 
        state: 'Delhi',
        characteristics: {
            flatMix: { '1BHK': 0.30, '2BHK': 0.45, '3BHK': 0.20, '4BHK': 0.05, '5BHK': 0.00 },
            visitorCountMultiplier: 0.8,
            vehicleCountMultiplier: 1.0,
            expenseBase: 1.8, // high repairs
            complaintMultiplier: 1.5,
            complaintWeights: { 'PLUMBING': 0.4, 'ELECTRICAL': 0.1, 'CLEANING': 0.1, 'SECURITY': 0.05, 'LIFT': 0.3, 'OTHER': 0.05 }
        }
    },
    { 
        key: 'MIXED', 
        name: 'Cosmos Heights', 
        city: 'Bangalore', 
        state: 'Karnataka',
        characteristics: {
            flatMix: { '1BHK': 0.20, '2BHK': 0.30, '3BHK': 0.30, '4BHK': 0.15, '5BHK': 0.05 },
            visitorCountMultiplier: 1.5,
            vehicleCountMultiplier: 1.2,
            expenseBase: 1.0,
            complaintMultiplier: 1.0,
            complaintWeights: { 'PLUMBING': 0.2, 'ELECTRICAL': 0.2, 'CLEANING': 0.2, 'SECURITY': 0.1, 'LIFT': 0.1, 'OTHER': 0.2 }
        }
    },
    { 
        key: 'NEW', 
        name: 'EcoVista Premium', 
        city: 'Hyderabad', 
        state: 'Telangana',
        characteristics: {
            flatMix: { '1BHK': 0.0, '2BHK': 0.20, '3BHK': 0.50, '4BHK': 0.25, '5BHK': 0.05 },
            visitorCountMultiplier: 1.2,
            vehicleCountMultiplier: 1.5,
            expenseBase: 0.7,
            complaintMultiplier: 0.4, // new construction
            complaintWeights: { 'PLUMBING': 0.1, 'ELECTRICAL': 0.1, 'CLEANING': 0.3, 'SECURITY': 0.2, 'LIFT': 0.1, 'OTHER': 0.2 }
        }
    }
];

export const RESOLUTION_RULES = {
    'LIFT': { minHours: 1, maxHours: 6 },
    'ELECTRICAL': { minHours: 2, maxHours: 12 },
    'PLUMBING': { minHours: 4, maxHours: 24 }, // Medium/High
    'SECURITY': { minHours: 1, maxHours: 4 },
    'CLEANING': { minHours: 24, maxHours: 72 },
    'GARDENING': { minHours: 48, maxHours: 120 },
    'PARKING': { minHours: 12, maxHours: 72 },
    'OTHER': { minHours: 12, maxHours: 48 }
};
