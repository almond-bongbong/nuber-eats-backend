import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import CoreEntity from '../../common/entities/core.entity';
import { IsNumber, IsString, Length } from 'class-validator';
import Restaurant from './restaurants.entity';

@ObjectType()
@InputType('DishOptionInput', { isAbstract: true })
class DishOption {
  @Field(() => String)
  name: string;

  @Field(() => [String], { nullable: true })
  choices?: string[];

  @Field(() => Number, { nullable: true })
  extra?: number;
}

@Entity()
@ObjectType()
export default class Dish extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsString()
  @Length(5)
  name: string;

  @Column()
  @Field(() => Number)
  @IsNumber()
  price: number;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  @IsString()
  photo?: string;

  @Column()
  @Field(() => String)
  @IsString()
  @Length(5, 140)
  description: string;

  @ManyToOne(
    () => Restaurant,
    (restaurant: Restaurant) => restaurant.menu,
    { onDelete: 'CASCADE' },
  )
  @Field(() => Restaurant)
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: string;

  @Column({ type: 'json', nullable: true })
  @Field(() => [DishOption], { nullable: true })
  options?: DishOption[];
}
