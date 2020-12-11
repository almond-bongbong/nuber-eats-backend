import { Args, Mutation, Resolver } from '@nestjs/graphql';
import Order from './entities/order.entity';
import { OrdersService } from './orders.service';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Auth, CurrentUser } from '../auth/auth.decorator';
import User from '../users/entities/user.entity';
import { UserRole } from '../enums';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Auth(UserRole.CLIENT)
  @Mutation(() => CreateOrderOutput)
  async createOrder(
    @CurrentUser() currentUser: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      await this.ordersService.createOrder(currentUser, createOrderInput);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
}
