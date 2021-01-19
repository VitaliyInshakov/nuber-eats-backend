import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Raw, Repository } from "typeorm";

import { User } from "src/users/entities/user.entity";
import { Restaurant } from "./entities/restaurants.entity";
import { CreateRestaurantDto, CreateRestaurantOutput } from "./dto/create-restaurant.dto";
import { EditRestaurantDto, EditRestaurantOutput } from "./dto/edit-restaurant.dto";
import { CategoryRepository } from "./repositories/category.repository";
import { Category } from "./entities/category.entity";
import { DeleteRestaurantDto, DeleteRestaurantOutput } from "./dto/delete-restaurant.dto";
import { AllCategoriesOutput } from "./dto/all-categories.dto";
import { CategoryDto, CategoryOutput } from "./dto/category.dto";
import { RestaurantsDto, RestaurantsOutput } from "./dto/restaurants.dto";
import { RestaurantDto, RestaurantOutput } from "./dto/restaurant.dto";
import { SearchRestaurantDto, SearchRestaurantOutput } from "./dto/search-restaurant.dto";
import { CreateDishDto, CreateDishOutput } from "./dto/create-dish.dto";
import { Dish } from "./entities/dish.entity";
import { EditDishDto, EditDishOutput } from "./dto/edit-dish.dto";
import { DeleteDishDto, DeleteDishOutput } from "./dto/delete-dish.dto";

