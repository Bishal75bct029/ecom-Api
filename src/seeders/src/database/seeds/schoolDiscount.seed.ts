import 'reflect-metadata';
import { dataSource } from '..';
import { SchoolDiscountEntity } from '../models/schoolDiscount.entity';
import { generateSchoolDiscount } from '../factories/fakeData';

export const seedSchoolDiscount = async () => {
  try {
    await dataSource.initialize();
    console.log('Database Connected Successfully');

    const schoolDiscounts = generateSchoolDiscount();

    await dataSource.createQueryBuilder().insert().into(SchoolDiscountEntity).values(schoolDiscounts).execute();

    console.log('School Discounts Inserted Successfully');
  } catch (e) {
    console.log(`${e} Error occurred while making connection`);
  }
};
