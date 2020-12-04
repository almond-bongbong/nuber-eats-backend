import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Restaurant from './entities/restaurants.entity';
import { Repository } from 'typeorm';
import { UpdateRestaurantInputType } from './dtos/update-restaurant.dto';
import { CreateRestaurantInput } from './dtos/create-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  getAll() {
    return this.restaurantRepository.find();
  }

  create(data: CreateRestaurantInput) {
    const newRestaurant = this.restaurantRepository.create(data);
    return this.restaurantRepository.save(newRestaurant);
  }

  async update(id: string, data: UpdateRestaurantInputType) {
    const findRestaurant = await this.restaurantRepository.findOne(id);
    return this.restaurantRepository.update({ id }, { ...data });
  }
}
