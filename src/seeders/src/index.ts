import 'reflect-metadata';
import { seedCategories, seedProductsWithMetas, seedSchoolDiscount, seedUsers } from './database/seeds';

const seed = {
  user: seedUsers,
  product: seedProductsWithMetas,
  category: seedCategories,
  schoolDiscount: seedSchoolDiscount,
} as any;

const entities = process.argv.slice(2);

try {
  entities.forEach(async (entity) => {
    seed[entity]();
  });
} catch (e) {
  console.log('Failed to seed data ', e);
}
