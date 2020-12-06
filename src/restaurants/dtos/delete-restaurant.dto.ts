import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/output.dto';

@InputType()
export class DeleteRestaurantInput {
  @Field(() => String)
  restaurantId: string;
}

@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput {}
