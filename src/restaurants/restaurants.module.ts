import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CategoryResolver, DishResolver, RestaurantsResolver } from "./restaurants.resolver";
import { Restaurant } from "./entities/restaurants.entity";
import { RestaurantService } from "./restaurants.service";
import { CategoryRepository } from "./repositories/category.repository";
import { Dish } from "./entities/dish.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository])],
    providers: [RestaurantsResolver, CategoryResolver, RestaurantService, DishResolver, Dish],
})
export class RestaurantsModule {}
