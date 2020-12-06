import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import CoreEntity from '../../common/entities/core.entity';
import { Category } from './category.entity';
import User from '../../users/entities/user.entity';

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
    { nullable: true, onDelete: 'SET NULL' },
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
}
