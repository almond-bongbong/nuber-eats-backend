import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  CLIENT = 'Client',
  OWNER = 'Owner',
  DELIVERY = 'Delivery',
}

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  Cooked = 'Cooked',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});
