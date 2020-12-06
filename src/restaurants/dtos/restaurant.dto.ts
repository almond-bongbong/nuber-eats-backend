import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/output.dto';
import Restaurant from '../entities/restaurants.entity';

@InputType()
export class RestaurantInput {
  @Field(() => String)
  restaurantId: string;
}

@ObjectType()
export class RestaurantOutput extends CoreOutput {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
