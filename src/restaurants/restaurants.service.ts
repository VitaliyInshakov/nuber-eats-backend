import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "src/users/entities/user.entity";
import { Restaurant } from "./entities/restaurants.entity";
import { CreateRestaurantDto, CreateRestaurantOutput } from "./dto/create-restaurant.dto";
import { EditRestaurantDto, EditRestaurantOutput } from "./dto/edit-restaurant.dto";
import { CategoryRepository } from "./repositories/category.repository";
import { Category } from "./entities/category.entity";

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
}