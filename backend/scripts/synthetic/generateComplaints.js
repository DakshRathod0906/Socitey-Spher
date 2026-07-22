import Complaint from '../../models/Complaint.js';
import config from './config.js';
import { RESOLUTION_RULES } from './rules.js';

export async function generateComplaints(randomGen, society, flats, users) {
    const complaintsData = [];
    const now = new Date();
    const occupiedFlats = flats.filter(f => f.status === 'OCCUPIED');
    if (occupiedFlats.length === 0) return;

    // Complaints per society cap based on SCALE
    const maxComplaints = Math.floor(config.SCALE.complaints / config.SOCIETIES);
    const targetComplaints = Math.round(maxComplaints * society.profile.characteristics.complaintMultiplier);

    for (let i = 0; i < targetComplaints; i++) {
        const flat = randomGen.pick(occupiedFlats);
        const residentId = flat.tenantId || flat.ownerId;
        if (!residentId) continue;

        const createdAt = randomGen.randomDate(config.START_DATE, now);
        const month = createdAt.getMonth(); // 0 to 11

        let weights = { ...society.profile.characteristics.complaintWeights };

        // Seasonal spikes
        if (month >= 3 && month <= 5) { // Summer (Apr-Jun)
            weights['PLUMBING'] = (weights['PLUMBING'] || 0.1) * 1.5;
            weights['ELECTRICAL'] = (weights['ELECTRICAL'] || 0.1) * 1.5;
        } else if (month >= 6 && month <= 8) { // Monsoon (Jul-Sep)
            weights['CLEANING'] = (weights['CLEANING'] || 0.1) * 2.0;
            weights['PLUMBING'] = (weights['PLUMBING'] || 0.1) * 1.5;
        } else if (month === 9 || month === 10) { // Festival (Oct-Nov)
            weights['SECURITY'] = (weights['SECURITY'] || 0.1) * 1.5;
            weights['LIFT'] = (weights['LIFT'] || 0.1) * 1.2;
            weights['PARKING'] = 0.2; // Increase parking issues
        }

        const category = randomGen.pickWeighted(weights);
        const priority = category === 'LIFT' || category === 'SECURITY' || category === 'ELECTRICAL' ? 'HIGH' : (randomGen.chance(0.7) ? 'MEDIUM' : 'LOW');
        
        const rule = RESOLUTION_RULES[category] || RESOLUTION_RULES['OTHER'];
        const resolutionHours = randomGen.nextInt(rule.minHours, rule.maxHours);
        const resolvedAt = new Date(createdAt.getTime() + resolutionHours * 60 * 60 * 1000);
        
        const status = resolvedAt < now ? 'CLOSED' : 'OPEN';

        complaintsData.push(new Complaint({
            societyId: society.doc._id,
            residentId: residentId,
            flatId: flat._id,
            complaintNumber: `CMP-${createdAt.getFullYear()}-${(i + 1).toString().padStart(6, '0')}`,
            title: `${category} issue reported in Flat ${flat.flatNumber}`,
            description: `Synthetic complaint for ${category} at flat ${flat.flatNumber}`,
            category: category,
            priority: priority,
            status: status,
            createdAt: createdAt,
            expectedResolutionAt: new Date(createdAt.getTime() + rule.maxHours * 60 * 60 * 1000),
            actualResolutionAt: status === 'CLOSED' ? resolvedAt : null
        }));
    }

    console.log(`  Inserting ${complaintsData.length} Complaints...`);
    const CHUNK_SIZE = 5000;
    for (let i = 0; i < complaintsData.length; i += CHUNK_SIZE) {
        await Complaint.insertMany(complaintsData.slice(i, i + CHUNK_SIZE), { validateBeforeSave: false });
    }
}
