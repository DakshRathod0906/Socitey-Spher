/**
 * Generates flat numbers based on tower name, number of floors, and flats per floor.
 * 
 * Example: Tower A, 10 floors, 4 flats per floor
 * Generates: A-101, A-102, ..., A-1004
 * 
 * @param {string} towerName - The name of the tower (e.g., 'A')
 * @param {number} floorsCount - Total number of floors
 * @param {number} flatsPerFloor - Number of flats on each floor
 * @returns {Array<{floor: number, flatNumber: string}>} Array of flat objects
 */
export const generateFlatNumbers = (towerName, floorsCount, flatsPerFloor) => {
  const flats = [];

  for (let floor = 1; floor <= floorsCount; floor++) {
    for (let flatNum = 1; flatNum <= flatsPerFloor; flatNum++) {
      // Ensure flatNum is two digits (e.g., 01, 02)
      const formattedFlatNum = flatNum.toString().padStart(2, "0");
      const flatNumber = `${towerName}-${floor}${formattedFlatNum}`;
      
      flats.push({
        floor,
        flatNumber,
      });
    }
  }

  return flats;
};
