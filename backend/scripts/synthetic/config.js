export const DATASET_SCALE = process.env.SYNTHETIC_DATA_SCALE || 'MEDIUM';

export const PROFILES = {
    SMALL: { users: 1000, visitors: 10000, complaints: 2000, expenses: 1000, notices: 100 },
    MEDIUM: { users: 5000, visitors: 100000, complaints: 20000, expenses: 10000, notices: 1000 },
    LARGE: { users: 10000, visitors: 500000, complaints: 100000, expenses: 50000, notices: 5000 }
};

export const config = {
    SEED: 42,
    SOCIETIES: 5,
    MONTHS: 36,
    START_DATE: new Date('2024-01-01T00:00:00Z'),
    SCALE: PROFILES[DATASET_SCALE]
};

export default config;
