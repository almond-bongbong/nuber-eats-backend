import CoreEntity from '../../common/entities/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import Restaurant from './restaurants.entity';

@Entity()
@ObjectType()
export class Category extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsString()
  name: string;

  @Column()
  @Field(() => String)
  @IsString()
  coverImage: string;

  @OneToMany(
    () => Restaurant,
    restaurant => restaurant.category,
  )
  @Field(() => [Restaurant])
  restaurants: Restaurant[];
}
