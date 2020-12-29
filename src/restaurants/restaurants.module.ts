import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CategoryResolver, RestaurantsResolver } from "./restaurants.resolver";
import { Restaurant } from "./entities/restaurants.entity";
import { RestaurantService } from "./restaurants.service";
import { CategoryRepository } from "./repositories/category.repository";

@Module({
    imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository])],
    providers: [RestaurantsResolver, CategoryResolver, RestaurantService],
})
export class RestaurantsModule {}
