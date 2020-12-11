import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import Order from './entities/order.entity';
import Restaurant from '../restaurants/entities/restaurants.entity';
import { OrderItem } from './entities/order-item.entity';
import Dish from '../restaurants/entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Restaurant, Dish])],
  providers: [OrdersService, OrdersResolver],
})
export class OrdersModule {}
