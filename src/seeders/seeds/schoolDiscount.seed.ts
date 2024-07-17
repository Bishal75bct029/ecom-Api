import { generateSchoolDiscount } from '../factories/fakeData';
import { SchoolDiscountEntity } from '@/modules/school-discount/entities/schoolDiscount.entity';
import dataSource from '@/configs/typeorm';

export const seedSchoolDiscount = async () => {
  try {
    await dataSource.initialize();
    console.log('Database Connected Successfully');

    const schoolDiscounts = generateSchoolDiscount();

    await dataSource.createQueryBuilder().insert().into(SchoolDiscountEntity).values(schoolDiscounts).execute();

    await dataSource.destroy();
    console.log('School Discounts Inserted Successfully');
  } catch (e) {
    console.log(`${e} Error occurred while making connection`);
  }
};
