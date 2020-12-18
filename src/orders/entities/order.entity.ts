import { Field, Float, ObjectType } from '@nestjs/graphql';
import CoreEntity from '../../common/entities/core.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  RelationId,
} from 'typeorm';
import User from '../../users/entities/user.entity';
import Restaurant from '../../restaurants/entities/restaurants.entity';
import { OrderStatus } from '../../enums';
import { OrderItem } from './order-item.entity';
import { IsEnum, IsNumber } from 'class-validator';

@ObjectType()
@Entity()
export default class Order extends CoreEntity {
  @ManyToOne(
    () => User,
    user => user.orders,
    { onDelete: 'SET NULL', nullable: true, lazy: true },
  )
  @Field(() => User, { nullable: true })
  customer?: Promise<User> | User;

  @RelationId((order: Order) => order.customer)
  customerId?: string;

  @ManyToOne(
    () => User,
    user => user.rides,
    { onDelete: 'SET NULL', nullable: true },
  )
  @Field(() => User, { nullable: true })
  driver?: User;

  @RelationId((order: Order) => order.driver)
  driverId?: string;

  @ManyToOne(
    () => Restaurant,
    restaurant => restaurant.orders,
    { onDelete: 'SET NULL', nullable: true },
  )
  @Field(() => Restaurant)
  restaurant: Restaurant;

  @ManyToMany(() => OrderItem)
  @JoinTable()
  @Field(() => [OrderItem])
  items: OrderItem[];

  @Column({ nullable: true })
  @Field(() => Float, { nullable: true })
  @IsNumber()
  total?: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
