import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Restaurant } from "src/restaurants/entities/restaurants.entity";
import { Order } from "./entities/order.entity";
import { OrdersService } from "./orders.service";
import { OrdersResolver } from "./orders.resolver";

@Module({
    imports: [TypeOrmModule.forFeature([Order, Restaurant])],
    providers: [OrdersService, OrdersResolver],
})

export class OrdersModule {}
