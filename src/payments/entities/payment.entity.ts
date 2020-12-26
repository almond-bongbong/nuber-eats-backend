import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import CoreEntity from '../../common/entities/core.entity';
import User from '../../users/entities/user.entity';
import Restaurant from '../../restaurants/entities/restaurants.entity';

@ObjectType()
@Entity()
export default class Payment extends CoreEntity {
  @Column()
  @Field(() => String)
  transactionId: string;

  @ManyToOne(
    () => User,
    user => user.payments,
    { onDelete: 'SET NULL', lazy: true },
  )
  @Field(() => User)
  user: Promise<User> | User;

  @RelationId((payment: Payment) => payment.user)
  userId?: string;

  @ManyToOne(() => Restaurant)
  @Field(() => Restaurant)
  restaurant: Promise<Restaurant> | Restaurant;

  @RelationId((payment: Payment) => payment.restaurant)
  @Field(() => String)
  restaurantId: string;
}
