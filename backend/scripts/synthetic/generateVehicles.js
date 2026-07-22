import Vehicle from '../../models/Vehicle.js';
import { FLAT_TYPES } from './rules.js';

export async function generateVehicles(randomGen, society, flats) {
    const vehiclesData = [];
    let licenseCounter = 1000;
    
    // EV probability derived from society profile (Luxury ~ 30%, Affordable ~ 2%)
    let evProb = 0.1;
    if (society.profile.key === 'LUXURY') evProb = 0.3;
    else if (society.profile.key === 'AFFORDABLE') evProb = 0.02;
    else if (society.profile.key === 'NEW') evProb = 0.25;
    
    for (const flat of flats) {
        if (flat.status === 'VACANT') continue;

        const flatSpecs = FLAT_TYPES[flat.flatType];
        let numVehicles = randomGen.nextInt(flatSpecs.vehiclesMin, flatSpecs.vehiclesMax);
        
        // Apply society multiplier
        numVehicles = Math.round(numVehicles * society.profile.characteristics.vehicleCountMultiplier);

        for (let v = 0; v < numVehicles; v++) {
            const ownerId = flat.tenantId || flat.ownerId;
            if (!ownerId) continue;

            // Base probabilities on flatType
            let weights = { 'TWO_WHEELER': 0.5, 'FOUR_WHEELER': 0.5 };
            
            if (flat.flatType === '1BHK') {
                weights = { 'TWO_WHEELER': 0.9, 'FOUR_WHEELER': 0.1 };
            } else if (flat.flatType === '2BHK') {
                weights = { 'TWO_WHEELER': 0.6, 'FOUR_WHEELER': 0.4 };
            } else if (flat.flatType === '4BHK' || flat.flatType === '5BHK') {
                weights = { 'TWO_WHEELER': 0.1, 'FOUR_WHEELER': 0.9 };
            }

            let type = randomGen.pickWeighted(weights);
            
            // Apply EV upgrade logic for FOUR_WHEELER
            if (type === 'FOUR_WHEELER' && randomGen.chance(evProb)) {
                type = 'EV_FOUR_WHEELER';
            }

            const plate = `MH${randomGen.nextInt(10, 14)}${randomGen.pick(['AB','XY','CD'])}` + licenseCounter++;

            vehiclesData.push(new Vehicle({
                societyId: society.doc._id,
                ownerUserId: ownerId,
                type: type,
                licensePlate: plate,
                normalizedLicensePlate: plate.replace(/\s/g, '').toUpperCase(),
                status: 'ACTIVE'
            }));
        }
    }

    console.log(`  Inserting ${vehiclesData.length} Vehicles...`);
    const CHUNK_SIZE = 5000;
    for (let i = 0; i < vehiclesData.length; i += CHUNK_SIZE) {
        await Vehicle.insertMany(vehiclesData.slice(i, i + CHUNK_SIZE), { validateBeforeSave: false });
    }
}
