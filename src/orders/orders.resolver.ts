import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import Order from './entities/order.entity';
import { OrdersService } from './orders.service';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Auth, CurrentUser } from '../auth/auth.decorator';
import User from '../users/entities/user.entity';
import { UserRole } from '../enums';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { Inject } from '@nestjs/common';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATES,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from '../common/constants';
import { PubSub } from 'graphql-subscriptions';
import { OrderUpdatesInput } from './dtos/order-updates.dto';
import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
    private readonly ordersService: OrdersService,
  ) {}

  @Auth(UserRole.CLIENT)
  @Mutation(() => CreateOrderOutput)
  async createOrder(
    @CurrentUser() currentUser: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const newOrder = await this.ordersService.createOrder(
        currentUser,
        createOrderInput,
      );
      return {
        ok: true,
        orderId: newOrder.id,
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
      const order = await this.ordersService.getOrder(
        currentUser,
        getOrderInput,
      );
      return {
        ok: true,
        order,
      };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  @Auth([UserRole.OWNER, UserRole.DELIVERY])
  @Mutation(() => EditOrderOutput)
  async editOrder(
    @CurrentUser() currentUser: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      await this.ordersService.editOrder(currentUser, editOrderInput);
      return {
        ok: true,
      };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  @Auth(UserRole.OWNER)
  @Subscription(() => Order, {
    filter: ({ newPendingOrder }, _, { currentUser }) =>
      newPendingOrder.restaurant.ownerId === currentUser.id,
  })
  newPendingOrder() {
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Auth(UserRole.DELIVERY)
  @Subscription(() => Order)
  cookedOrder() {
    return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
  }

  @Auth()
  @Subscription(() => Order, {
    filter: (
      { orderUpdates }: { orderUpdates: Order },
      { input }: { input: OrderUpdatesInput },
    ) => orderUpdates.id === input.id,
  })
  async orderUpdates(
    @CurrentUser() currentUser: User,
    @Args('input') orderUpdatesInput: OrderUpdatesInput,
  ) {
    await this.ordersService.getOrderIfRelatedUser(
      currentUser,
      orderUpdatesInput.id,
    );
    return this.pubSub.asyncIterator(NEW_ORDER_UPDATES);
  }

  @Auth(UserRole.DELIVERY)
  @Mutation(() => TakeOrderOutput)
  async takeOrder(
    @CurrentUser() currentUser: User,
    @Args('input') takeOrderInput: TakeOrderInput,
  ): Promise<TakeOrderOutput> {
    try {
      await this.ordersService.takeOrder(currentUser, takeOrderInput);
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
