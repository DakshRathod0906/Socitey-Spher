class RandomGenerator {
    constructor(seed) {
        this.seed = seed;
    }

    // A simple seeded PRNG (Mulberry32)
    next() {
        let t = this.seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    // Return an integer between min (inclusive) and max (inclusive)
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    // Return a random element from an array
    pick(array) {
        if (!array || array.length === 0) return null;
        return array[this.nextInt(0, array.length - 1)];
    }

    // Return an array of n unique elements from an array
    pickN(array, n) {
        const result = [];
        const copy = [...array];
        for (let i = 0; i < n; i++) {
            if (copy.length === 0) break;
            const index = this.nextInt(0, copy.length - 1);
            result.push(copy.splice(index, 1)[0]);
        }
        return result;
    }

    // Pick based on a weighted distribution
    // weights object format: { 'value1': 0.6, 'value2': 0.4 }
    pickWeighted(weights) {
        const rand = this.next();
        let cumulative = 0;
        for (const [key, weight] of Object.entries(weights)) {
            cumulative += weight;
            if (rand < cumulative) {
                return key;
            }
        }
        return Object.keys(weights)[Object.keys(weights).length - 1]; // fallback
    }

    // Shuffle an array
    shuffle(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = this.nextInt(0, i);
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // Return a random boolean based on probability (0.0 to 1.0)
    chance(probability) {
        return this.next() < probability;
    }

    // Return a random date between start and end
    randomDate(start, end) {
        return new Date(start.getTime() + this.next() * (end.getTime() - start.getTime()));
    }
}

export default RandomGenerator;
