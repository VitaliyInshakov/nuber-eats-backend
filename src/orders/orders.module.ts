import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Restaurant } from "src/restaurants/entities/restaurants.entity";
import { Dish } from "src/restaurants/entities/dish.entity";
import { Order } from "./entities/order.entity";
import { OrdersService } from "./orders.service";
import { OrdersResolver } from "./orders.resolver";
import { OrderItem } from "./entities/order-item.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Order, Restaurant, OrderItem, Dish])],
    providers: [OrdersService, OrdersResolver],
})

export class OrdersModule {}
