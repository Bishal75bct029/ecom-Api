import 'reflect-metadata';
import { dataSource } from '..';
import { CategoryEntity } from '../models/category.entity';
import { generateCategories } from '../factories/fakeData';

async function insertCategories(categories: any[], parent: CategoryEntity | null = null) {
  for (const categoryData of categories) {
    const category = new CategoryEntity();
    category.name = categoryData.name;
    category.image = categoryData.image;
    category.parent = parent;

    const savedCategory = await dataSource.manager.save(category);

    if (categoryData.children && categoryData.children.length > 0) {
      await insertCategories(categoryData.children, savedCategory);
    }
  }
}

export const seedCategories = async () => {
  try {
    await dataSource.initialize();
    console.log('Database Connected Successfully');

    const categories = generateCategories();
    await insertCategories(categories);

    console.log('Categories Inserted Successfully');
  } catch (e) {
    console.log(`${e} Error occurred while making connection`);
  }
};
