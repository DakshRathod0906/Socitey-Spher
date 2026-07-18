import Flat from "../../models/Flat.js";
import Tower from "../../models/Tower.js";
import Society from "../../models/Society.js";

export const addFlat = async (societyId, data) => {
  const { towerId, flatNumber, floor, type, maintenanceAmount } = data;
  if (!towerId || !flatNumber || floor === undefined) {
    throw new Error("Tower, flat number, and floor are required");
  }

  const tower = await Tower.findOne({ _id: towerId, societyId });
  if (!tower) {
    throw new Error("Tower not found in your society");
  }

  const existing = await Flat.findOne({ societyId, towerId, flatNumber });
  if (existing) {
    throw new Error("This flat number already exists in the selected tower");
  }

  const flat = await Flat.create({
    societyId,
    towerId,
    flatNumber,
    floor,
    type,
    maintenanceAmount: maintenanceAmount || 0,
  });

  await Society.findByIdAndUpdate(societyId, { $inc: { totalFlats: 1 } });

  return flat;
};

export const autoGenerateFlats = async (societyId, towerId, flatsPerFloor, type = "2BHK", baseMaintenanceAmount = 0) => {
  const tower = await Tower.findOne({ _id: towerId, societyId });
  if (!tower) {
    throw new Error("Tower not found in your society");
  }

  let newFlatsCount = 0;
  const flatsToInsert = [];

  for (let floor = 1; floor <= tower.totalFloors; floor++) {
    for (let flatIndex = 1; flatIndex <= flatsPerFloor; flatIndex++) {
      // Logic for flat numbering, e.g., Floor 1, Flat 1 -> 101
      const flatNumber = `${floor}${flatIndex.toString().padStart(2, '0')}`;
      
      const existing = await Flat.findOne({ societyId, towerId, flatNumber });
      if (!existing) {
        flatsToInsert.push({
          societyId,
          towerId,
          flatNumber,
          floor,
          type,
          maintenanceAmount: baseMaintenanceAmount,
        });
        newFlatsCount++;
      }
    }
  }

  if (flatsToInsert.length > 0) {
    await Flat.insertMany(flatsToInsert);
    await Society.findByIdAndUpdate(societyId, { $inc: { totalFlats: newFlatsCount } });
  }

  return { message: `${newFlatsCount} flats generated successfully` };
};

export const getFlats = async (societyId, towerId) => {
  const filter = { societyId };
  if (towerId) filter.towerId = towerId;

  return await Flat.find(filter).populate("towerId", "name").sort({ towerId: 1, floor: 1, flatNumber: 1 });
};

export const getFlatSummary = async (flatId) => {
  const flat = await Flat.findById(flatId).populate("towerId", "name");
  if (!flat) throw new Error("Flat not found");

  const [primaryResident, familyMembersCount] = await Promise.all([
    // Assuming User model has been updated with these fields
    import("../../models/User.js").then((m) =>
      m.default.findOne({ flatId, residentType: "PRIMARY", accountStatus: "ACTIVE" })
    ),
    import("../../models/User.js").then((m) =>
      m.default.countDocuments({ flatId, residentType: "FAMILY", accountStatus: "ACTIVE" })
    ),
  ]);
  
  const vehiclesCount = await import("../../models/Vehicle.js").then((m) =>
    m.default.countDocuments({ ownerUserId: primaryResident?._id, status: "ACTIVE" })
  );

  return {
    ...flat.toObject(),
    occupied: !!primaryResident,
    primaryResident,
    familyMembersCount,
    vehiclesCount,
  };
};
