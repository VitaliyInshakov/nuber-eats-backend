import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Order } from "./entities/order.entity";
import { User } from "src/users/entities/user.entity";
import { Restaurant } from "src/restaurants/entities/restaurants.entity";
import { CreateOrderDto, CreateOrderOutput } from "./dto/create-order.dto";

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order) private readonly orders: Repository<Order>,
        @InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>
    ) {}

    async createOrder(
        customer: User,
        { restaurantId, items }: CreateOrderDto,
    ): Promise<CreateOrderOutput> {
        try {
            const restaurant = await this.restaurants.findOne(restaurantId);
            if(!restaurant) {
                return {
                    ok: false,
                    error: "Restaurant not found",
                };
            }
        } catch {
            return {
                ok: false,
                error: "Could not create order",
            };
        }
    }
}