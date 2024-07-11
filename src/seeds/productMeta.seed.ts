import { UserEntity } from '@/modules/user/entities';
import { Faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';

export const UsersFactory = setSeederFactory(UserEntity, (faker: Faker) => {
  const user = new UserEntity();
  user.email = faker.internet.email();
  user.name = faker.internet.userName();
  user.isOtpEnabled = faker.datatype.boolean();
  user.password = faker.internet.password();
  user.image = faker.image.url();

  return user;
});
