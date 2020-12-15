import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { OrderStatus } from '../../enums';
import { CoreOutput } from '../../common/dtos/output.dto';
import Order from '../entities/order.entity';

@InputType()
export class GetOrdersInput {
  @Field(() => OrderStatus, { nullable: true })
  status?: OrderStatus;
}

@ObjectType()
export class GetOrdersOutput extends CoreOutput {
  @Field(() => [Order], { nullable: true })
  orders?: Order[];
}
