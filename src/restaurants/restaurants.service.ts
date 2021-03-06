import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Restaurant from './entities/restaurants.entity';
import { FindOneOptions, ILike, Repository } from 'typeorm';
import { CreateRestaurantInput } from './dtos/create-restaurant.dto';
import User from '../users/entities/user.entity';
import { EditRestaurantInput } from './dtos/edit-restaurant.dto';
import { NotFoundError, UnAuthorizedError } from '../errors';
import { CategoryRepository } from './repositories/category.repository';
import { DeleteRestaurantInput } from './dtos/delete-restaurant.dto';
import { Category } from './entities/category.entity';
import * as DataLoader from 'dataloader';
import { CategoryInput } from './dtos/category.dto';
import { RestaurantsInput } from './dtos/restaurants.dto';
import { RestaurantInput } from './dtos/restaurant.dto';
import { SearchRestaurantInput } from './dtos/search-restaurant.dto';
import { CreateDishInput } from './dtos/create-dish.dto';
import Dish from './entities/dish.entity';
import { EditDishInput } from './dtos/edit-dish.dto';

@Injectable()
export class RestaurantsService {
  private restaurantsLoader;

  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly categoryRepository: CategoryRepository,
    @InjectRepository(Dish)
    private readonly dishRepository: Repository<Dish>,
  ) {
    this.restaurantsLoader = new DataLoader(
      async (categoryIds: string[]) => {
        const result = await restaurantRepository
          .createQueryBuilder('restaurant')
          .select('restaurant.categoryId')
          .addSelect('count(restaurant.categoryId)', 'count')
          .groupBy('restaurant.categoryId')
          .having('restaurant.categoryId IN (:...categoryIds)', { categoryIds })
          .getRawMany();

        return categoryIds.map(cId =>
          Number(result.find(r => r.categoryId === cId)?.count || 0),
        );
      },
      { cache: false },
    );
  }

  private async getRestaurantIfOwn(
    owner: User,
    restaurantId: string,
    options?: FindOneOptions<Restaurant>,
  ): Promise<Restaurant> {
    const findRestaurant = await this.restaurantRepository.findOne(
      restaurantId,
      options,
    );
    if (!findRestaurant) throw new NotFoundError();
    if (findRestaurant.ownerId !== owner.id) throw new UnAuthorizedError();

    return findRestaurant;
  }

  private async getDishIfOwn(owner: User, dishId: string): Promise<Dish> {
    const findDish = await this.dishRepository.findOne(dishId, {
      relations: ['restaurant'],
    });
    if (!findDish) throw new NotFoundError();
    if (findDish.restaurant.ownerId !== owner.id) throw new UnAuthorizedError();

    return findDish;
  }

  async createRestaurant(owner: User, input: CreateRestaurantInput) {
    const category = await this.categoryRepository.getOrCreateCategory(
      input.categoryName,
    );
    const newRestaurant = this.restaurantRepository.create({
      name: input.name,
      address: input.address,
      coverImage: input.coverImage,
    });
    newRestaurant.owner = owner;
    newRestaurant.category = category;
    return this.restaurantRepository.save(newRestaurant);
  }

  async editRestaurant(owner: User, editRestaurantInput: EditRestaurantInput) {
    const findRestaurant = await this.getRestaurantIfOwn(
      owner,
      editRestaurantInput.restaurantId,
    );

    if (editRestaurantInput.categoryName) {
      findRestaurant.category = await this.categoryRepository.getOrCreateCategory(
        editRestaurantInput.categoryName,
      );
    }

    if (editRestaurantInput.coverImage) {
      findRestaurant.coverImage = editRestaurantInput.coverImage;
    }
    if (editRestaurantInput.address) {
      findRestaurant.address = editRestaurantInput.address;
    }
    if (editRestaurantInput.name) {
      findRestaurant.name = editRestaurantInput.name;
    }

    await this.restaurantRepository.save(findRestaurant);
  }

  async deleteRestaurant(
    owner: User,
    deleteRestaurantInput: DeleteRestaurantInput,
  ) {
    const findRestaurant = await this.getRestaurantIfOwn(
      owner,
      deleteRestaurantInput.restaurantId,
    );

    await this.restaurantRepository.delete(findRestaurant.id);
  }

  allCategories() {
    return this.categoryRepository.find();
  }

  restaurantCountByCategory(category: Category) {
    return this.restaurantRepository.count({
      category,
    });
  }

  restaurantCountByCategoryId(categoryId: string) {
    return this.restaurantsLoader.load(categoryId);
  }

  async findCategoryBySlug(
    findCategoryInput: CategoryInput,
  ): Promise<[Category, number]> {
    const findCategory = await this.categoryRepository.findOne({
      slug: findCategoryInput.slug,
    });
    const [
      findRestaurants,
      totalCount,
    ] = await this.restaurantRepository.findAndCount({
      where: {
        category: findCategory,
      },
      order: {
        isPromoted: 'DESC',
      },
      skip: (findCategoryInput.page - 1) * 25,
      take: 25,
    });

    findCategory.restaurants = findRestaurants;

    return [findCategory, totalCount];
  }

  allRestaurants(
    restaurantsInput: RestaurantsInput,
  ): Promise<[Restaurant[], number]> {
    const PAGE_SIZE = 25;
    return this.restaurantRepository.findAndCount({
      skip: (restaurantsInput.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      order: {
        isPromoted: 'DESC',
      },
    });
  }

  myRestaurants(currentUser: User): Promise<Restaurant[]> {
    return this.restaurantRepository.find({
      owner: currentUser,
    });
  }

  getMyRestaurant(
    currentUser: User,
    restaurantId: string,
  ): Promise<Restaurant> {
    return this.getRestaurantIfOwn(currentUser, restaurantId, {
      relations: ['menu', 'orders'],
    });
  }

  findRestaurantById(restaurantInput: RestaurantInput) {
    return this.restaurantRepository.findOne(restaurantInput.restaurantId, {
      relations: ['menu'],
    });
  }

  async searchRestaurantByName(
    searchRestaurantInput: SearchRestaurantInput,
  ): Promise<[Restaurant[], number]> {
    return this.restaurantRepository.findAndCount({
      where: {
        name: ILike(`%${searchRestaurantInput.query}%`),
      },
      skip: (searchRestaurantInput.page - 1) * 25,
      take: 25,
    });
  }

  async createDish(owner: User, createDishInput: CreateDishInput) {
    const findRestaurant = await this.getRestaurantIfOwn(
      owner,
      createDishInput.restaurantId,
    );
    const newDish = this.dishRepository.create(createDishInput);
    newDish.restaurant = findRestaurant;
    await this.dishRepository.save(newDish);
  }

  async editDish(owner: User, editDish: EditDishInput) {
    const findDish = await this.getDishIfOwn(owner, editDish.dishId);
    if (editDish.name) findDish.name = editDish.name;
    if (editDish.description) findDish.description = editDish.description;
    if (editDish.price) findDish.price = editDish.price;
    if (editDish.options) findDish.options = editDish.options;
    await this.dishRepository.save(findDish);
  }

  async deleteDish(owner: User, dishId: string) {
    const findDish = await this.getDishIfOwn(owner, dishId);
    await this.dishRepository.delete(findDish.id);
  }
}
