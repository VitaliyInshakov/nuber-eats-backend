import { Args, Mutation, Resolver } from "@nestjs/graphql";

import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { RestaurantService } from "./restaurants.service";
import { Restaurant } from "./entities/restaurants.entity";
import { CreateRestaurantDto, CreateRestaurantOutput } from "./dto/create-restaurant.dto";

@Resolver(of => Restaurant)
export class RestaurantsResolver {
    constructor(private readonly restaurantService: RestaurantService) {}

    @Mutation(returns => CreateRestaurantOutput)
    async createRestaurant(
        @AuthUser() authUser: User,
        @Args("input") createRestaurantDto: CreateRestaurantDto
    ): Promise<CreateRestaurantOutput> {
      return await this.restaurantService.createRestaurant(authUser, createRestaurantDto);
    }
}
