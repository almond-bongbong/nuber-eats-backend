import { InputType, PartialType } from '@nestjs/graphql';
import { CreateRestaurantInputType } from './create-restaurant.dto';

@InputType()
export class UpdateRestaurantInputType extends PartialType(
  CreateRestaurantInputType,
) {}
