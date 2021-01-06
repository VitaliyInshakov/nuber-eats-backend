import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "src/users/entities/user.entity";
import { Restaurant } from "src/restaurants/entities/restaurants.entity";
import { Dish } from "src/restaurants/entities/dish.entity";
import { Order } from "./entities/order.entity";
import { CreateOrderDto, CreateOrderOutput } from "./dto/create-order.dto";
import { OrderItem } from "./entities/order-item.entity";

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order) private readonly orders: Repository<Order>,
        @InjectRepository(OrderItem) private readonly orderItems: Repository<OrderItem>,
        @InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Dish) private readonly dishes: Repository<Dish>,
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

            let orderFinalPrice = 0;
            const orderItems: OrderItem[] = [];
            for(const item of items) {
                const dish = await this.dishes.findOne(item.dishId);
                if(!dish) {
                    return {
                        ok: false,
                        error: "Dish not found"
                    };
                }

                let dishFinalPrice = dish.price;
                for(const itemOption of item.options) {
                    const dishOption = dish.options.find(option => option.name === itemOption.name);
                    if(!dishOption) {
                        if(dishOption.extra) {
                            dishFinalPrice += dishOption.extra;
                        } else {
                            const dishOptionChoice = dishOption.choices.find(choice => choice.name === itemOption.choice);
                            if(dishOptionChoice) {
                                if(dishOptionChoice.extra) {
                                    dishFinalPrice += dishOptionChoice.extra;
                                }
                            }
                        }
                    }
                }
                orderFinalPrice += dishFinalPrice;

                const orderItem = await this.orderItems.save(this.orderItems.create({
                    dish,
                    options: item.options,
                }));
                orderItems.push(orderItem);
            }

            await this.orders.save(this.orders.create({
                customer,
                restaurant,
                total: orderFinalPrice,
                items: orderItems,
            }));

            return {
                ok: true,
            };
        } catch {
            return {
                ok: false,
                error: "Could not create order",
            };
        }
    }
}