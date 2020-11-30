import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { RestaurantsResolver } from "./restaurants.resolver";
import { Restaurant } from "./entities/restaurants.entity";
import { RestaurantService } from "./restaurants.service";

@Module({
    imports: [TypeOrmModule.forFeature([Restaurant])],
    providers: [RestaurantsResolver, RestaurantService],
})
export class RestaurantsModule {}
