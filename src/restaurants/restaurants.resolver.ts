import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurants.entity";
import { CreateRestaurantDto } from "./dto/restaurant.dto";
import { RestaurantService } from "./restaurants.service";

@Resolver(of => Restaurant)
export class RestaurantsResolver {
    constructor(private readonly restaurantService: RestaurantService) {}

    @Query(returns => [Restaurant])
    restaurants(): Promise<Restaurant[]> {
       return this.restaurantService.getAll();
    }

    @Mutation(returns => Boolean)
    createRestaurant(
        @Args() createRestaurantDto: CreateRestaurantDto
    ): boolean {
        return true;
    }
}
