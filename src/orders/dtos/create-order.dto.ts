import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/output.dto';
import { OrderItemOption } from '../entities/order-item.entity';

@InputType()
class CreateOrderItemInput {
  @Field(() => String)
  dishId: string;

  @Field(() => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[] | null;
}

@InputType()
export class CreateOrderInput {
  @Field(() => String)
  restaurantId: string;

  @Field(() => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {
  @Field(() => String, { nullable: true })
  orderId?: string;
}