@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Dish) private readonly dishes: Repository<Dish>,
        private readonly categories: CategoryRepository,
    ) {}

    async createRestaurant(
        owner: User,
        createRestaurantDto: CreateRestaurantDto
    ): Promise<CreateRestaurantOutput> {
        try {
            const newRestaurant = this.restaurants.create(createRestaurantDto);
            newRestaurant.owner = owner;
            const category = await this.categories.getOrCreate(createRestaurantDto.categoryName);
            newRestaurant.category = category;
            await this.restaurants.save(newRestaurant);

            return {
                ok: true,
            };
        } catch {
            return {
                ok: false,
                error: "Could not create restaurant",
            };
        }
    }

    async editRestaurant(
        owner: User,
        editRestaurantDto: EditRestaurantDto
    ): Promise<EditRestaurantOutput> {
        try {
            const restaurant = await this.restaurants.findOne(editRestaurantDto.restaurantId);

            if (!restaurant) {
                return {
                    ok: false,
                    error: "Restaurant not found",
                };
            }

            if(owner.id !== restaurant.ownerId) {
                return {
                    ok: false,
                    error: "You can't edit a restaurant that you don't own",
                };
            }
            let category: Category = null;
            if(editRestaurantDto.categoryName) {
                category = await this.categories.getOrCreate(editRestaurantDto.categoryName);
            }

            await this.restaurants.save([{
                id: editRestaurantDto.restaurantId,
                ...editRestaurantDto,
                ...(category && { category }),
            }]);

            return {
                ok: true,
            };
        } catch {
            return {
                ok: false,
                error: "Could not edit Restaurant",
            };
        }
    }

    async deleteRestaurant(
        owner: User,
        { restaurantId }: DeleteRestaurantDto
    ): Promise<DeleteRestaurantOutput> {
        try {
            const restaurant = await this.restaurants.findOne(restaurantId);

            if (!restaurant) {
                return {
                    ok: false,
                    error: "Restaurant not found",
                };
            }

            if (owner.id !== restaurant.ownerId) {
                return {
                    ok: false,
                    error: "You can't delete a restaurant that you don't own",
                };
            }

            await this.restaurants.delete(restaurantId);

            return {
                ok: true,
            };
        } catch {
            return {
                ok: false,
                error: "Could not delete Restaurant",
            };
        }
    }

    async allCategories(): Promise<AllCategoriesOutput> {
        try {
            const categories = await this.categories.find();
            return {
                ok: true,
                categories,
            };
        } catch {
            return {
                ok: false,
                error: "Could not load categories",
            };
        }
    }

    countRestaurants(category: Category) {
        return this.restaurants.count({ category });
    }

    async findCategoryBySlug({ slug, page }: CategoryDto): Promise<CategoryOutput> {
        try {
            const category = await this.categories.findOne({ slug });
            if (!category) {
                return {
                    ok: false,
                    error: "Category not found",
                };
            }

            const restaurants = await this.restaurants.find({
                where: { category },
                take: 25,
                skip: (page - 1) * 25,
                order: {
                    isPromoted: "DESC",
                },
            });
            category.restaurants = restaurants;
            const total = await this.countRestaurants(category);

            return {
                ok: true,
                category,
                totalPages: Math.ceil(total / 25),
            };
        } catch {
            return {
                ok: false,
                error: "Could not load category",
            };
        }
    }

    async allRestaurants({ page }: RestaurantsDto): Promise<RestaurantsOutput> {
        try {
            const [restaurants, totalResults] = await this.restaurants.findAndCount({
                skip: (page - 1) * 25,
                take: 25,
                order: {
                    isPromoted: "DESC",
                },
            });
            return {
                ok: true,
                results: restaurants,
                totalPages: Math.ceil(totalResults / 25),
                totalResults,
            };
        } catch {
            return {
                ok: false,
                error: "Could not load restaurants",
            };
        }
    }

    async findRestaurantById({ restaurantId }: RestaurantDto): Promise<RestaurantOutput> {
        try {
            const restaurant = await this.restaurants.findOne(restaurantId, { relations: ["menu"] });
            if(!restaurant) {
                return {
                    ok: false,
                    error: "Restaurant not found",
                };
            }

            return {
                ok: true,
                restaurant,
            };
        } catch {
            return {
                ok: false,
                error: "Could not find restaurant",
            };
        }
    }

    async searchRestaurantByName({ query, page }: SearchRestaurantDto): Promise<SearchRestaurantOutput> {
        try {
            const [restaurants, totalResults] = await this.restaurants.findAndCount({
                where: {
                    name: Raw(name => `${name} ILIKE '%${query}%'`),
                },
                take: 25,
                skip: (page - 1) * 25,
            });

            return {
                ok: true,
                restaurants,
                totalPages: Math.ceil(totalResults / 25),
                totalResults,
            };
        } catch {
            return {
                ok: false,
                error: "Could not search restaurants",
            };
        }
    }

    async createDish(
        owner: User,
        createDishDto: CreateDishDto,
    ): Promise<CreateDishOutput> {
        try {
            const restaurant = await this.restaurants.findOne(createDishDto.restaurantId);
            if(!restaurant) {
                return {
                    ok: false,
                    error: "Restaurant not found",
                };
            }

            if (owner.id !== restaurant.ownerId) {
                return {
                    ok: false,
                    error: "You can't do that",
                };
            }

            await this.dishes.save(this.dishes.create({ ...createDishDto, restaurant }));
            return {
                ok: true,
            };
        } catch {
            return {
                ok: false,
                error: "Could not create dish",
            };
        }
    }

    async editDish(
        owner: User,
        editDishDto: EditDishDto,
    ): Promise<EditDishOutput> {
        try {
            const dish = await this.dishes.findOne(editDishDto.dishId, { relations: ["restaurant"]});
            if(!dish) {
                return {
                    ok: false,
                    error: "Dish not found",
                };
            }
            if(dish.restaurant.ownerId !== owner.id) {
                return {
                    ok: false,
                    error: "You can't do that",
                };
            }
            await this.dishes.save([
                {
                    id: editDishDto.dishId,
                    ...editDishDto,
                }
            ]);
            return {
                ok: true,
            };
        } catch {
            return {
                ok: false,
                error: "Could not edit dish",
            };
        }
    }

    async deleteDish(
        owner: User,
        { dishId }: DeleteDishDto,
    ): Promise<DeleteDishOutput> {
        try {
            const dish = await this.dishes.findOne(dishId, { relations: ["restaurant"]});
            if(!dish) {
                return {
                    ok: false,
                    error: "Dish not found",
                };
            }
            if(dish.restaurant.ownerId !== owner.id) {
                return {
                    ok: false,
                    error: "You can't do that",
                };
            }
            await this.dishes.delete(dishId);
            return {
                ok: true,
            };
        } catch {
            return {
                ok: false,
                error: "Could not delete dish",
            };
        }
    }
}