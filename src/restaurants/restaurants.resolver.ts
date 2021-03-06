import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import Restaurant from './entities/restaurants.entity';
import { RestaurantsService } from './restaurants.service';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { UserRole } from '../enums';
import { Auth, CurrentUser } from '../auth/auth.decorator';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { Category } from './entities/category.entity';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import Dish from './entities/dish.entity';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants';
import { MyRestaurantInput, MyRestaurantOutput } from './dtos/my-restaurant';

@Resolver(() => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Auth(UserRole.OWNER)
  @Mutation(() => CreateRestaurantOutput)
  async createRestaurant(
    @CurrentUser() currentUser,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = await this.restaurantsService.createRestaurant(
        currentUser,
        createRestaurantInput,
      );
      return {
        ok: true,
        restaurantId: newRestaurant.id,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  @Auth(UserRole.OWNER)
  @Mutation(() => EditRestaurantOutput)
  async editRestaurant(
    @CurrentUser() currentUser,
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      await this.restaurantsService.editRestaurant(
        currentUser,
        editRestaurantInput,
      );
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
    return {
      ok: true,
    };
  }

  @Auth(UserRole.OWNER)
  @Mutation(() => DeleteRestaurantOutput)
  async deleteRestaurant(
    @CurrentUser() currentUser,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      await this.restaurantsService.deleteRestaurant(
        currentUser,
        deleteRestaurantInput,
      );
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
    return {
      ok: true,
    };
  }

  @Query(() => RestaurantsOutput)
  async allRestaurants(
    @Args('input') restaurantsInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    try {
      const [
        restaurants,
        totalCount,
      ] = await this.restaurantsService.allRestaurants(restaurantsInput);

      const totalPage = Math.ceil(totalCount / 25);

      return {
        ok: true,
        results: restaurants,
        totalCount,
        totalPage,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  @Query(() => MyRestaurantsOutput)
  @Auth(UserRole.OWNER)
  async myRestaurants(
    @CurrentUser() currentUser,
  ): Promise<MyRestaurantsOutput> {
    const restaurants = await this.restaurantsService.myRestaurants(
      currentUser,
    );
    return {
      ok: true,
      restaurants,
    };
  }

  @Query(() => MyRestaurantOutput)
  @Auth(UserRole.OWNER)
  async myRestaurant(
    @CurrentUser() currentUser,
    @Args('input') myRestaurantInput: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    try {
      const findMyRestaurant = await this.restaurantsService.getMyRestaurant(
        currentUser,
        myRestaurantInput.id,
      );

      return {
        ok: true,
        restaurant: findMyRestaurant,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  @Query(() => RestaurantOutput)
  async restaurant(
    @Args('input') restaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    try {
      const findRestaurant = await this.restaurantsService.findRestaurantById(
        restaurantInput,
      );
      return {
        ok: true,
        restaurant: findRestaurant,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  @Query(() => SearchRestaurantOutput)
  async searchRestaurant(
    @Args('input') searchRestaurantInput: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    try {
      const [
        restaurants,
        totalCount,
      ] = await this.restaurantsService.searchRestaurantByName(
        searchRestaurantInput,
      );
      const totalPage = Math.ceil(totalCount / 25);

      return {
        ok: true,
        totalCount,
        totalPage,
        restaurants,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
}

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @ResolveField(() => Number)
  restaurantCount(@Parent() parent: Category) {
    return this.restaurantsService.restaurantCountByCategoryId(parent.id);
  }

  @Query(() => AllCategoriesOutput)
  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.restaurantsService.allCategories();
      return {
        ok: true,
        categories,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  @Query(() => CategoryOutput)
  async category(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    try {
      const [
        category,
        totalCount,
      ] = await this.restaurantsService.findCategoryBySlug(categoryInput);

      const totalPage = Math.ceil(totalCount / 25);

      return {
        ok: true,
        category,
        totalCount,
        totalPage,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
}

@Resolver(() => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @Auth(UserRole.OWNER)
  @Mutation(() => CreateDishOutput)
  async createDish(
    @CurrentUser() currentUser,
    @Args('input') createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      await this.restaurantService.createDish(currentUser, createDishInput);
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

  @Auth(UserRole.OWNER)
  @Mutation(() => EditDishOutput)
  async editDish(
    @CurrentUser() currentUser,
    @Args('input') editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      await this.restaurantService.editDish(currentUser, editDishInput);
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

  @Auth(UserRole.OWNER)
  @Mutation(() => DeleteDishOutput)
  async deleteDish(
    @CurrentUser() currentUser,
    @Args('input') deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      await this.restaurantService.deleteDish(
        currentUser,
        deleteDishInput.dishId,
      );
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
