import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Order from './entities/order.entity';
import { Repository } from 'typeorm';
import User from '../users/entities/user.entity';
import { CreateOrderInput } from './dtos/create-order.dto';
import Restaurant from '../restaurants/entities/restaurants.entity';
import { NotFoundError } from '../errors';
import { OrderItem } from './entities/order-item.entity';
import Dish from '../restaurants/entities/dish.entity';

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

    const newOrderItemsFetches = createOrderInput.items.map(async item => {
      const findDish = await this.dishRepository.findOneOrFail(item.dishId);
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
    });

    await this.ordersRepository.save(newOrder);
  }
}
