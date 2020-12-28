import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { RestaurantsResolver } from "./restaurants.resolver";
import { Restaurant } from "./entities/restaurants.entity";
import { RestaurantService } from "./restaurants.service";
import { Category } from "./entities/category.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Restaurant, Category])],
    providers: [RestaurantsResolver, RestaurantService],
})
export class RestaurantsModule {}
