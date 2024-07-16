import 'reflect-metadata';
import { generateUsers } from '../factories/fakeData';
import { UserEntity } from '@/modules/user/entities';
import dataSource from '@/configs/typeorm';

export const seedUsers = async () => {
  try {
    await dataSource.initialize();
    console.log('Database Connected Successfully');

    const users = generateUsers();

    await dataSource.createQueryBuilder().insert().into(UserEntity).values(users).execute();

    console.log('Users Inserted Successfully');
  } catch (e) {
    console.log(`${e} Error occurred while making connection`);
  }
};
