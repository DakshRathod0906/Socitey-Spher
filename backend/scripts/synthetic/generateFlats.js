import Flat from '../../models/Flat.js';
import { FLAT_TYPES } from './rules.js';

export async function generateFlats(randomGen, { doc: soc, profile }, towers) {
    const flatsData = [];

    for (const tower of towers) {
        const wings = ['A', 'B', 'C'];
        const wing = randomGen.pick(wings);

        for (let f = 1; f <= tower.floorsCount; f++) {
            for (let flatNum = 1; flatNum <= tower.flatsPerFloor; flatNum++) {
                
                const flatType = randomGen.pickWeighted(profile.characteristics.flatMix);
                const flatSpecs = FLAT_TYPES[flatType];
                
                flatsData.push({
                    societyId: soc._id,
                    towerId: tower._id,
                    flatNumber: `${f}${(flatNum).toString().padStart(2, '0')}`,
                    floor: f,
                    wing: wing,
                    flatType: flatType,
                    carpetArea: flatSpecs.carpetArea,
                    superBuiltUpArea: flatSpecs.carpetArea * 1.25,
                    bedrooms: flatSpecs.bedrooms,
                    bathrooms: flatSpecs.bathrooms,
                    balconies: flatSpecs.balconies,
                    parkingSlots: flatSpecs.parkingSlots,
                    occupancyType: 'VACANT',
                    status: 'VACANT',
                    maintenanceAmount: flatSpecs.carpetArea * flatSpecs.maintenanceRate,
                    isGenerated: true
                });
            }
        }
    }

    console.log(`  Inserting ${flatsData.length} Flats...`);
    const flats = await Flat.insertMany(flatsData, { validateBeforeSave: false });
    return flats;
}
