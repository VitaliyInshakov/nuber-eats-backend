import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { RestaurantService } from "./restaurants.service";
import { Restaurant } from "./entities/restaurants.entity";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";

@Resolver(of => Restaurant)
export class RestaurantsResolver {
    constructor(private readonly restaurantService: RestaurantService) {}

    @Query(returns => [Restaurant])
    restaurants(): Promise<Restaurant[]> {
       return this.restaurantService.getAll();
    }

    @Mutation(returns => Boolean)
    async createRestaurant(
        @Args() createRestaurantDto: CreateRestaurantDto
    ): Promise<boolean> {
       try {
           await this.restaurantService.createRestaurant(createRestaurantDto);
           return true;
       } catch (e) {
           console.log(e);
           return false;
       }
    }

    @Mutation(returns => Boolean)
    async updateRestaurant(@Args("input") updateRestaurantDto: UpdateRestaurantDto): Promise<boolean> {
        try {
            await this.restaurantService.updateRestaurant(updateRestaurantDto);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}
