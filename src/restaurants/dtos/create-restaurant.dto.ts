import { Field, InputType, PickType } from '@nestjs/graphql';
import Restaurant from '../entities/restaurants.entity';
import { Length } from 'class-validator';

@InputType()
export class CreateRestaurantInput extends PickType(
  Restaurant,
  ['name', 'address', 'coverImage'],
  InputType,
) {
  @Length(1, 5)
  name: string;

  @Field(() => String)
  categoryId: string;

  @Field(() => String)
  ownerId: string;
}
