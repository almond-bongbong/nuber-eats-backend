import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import Restaurant from '../entities/restaurants.entity';
import { Length } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';

@InputType()
export class CreateRestaurantInput extends PickType(
  Restaurant,
  ['name', 'address', 'coverImage'],
  InputType,
) {
  @Length(1, 20)
  name: string;

  @Field(() => String)
  categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {
  @Field(() => String)
  restaurantId?: string;
}
