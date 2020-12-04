import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import CoreEntity from '../../common/entities/core.entity';
import { IsString } from 'class-validator';
import { Category } from './category.entity';
import User from '../../users/entities/user.entity';

@Entity()
@ObjectType()
export default class Restaurant extends CoreEntity {
  @Column()
  @Field(() => String)
  name: string;

  @Column()
  @Field(() => String)
  @IsString()
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

  @ManyToOne(
    () => User,
    user => user.restaurants,
  )
  @Field(() => User)
  owner: User;
}
