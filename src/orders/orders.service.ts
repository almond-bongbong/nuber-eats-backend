import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Order from './entities/order.entity';
import { Repository } from 'typeorm';
import User from '../users/entities/user.entity';
import { CreateOrderInput } from './dtos/create-order.dto';
import Restaurant from '../restaurants/entities/restaurants.entity';
import { NotFoundError, UnAuthorizedError } from '../errors';
import { OrderItem } from './entities/order-item.entity';
import Dish from '../restaurants/entities/dish.entity';
import { GetOrdersInput } from './dtos/get-orders.dto';
import { UserRole } from '../enums';
import { GetOrderInput } from './dtos/get-order.dto';

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

    await this.ordersRepository.save(newOrder);
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

  async getOrder(user: User, getOrderInput: GetOrderInput): Promise<Order> {
    const findOrder = await this.ordersRepository.findOne(getOrderInput.id, {
      relations: ['restaurant', 'items', 'items.dish'],
    });

    if (
      findOrder.driverId !== user.id &&
      findOrder.customerId !== user.id &&
      findOrder.restaurant.ownerId !== user.id
    ) {
      throw new UnAuthorizedError();
    }

    return findOrder;
  }
}
