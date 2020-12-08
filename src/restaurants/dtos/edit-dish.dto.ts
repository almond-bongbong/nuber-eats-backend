import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import Dish from '../entities/dish.entity';
import { CoreOutput } from '../../common/dtos/output.dto';

@InputType()
export class EditDishInput extends PartialType(
  PickType(Dish, ['name', 'options', 'price', 'description'], InputType),
) {
  @Field(() => String)
  dishId: string;
}

@ObjectType()
export class EditDishOutput extends CoreOutput {}
