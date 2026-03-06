process.env.NODE_ENV = "test";
import { store } from '../src/data/storefactory.js';

beforeAll(async () => {
  if ('seed' in store && typeof (store as any).seed === 'function') {
    console.log('🌱 Seeding test data...');
    await (store as any).seed(true); // force reseed if supported
  }
});

afterAll(async () => {
  if ('clear' in store && typeof (store as any).clear === 'function') {
    console.log('🧹 Clearing store after tests...');
    await (store as any).clear();
  } else if ('reset' in store && typeof (store as any).reset === 'function') {
    console.log('🧹 Resetting in-memory store after tests...');
    await (store as any).reset();
  } else {
    console.warn('⚠️  No teardown method found on store');
  }
});
