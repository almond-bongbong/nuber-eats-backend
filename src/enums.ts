import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  CLIENT = 'Client',
  OWNER = 'Owner',
  DELIVERY = 'Delivery',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});
