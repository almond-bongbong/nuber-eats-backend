import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurants.entity';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { RestaurantsService } from './restaurants.service';

@Resolver(() => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Query(() => [Restaurant], { nullable: true })
  restaurants(@Args('veganOnly') veganOnly: boolean): Promise<Restaurant[]> {
    return this.restaurantsService.getAll();
  }

  @Mutation(() => Restaurant)
  createRestaurant(
    @Args() createRestaurantInput: CreateRestaurantDto,
  ): Promise<Restaurant> {
    return this.restaurantsService.create(createRestaurantInput);
  }
}
