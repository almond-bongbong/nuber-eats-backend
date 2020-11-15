import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurants.entity';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantInputType } from './dtos/create-restaurant.dto';
import { UpdateRestaurantInputType } from './dtos/update-restaurant.dto';

@Resolver(() => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Query(() => [Restaurant], { nullable: true })
  restaurants(@Args('veganOnly') veganOnly: boolean): Promise<Restaurant[]> {
    return this.restaurantsService.getAll();
  }

  @Mutation(() => Restaurant)
  createRestaurant(
    @Args('data') createRestaurantInputType: CreateRestaurantInputType,
  ): Promise<Restaurant> {
    return this.restaurantsService.create(createRestaurantInputType);
  }

  @Mutation(() => Boolean)
  async updateRestaurant(
    @Args('id') id: string,
    @Args('data') updateRestaurantInput: UpdateRestaurantInputType,
  ) {
    try {
      await this.restaurantsService.update(id, updateRestaurantInput);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
