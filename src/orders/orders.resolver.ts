import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import Order from './entities/order.entity';
import { OrdersService } from './orders.service';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Auth, CurrentUser } from '../auth/auth.decorator';
import User from '../users/entities/user.entity';
import { UserRole } from '../enums';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';

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

  @Auth()
  @Query(() => GetOrdersOutput)
  async getOrders(
    @CurrentUser() currentUser: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      const orders = await this.ordersService.getOrders(
        currentUser,
        getOrdersInput,
      );
      return {
        ok: true,
        orders,
      };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  @Auth()
  @Query(() => GetOrderOutput)
  async getOrder(
    @CurrentUser() currentUser: User,
    @Args('input') getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.ordersService.getOrder(currentUser, getOrderInput);
      return {
        ok: true,
        order,
      };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
}
