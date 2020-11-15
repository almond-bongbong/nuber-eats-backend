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
  updateRestaurant(
    @Args('id') id: number,
    @Args('data') updateRestaurantInput: UpdateRestaurantInputType,
  ) {
    return true;
  }
}
