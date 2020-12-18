import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Order from './entities/order.entity';
import { Repository } from 'typeorm';
import User from '../users/entities/user.entity';
import { CreateOrderInput } from './dtos/create-order.dto';
import Restaurant from '../restaurants/entities/restaurants.entity';
import {
  AlreadyPickedUpError,
  NotFoundError,
  UnAuthorizedError,
} from '../errors';
import { OrderItem } from './entities/order-item.entity';
import Dish from '../restaurants/entities/dish.entity';
import { GetOrdersInput } from './dtos/get-orders.dto';
import { OrderStatus, UserRole } from '../enums';
import { GetOrderInput } from './dtos/get-order.dto';
import { EditOrderInput } from './dtos/edit-order.dto';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATES,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from '../common/constants';
import { PubSub } from 'graphql-subscriptions';
import { TakeOrderInput } from './dtos/take-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishRepository: Repository<Dish>,
    @Inject(PUB_SUB)
    private readonly pubSub: PubSub,
  ) {}

  async createOrder(customer: User, createOrderInput: CreateOrderInput) {
    const findRestaurant = await this.restaurantRepository.findOne(
      createOrderInput.restaurantId,
    );

    if (!findRestaurant) throw new NotFoundError();
    let totalOrderPrice = 0;

    const newOrderItemsFetches = createOrderInput.items.map(async item => {
      const findDish = await this.dishRepository.findOneOrFail(item.dishId);
      let optionPrice = 0;

      item.options.forEach(option => {
        const findDishOption = findDish.options.find(
          dishOption => dishOption.name === option.name,
        );

        if (!findDishOption) throw new NotFoundError();
        if (findDishOption.extra) optionPrice += findDishOption.extra;
        if (!findDishOption.extra && option.choice) {
          const findDishOptionChoice = findDishOption.choices.find(
            c => c.name === option.choice,
          );
          if (findDishOptionChoice.extra)
            optionPrice += findDishOptionChoice.extra;
        }
      });

      console.log(findDish.price + optionPrice);
      totalOrderPrice += findDish.price + optionPrice;

      const newOrderItem = this.orderItemRepository.create({
        dish: findDish,
        options: item.options,
      });
      return this.orderItemRepository.save(newOrderItem);
    });

    const newOrderItems = await Promise.all(newOrderItemsFetches);
    const newOrder = this.ordersRepository.create({
      customer,
      items: newOrderItems,
      restaurant: findRestaurant,
      total: totalOrderPrice,
    });

    const createdOrder = await this.ordersRepository.save(newOrder);
    await this.pubSub.publish(NEW_PENDING_ORDER, {
      newPendingOrder: { ...createdOrder, restaurant: findRestaurant },
    });
  }

  async getOrders(user: User, { status }: GetOrdersInput): Promise<Order[]> {
    if (user.role === UserRole.CLIENT) {
      return this.ordersRepository.find({
        where: {
          customer: user,
          ...(status && { status: status }),
        },
        relations: ['items'],
      });
    }
    if (user.role === UserRole.DELIVERY) {
      return this.ordersRepository.find({
        where: {
          driver: user,
          ...(status && { status: status }),
        },
        relations: ['items'],
      });
    }
    if (user.role === UserRole.OWNER) {
      const restaurantsOrders = await this.restaurantRepository.find({
        where: {
          owner: user,
        },
        relations: ['orders', 'orders.items', 'orders.restaurant'],
      });
      const orders = restaurantsOrders.map(r => r.orders).flat();
      return status ? orders.filter(o => o.status === status) : orders;
    }

    return [];
  }

  async getOrderIfRelatedUser(
    user: User,
    orderId: string,
    relations: string[] = [],
  ): Promise<Order> {
    const findOrder = await this.ordersRepository.findOne(orderId, {
      relations: ['restaurant', ...relations],
    });

    if (!findOrder) throw new NotFoundError();

    if (
      findOrder.driverId !== user.id &&
      findOrder.customerId !== user.id &&
      findOrder.restaurant.ownerId !== user.id
    ) {
      throw new UnAuthorizedError();
    }

    return findOrder;
  }

  async getOrder(user: User, getOrderInput: GetOrderInput): Promise<Order> {
    return this.getOrderIfRelatedUser(user, getOrderInput.id, [
      'items',
      'items.dish',
    ]);
  }

  async editOrder(user: User, editOrderInput: EditOrderInput) {
    const findOrder = await this.getOrderIfRelatedUser(user, editOrderInput.id);

    if (editOrderInput.status === OrderStatus.Pending) {
      throw new UnAuthorizedError();
    }

    if (
      user.role !== UserRole.OWNER &&
      (editOrderInput.status === OrderStatus.Cooking ||
        editOrderInput.status === OrderStatus.Cooked)
    ) {
      throw new UnAuthorizedError();
    }

    if (
      user.role !== UserRole.DELIVERY &&
      (editOrderInput.status === OrderStatus.PickedUp ||
        editOrderInput.status === OrderStatus.Delivered)
    ) {
      throw new UnAuthorizedError();
    }

    findOrder.status = editOrderInput.status;
    const editedOrder = await this.ordersRepository.save(findOrder);

    if (editOrderInput.status === OrderStatus.Cooked) {
      await this.pubSub.publish(NEW_COOKED_ORDER, {
        cookedOrder: editedOrder,
      });
    }

    await this.pubSub.publish(NEW_ORDER_UPDATES, {
      orderUpdates: editedOrder,
    });
  }

  async takeOrder(driver: User, takeOrderInput: TakeOrderInput): Promise<void> {
    const findOrder = await this.ordersRepository.findOne(takeOrderInput.id);

    if (!findOrder) throw new NotFoundError();
    if (findOrder.driverId) throw new AlreadyPickedUpError();

    findOrder.status = OrderStatus.PickedUp;
    findOrder.driver = driver;
    await this.ordersRepository.update(findOrder.id, {
      driver: findOrder.driver,
      status: OrderStatus.PickedUp,
    });
    await this.pubSub.publish(NEW_ORDER_UPDATES, { orderUpdates: findOrder });
  }
}
