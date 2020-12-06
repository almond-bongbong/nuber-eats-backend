import CoreEntity from '../../common/entities/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import Restaurant from './restaurants.entity';

@Entity()
@ObjectType()
export class Category extends CoreEntity {
  @Column({ unique: true })
  @Field(() => String)
  @IsString()
  name: string;

  @Column({ unique: true })
  @Field(() => String)
  @IsString()
  slug: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  coverImage?: string;

  @OneToMany(
    () => Restaurant,
    restaurant => restaurant.category,
  )
  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}
