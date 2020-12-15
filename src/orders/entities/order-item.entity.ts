import { Column, Entity, ManyToOne } from 'typeorm';
import CoreEntity from '../../common/entities/core.entity';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import Dish from '../../restaurants/entities/dish.entity';

@ObjectType()
@InputType('OrderItemOptionInput', { isAbstract: true })
export class OrderItemOption {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  choice?: string;

  @Field(() => Number, { nullable: true })
  extra?: number;
}

@Entity()
@ObjectType()
export class OrderItem extends CoreEntity {
  @ManyToOne(() => Dish, { nullable: true, onDelete: 'SET NULL' })
  @Field(() => Dish, { nullable: true })
  dish?: Dish;

  @Column({ type: 'json', nullable: true })
  @Field(() => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[];
}
