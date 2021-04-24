import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/output.dto';
import Restaurant from '../entities/restaurants.entity';

@InputType()
export class MyRestaurantInput {
  @Field(() => String)
  id: string;
}

@ObjectType()
export class MyRestaurantOutput extends CoreOutput {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
