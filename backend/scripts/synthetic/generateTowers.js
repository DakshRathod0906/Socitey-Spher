import Tower from '../../models/Tower.js';

export async function generateTowers(randomGen, { doc: soc }) {
    const numTowers = randomGen.nextInt(8, 10);
    const towersData = [];
    
    for (let t = 0; t < numTowers; t++) {
        towersData.push({
            societyId: soc._id,
            name: `Tower ${String.fromCharCode(65 + t)}`,
            floorsCount: randomGen.nextInt(10, 20),
            flatsPerFloor: randomGen.nextInt(4, 6)
        });
    }

    console.log(`  Inserting ${towersData.length} Towers...`);
    const towers = await Tower.insertMany(towersData, { validateBeforeSave: false });
    return towers;
}
