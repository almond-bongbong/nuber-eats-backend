import { InputType, OmitType } from '@nestjs/graphql';
import Restaurant from '../entities/restaurants.entity';
import { Length } from 'class-validator';

@InputType()
export class CreateRestaurantInputType extends OmitType(
  Restaurant,
  ['id'],
  InputType,
) {
  @Length(1, 5)
  name: string;
}
