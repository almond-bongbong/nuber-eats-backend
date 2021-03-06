import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import CoreEntity from '../../common/entities/core.entity';
import { Category } from './category.entity';
import User from '../../users/entities/user.entity';
import Dish from './dish.entity';
import Order from '../../orders/entities/order.entity';

@Entity()
@ObjectType()
export default class Restaurant extends CoreEntity {
  @Column()
  @Field(() => String)
  name: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  coverImage: string;

  @Column()
  @Field(() => String)
  address: string;

  @ManyToOne(
    () => Category,
    category => category.restaurants,
    { nullable: true, onDelete: 'SET NULL', eager: true },
  )
  @Field(() => Category, { nullable: true })
  category: Category;

  @RelationId((restaurant: Restaurant) => restaurant.category)
  categoryId: string;

  @ManyToOne(
    () => User,
    user => user.restaurants,
    { onDelete: 'CASCADE' },
  )
  @Field(() => User)
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: string;

  @OneToMany(
    () => Dish,
    (dish: Dish) => dish.restaurant,
  )
  @Field(() => [Dish], { defaultValue: [] })
  menu: Dish[];

  @OneToMany(
    () => Order,
    order => order.restaurant,
    { nullable: true },
  )
  @Field(() => [Order], { nullable: true })
  orders?: Order[];

  @Column({ default: false })
  @Field(() => Boolean)
  isPromoted: boolean;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  promotedUntil?: Date;
}
