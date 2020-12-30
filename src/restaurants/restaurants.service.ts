import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "src/users/entities/user.entity";
import { Restaurant } from "./entities/restaurants.entity";
import { CreateRestaurantDto, CreateRestaurantOutput } from "./dto/create-restaurant.dto";
import { EditRestaurantDto, EditRestaurantOutput } from "./dto/edit-restaurant.dto";
import { CategoryRepository } from "./repositories/category.repository";
import { Category } from "./entities/category.entity";
import { DeleteRestaurantDto, DeleteRestaurantOutput } from "./dto/delete-restaurant.dto";
import { AllCategoriesOutput } from "./dto/all-categories.dto";
import { CategoryDto, CategoryOutput } from "./dto/category.dto";

@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        private readonly categories: CategoryRepository
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
}