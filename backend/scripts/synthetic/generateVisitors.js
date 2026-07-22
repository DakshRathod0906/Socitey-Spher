import Visit from '../../models/Visit.js';
import Visitor from '../../models/Visitor.js';
import mongoose from 'mongoose';
import config from './config.js';

export async function generateVisitors(randomGen, society, flats, users) {
    const visitsData = [];
    const visitorsData = [];
    const now = new Date();
    
    const occupiedFlats = flats.filter(f => f.status === 'OCCUPIED');
    if (occupiedFlats.length === 0 || users.length === 0) return;

    const maxVisitors = Math.floor(config.SCALE.visitors / config.SOCIETIES);
    const targetVisits = Math.round(maxVisitors * society.profile.characteristics.visitorCountMultiplier);
    
    // Generate visitor pool
    const uniqueVisitorCount = Math.max(100, Math.round(targetVisits * 0.2));
    const visitorsPool = [];
    
    for(let i=0; i<uniqueVisitorCount; i++) {
        const type = randomGen.pickWeighted({ 'GUEST': 0.3, 'DELIVERY': 0.5, 'CAB': 0.1, 'SERVICE_PROVIDER': 0.1 });
        const visitor = new Visitor({
            societyId: society.doc._id,
            name: `Visitor ${i}`,
            phone: `98${randomGen.nextInt(10000000, 99999999)}`,
            visitorType: type,
            createdByUserId: users[0]._id // Admin or dummy
        });
        visitorsData.push(visitor);
        visitorsPool.push(visitor);
    }

    let currentVisitCount = 0;
    
    while(currentVisitCount < targetVisits) {
        const flat = randomGen.pick(occupiedFlats);
        const residentId = flat.tenantId || flat.ownerId;
        if (!residentId) continue;

        const expectedArrival = randomGen.randomDate(config.START_DATE, now);
        const dayOfWeek = expectedArrival.getDay(); // 0 (Sun) to 6 (Sat)
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const month = expectedArrival.getMonth();
        const isFestival = (month === 9 || month === 10);

        // Adjust visitor pick based on day/season
        let pool = visitorsPool;
        if (isWeekend) {
            // More guests on weekends
            pool = visitorsPool.filter(v => randomGen.chance(v.visitorType === 'GUEST' ? 0.7 : 0.2));
        } else {
            // More deliveries/cabs on weekdays
            pool = visitorsPool.filter(v => randomGen.chance(v.visitorType === 'DELIVERY' || v.visitorType === 'CAB' ? 0.8 : 0.1));
        }

        if (pool.length === 0) pool = visitorsPool; // fallback
        const visitor = randomGen.pick(pool);

        // Check if we should generate a "cluster" (festival spike)
        let clusterSize = 1;
        if (isFestival && visitor.visitorType === 'GUEST' && randomGen.chance(0.3)) {
            clusterSize = randomGen.nextInt(2, 5); // Spike during festival
        }

        for (let c = 0; c < clusterSize && currentVisitCount < targetVisits; c++) {
            const checkInTime = new Date(expectedArrival.getTime() + randomGen.nextInt(-10, 30) * 60000);
            const checkOutTime = new Date(checkInTime.getTime() + randomGen.nextInt(10, (visitor.visitorType === 'GUEST' ? 240 : 30)) * 60000);
            
            visitsData.push(new Visit({
                societyId: society.doc._id,
                visitorId: visitor._id,
                flatId: flat._id,
                residentUserId: residentId,
                purpose: visitor.visitorType === 'DELIVERY' ? 'Package Delivery' : 'Visit',
                approvalMode: randomGen.chance(0.8) ? 'AUTO' : 'MANUAL',
                status: 'CHECKED_OUT',
                expectedArrival: expectedArrival,
                validUntil: new Date(expectedArrival.getTime() + 24 * 60 * 60 * 1000),
                checkInTime: checkInTime,
                checkOutTime: checkOutTime,
                gate: randomGen.pick(['Main Gate', 'Gate 2']),
                createdByUserId: residentId
            }));
            currentVisitCount++;
        }
    }

    console.log(`  Inserting ${visitorsData.length} Visitor Profiles...`);
    const CHUNK_SIZE = 5000;
    for (let i = 0; i < visitorsData.length; i += CHUNK_SIZE) {
        await Visitor.insertMany(visitorsData.slice(i, i + CHUNK_SIZE), { validateBeforeSave: false });
    }

    console.log(`  Inserting ${visitsData.length} Visits...`);
    for (let i = 0; i < visitsData.length; i += CHUNK_SIZE) {
        await Visit.insertMany(visitsData.slice(i, i + CHUNK_SIZE), { validateBeforeSave: false });
    }
}
