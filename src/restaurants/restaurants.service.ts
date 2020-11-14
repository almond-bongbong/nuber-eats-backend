import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurants.entity';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  getAll() {
    return this.restaurantRepository.find();
  }

  create(data: CreateRestaurantDto) {
    const newRestaurant = this.restaurantRepository.create(data);
    return this.restaurantRepository.save(newRestaurant);
  }
}
