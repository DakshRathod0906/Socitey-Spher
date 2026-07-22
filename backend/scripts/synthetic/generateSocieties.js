import Society from '../../models/Society.js';
import { SOCIETY_PROFILES } from './rules.js';

export async function generateSocieties(randomGen) {
    const societiesData = SOCIETY_PROFILES.map((profile, index) => {
        return {
            societyCode: `SOC${index + 1}000`,
            name: profile.name,
            address: `${randomGen.nextInt(1, 99)} Main St`,
            city: profile.city,
            state: profile.state,
            pincode: `40000${index}`,
            status: 'ACTIVE',
            setupProgress: { completed: true },
            totalTowers: randomGen.nextInt(8, 10),
            totalFlats: 0 // Will be updated later
        };
    });

    console.log(`Inserting ${societiesData.length} Societies...`);
    const societies = await Society.insertMany(societiesData, { validateBeforeSave: false });
    
    // Attach profile back for the generator context
    return societies.map((soc, i) => ({
        doc: soc,
        profile: SOCIETY_PROFILES[i]
    }));
}
