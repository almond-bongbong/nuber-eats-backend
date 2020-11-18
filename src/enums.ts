import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  'Client',
  'Owner',
  'Delivery',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});
