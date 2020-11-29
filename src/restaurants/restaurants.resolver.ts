import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurants.entity";
import { CreateRestaurantDto } from "./dto/restaurant.dto";

@Resolver(of => Restaurant)
export class RestaurantsResolver {
    @Query(returns => [Restaurant])
    restaurants(): Restaurant[] {
       return [];
    }

    @Mutation(returns => Boolean)
    createRestaurant(
        @Args() createRestaurantDto: CreateRestaurantDto
    ): boolean {
        return true;
    }
}
