import User from '../../models/User.js';
import Occupancy from '../../models/Occupancy.js';
import Flat from '../../models/Flat.js';
import bcrypt from 'bcryptjs';
import { FLAT_TYPES } from './rules.js';
import config from './config.js';

export async function generateUsers(randomGen, society, flats, defaultPassword) {
    const usersBatch = [];
    const occupanciesBatch = [];
    
    // Calculate cap per society
    const maxUsers = Math.floor(config.SCALE.users / config.SOCIETIES);

    let usersCreated = 0;
    
    // First, allocate some staff & committee roles
    const staffCount = Math.floor(maxUsers * 0.1); // 10% staff
    const committeeCount = Math.floor(maxUsers * 0.05); // 5% committee

    for (let i = 0; i < staffCount && usersCreated < maxUsers; i++) {
        const staffRole = randomGen.pick(['security', 'service_staff']);
        const serviceCategory = staffRole === 'service_staff' 
            ? randomGen.pick(['electrician', 'plumber', 'gardener', 'housekeeping']) 
            : null;

        usersBatch.push(new User({
            name: `Staff Member ${usersCreated + 1}`,
            email: `staff${usersCreated + 1}_${society.doc._id}@example.com`,
            password: defaultPassword,
            role: staffRole,
            serviceCategory: serviceCategory,
            societyId: society.doc._id,
            accountStatus: 'ACTIVE',
            phone: `98${randomGen.nextInt(10000000, 99999999)}`,
            createdAt: randomGen.randomDate(config.START_DATE, new Date()),
            updatedAt: new Date()
        }));
        usersCreated++;
    }

    // Shuffle flats so occupancy is random
    const shuffledFlats = randomGen.shuffle(flats);

    let committeeAssigned = 0;

    for (const flat of shuffledFlats) {
        if (usersCreated >= maxUsers) break; // Hard cap reached
        
        // 55% Owner, 35% Tenant, 10% Vacant
        const occupancyChoice = randomGen.pickWeighted({ 'OWNER': 0.55, 'TENANT': 0.35, 'VACANT': 0.10 });
        
        flat.occupancyType = occupancyChoice;
        if (occupancyChoice === 'VACANT') {
            continue;
        }

        flat.status = 'OCCUPIED';

        // Primary Resident
        let role = 'resident';
        if (committeeAssigned < committeeCount) {
            role = randomGen.pick(['society_admin', 'super_admin']); // we'll use society_admin for committee
            // We can also have specific logic if backend supports chairman, but schema only has society_admin for committee
            role = 'society_admin';
            committeeAssigned++;
        }

        const primaryUser = new User({
            name: `Resident ${usersCreated + 1}`,
            email: `resident${usersCreated + 1}_${society.doc._id}@example.com`,
            password: defaultPassword,
            role: role,
            societyId: society.doc._id,
            accountStatus: 'ACTIVE',
            phone: `98${randomGen.nextInt(10000000, 99999999)}`,
            createdAt: randomGen.randomDate(config.START_DATE, new Date()),
            updatedAt: new Date()
        });

        usersBatch.push(primaryUser);
        usersCreated++;

        if (occupancyChoice === 'OWNER') {
            flat.ownerId = primaryUser._id;
        } else if (occupancyChoice === 'TENANT') {
            flat.tenantId = primaryUser._id;
        }

        occupanciesBatch.push(new Occupancy({
            societyId: society.doc._id,
            flatId: flat._id,
            userId: primaryUser._id,
            occupantName: primaryUser.name,
            occupancyType: occupancyChoice,
            residentType: 'PRIMARY',
            status: 'ACTIVE',
            moveInDate: primaryUser.createdAt
        }));

        // Family Members (no User record, just Occupancy)
        const flatSpecs = FLAT_TYPES[flat.flatType];
        const numResidents = randomGen.nextInt(flatSpecs.residentsMin, flatSpecs.residentsMax);

        for (let i = 1; i < numResidents; i++) {
            occupanciesBatch.push(new Occupancy({
                societyId: society.doc._id,
                flatId: flat._id,
                occupantName: `Family Member ${i} of Flat ${flat.flatNumber}`,
                occupancyType: occupancyChoice,
                residentType: 'FAMILY',
                status: 'ACTIVE',
                moveInDate: primaryUser.createdAt
            }));
        }
    }

    console.log(`  Inserting ${usersBatch.length} Users...`);
    const insertedUsers = await User.insertMany(usersBatch, { validateBeforeSave: false });
    
    console.log(`  Inserting ${occupanciesBatch.length} Occupancies...`);
    // Chunk occupancies since there are family members
    const CHUNK_SIZE = 5000;
    for (let i = 0; i < occupanciesBatch.length; i += CHUNK_SIZE) {
        await Occupancy.insertMany(occupanciesBatch.slice(i, i + CHUNK_SIZE), { validateBeforeSave: false });
    }

    console.log("  Updating Flats with occupancy details...");
    const flatUpdates = [];
    for (const flat of flats) {
        if (flat.status === 'OCCUPIED') {
            flatUpdates.push({
                updateOne: {
                    filter: { _id: flat._id },
                    update: {
                        $set: { 
                            occupancyType: flat.occupancyType,
                            status: flat.status,
                            ownerId: flat.ownerId,
                            tenantId: flat.tenantId
                        }
                    }
                }
            });
        }
    }
    
    for (let i = 0; i < flatUpdates.length; i += CHUNK_SIZE) {
        await Flat.bulkWrite(flatUpdates.slice(i, i + CHUNK_SIZE));
    }

    return insertedUsers;
}
