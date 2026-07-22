import Society from '../../models/Society.js';
import Tower from '../../models/Tower.js';
import Flat from '../../models/Flat.js';
import User from '../../models/User.js';
import Vehicle from '../../models/Vehicle.js';
import Complaint from '../../models/Complaint.js';
import Visitor from '../../models/Visitor.js';
import Visit from '../../models/Visit.js';
import Expense from '../../models/Expense.js';
import Notice from '../../models/Notice.js';
import Occupancy from '../../models/Occupancy.js';

export async function validateData() {
    console.log("Starting Post-Generation Validation...");
    let hasErrors = false;

    const collections = [
        { name: 'Societies', model: Society },
        { name: 'Towers', model: Tower },
        { name: 'Flats', model: Flat },
        { name: 'Users', model: User },
        { name: 'Occupancies', model: Occupancy },
        { name: 'Vehicles', model: Vehicle },
        { name: 'Complaints', model: Complaint },
        { name: 'Visitors', model: Visitor },
        { name: 'Visits', model: Visit },
        { name: 'Expenses', model: Expense },
        { name: 'Notices', model: Notice },
    ];

    console.log("--- Collection Counts ---");
    for (const coll of collections) {
        const count = await coll.model.countDocuments();
        console.log(`  ${coll.name}: ${count}`);
        if (count === 0 && coll.name !== 'Visits' && coll.name !== 'Visitors') {
            console.error(`  [ERROR] ${coll.name} is empty!`);
            hasErrors = true;
        }
    }

    console.log("--- Referential Integrity Checks ---");
    
    // 1. Cross-society references in Complaints
    const crossSocietyComplaints = await Complaint.aggregate([
        { $lookup: { from: 'users', localField: 'residentId', foreignField: '_id', as: 'resident' } },
        { $unwind: '$resident' },
        { $match: { $expr: { $ne: ['$societyId', '$resident.societyId'] } } },
        { $limit: 1 }
    ]);
    if (crossSocietyComplaints.length > 0) {
        console.error("  [ERROR] Cross-society references found in Complaints!");
        hasErrors = true;
    } else {
        console.log("  [PASS] Complaints society boundaries are intact.");
    }

    // 2. Occupied flat validation
    const invalidFlats = await Flat.aggregate([
        { $match: { status: 'OCCUPIED' } },
        { $match: { ownerId: null, tenantId: null } },
        { $limit: 1 }
    ]);
    if (invalidFlats.length > 0) {
        console.error("  [ERROR] Occupied flats missing ownerId/tenantId references!");
        hasErrors = true;
    } else {
        console.log("  [PASS] Occupied flats have valid occupant references.");
    }

    // 3. Vehicle owner validation
    const orphanVehicles = await Vehicle.aggregate([
        { $lookup: { from: 'users', localField: 'ownerUserId', foreignField: '_id', as: 'owner' } },
        { $match: { owner: { $size: 0 } } },
        { $limit: 1 }
    ]);
    if (orphanVehicles.length > 0) {
        console.error("  [ERROR] Vehicles found without valid owner users!");
        hasErrors = true;
    } else {
        console.log("  [PASS] All vehicles have valid owners.");
    }

    // 4. Visit references
    const invalidVisits = await Visit.aggregate([
        { $lookup: { from: 'flats', localField: 'flatId', foreignField: '_id', as: 'flat' } },
        { $match: { flat: { $size: 0 } } },
        { $limit: 1 }
    ]);
    if (invalidVisits.length > 0) {
        console.error("  [ERROR] Visits missing valid flat references!");
        hasErrors = true;
    } else {
        console.log("  [PASS] All visits reference valid flats.");
    }

    // 4a. Complaint references
    const invalidComplaints = await Complaint.aggregate([
        { $lookup: { from: 'flats', localField: 'flatId', foreignField: '_id', as: 'flat' } },
        { $match: { flat: { $size: 0 } } },
        { $limit: 1 }
    ]);
    if (invalidComplaints.length > 0) {
        console.error("  [ERROR] Complaints missing valid flat references!");
        hasErrors = true;
    } else {
        console.log("  [PASS] All complaints reference valid flats.");
    }

    const invalidComplaintResidents = await Complaint.aggregate([
        { $lookup: { from: 'users', localField: 'residentId', foreignField: '_id', as: 'resident' } },
        { $match: { resident: { $size: 0 } } },
        { $limit: 1 }
    ]);
    if (invalidComplaintResidents.length > 0) {
        console.error("  [ERROR] Complaints missing valid resident references!");
        hasErrors = true;
    } else {
        console.log("  [PASS] All complaints reference valid residents.");
    }

    // 4b. Occupancy references
    const invalidOccupancies = await Occupancy.aggregate([
        { $lookup: { from: 'flats', localField: 'flatId', foreignField: '_id', as: 'flat' } },
        { $match: { flat: { $size: 0 } } },
        { $limit: 1 }
    ]);
    if (invalidOccupancies.length > 0) {
        console.error("  [ERROR] Occupancies missing valid flat references!");
        hasErrors = true;
    } else {
        console.log("  [PASS] All occupancies reference valid flats.");
    }

    // 4c. Notice and Visitor references
    const invalidNotices = await Notice.aggregate([
        { $lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'user' } },
        { $match: { user: { $size: 0 } } },
        { $limit: 1 }
    ]);
    if (invalidNotices.length > 0) {
        console.error("  [ERROR] Notices missing valid createdBy user references!");
        hasErrors = true;
    } else {
        console.log("  [PASS] All notices reference valid users.");
    }

    const invalidVisitors = await Visitor.aggregate([
        { $lookup: { from: 'users', localField: 'createdByUserId', foreignField: '_id', as: 'user' } },
        { $match: { user: { $size: 0 } } },
        { $limit: 1 }
    ]);
    if (invalidVisitors.length > 0) {
        console.error("  [ERROR] Visitors missing valid createdByUserId references!");
        hasErrors = true;
    } else {
        console.log("  [PASS] All visitors reference valid users.");
    }

    // 5. Expense recorder validation
    const invalidExpenses = await Expense.aggregate([
        { $lookup: { from: 'users', localField: 'recordedBy', foreignField: '_id', as: 'user' } },
        { $match: { user: { $size: 0 } } },
        { $limit: 1 }
    ]);
    if (invalidExpenses.length > 0) {
        console.error("  [ERROR] Expenses missing valid recordedBy users!");
        hasErrors = true;
    } else {
        console.log("  [PASS] All expenses reference valid users.");
    }

    if (hasErrors) {
        console.error("\nVALIDATION FAILED!");
        process.exit(1);
    } else {
        console.log("\nVALIDATION PASSED! Dataset is robust.");
    }
}
