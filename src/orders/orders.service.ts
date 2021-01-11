import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PubSub } from "graphql-subscriptions";

import { User, UserRole } from "src/users/entities/user.entity";
import { Restaurant } from "src/restaurants/entities/restaurants.entity";
import { Dish } from "src/restaurants/entities/dish.entity";
import { NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUB_SUB } from "src/common/common.constants";
import { Order, OrderStatus } from "./entities/order.entity";
import { CreateOrderDto, CreateOrderOutput } from "./dto/create-order.dto";
import { OrderItem } from "./entities/order-item.entity";
import { GetOrdersDto, GetOrdersOutput } from "./dto/get-orders.dto";
import { GetOrderDto, GetOrderOutput } from "./dto/get-order.dto";
import { EditOrderDto } from "./dto/edit-order.dto";

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order) private readonly orders: Repository<Order>,
        @InjectRepository(OrderItem) private readonly orderItems: Repository<OrderItem>,
        @InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Dish) private readonly dishes: Repository<Dish>,
        @Inject(PUB_SUB) private readonly pubSub: PubSub,
    ) {}

    async createOrder(
        customer: User,
        { restaurantId, items }: CreateOrderDto,
    ): Promise<CreateOrderOutput> {
        try {
            const restaurant = await this.restaurants.findOne(restaurantId);
            if (!restaurant) {
                return {
                    ok: false,
                    error: "Restaurant not found",
                };
            }

            let orderFinalPrice = 0;
            const orderItems: OrderItem[] = [];
            for (const item of items) {
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

            const order = await this.orders.save(this.orders.create({
                customer,
                restaurant,
                total: orderFinalPrice,
                items: orderItems,
            }));

            await this.pubSub.publish(NEW_PENDING_ORDER, {
                pendingOrders: { order, ownerId: restaurant.ownerId },
            });

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

    async getOrders(
        user: User,
        { status }: GetOrdersDto,
    ): Promise<GetOrdersOutput> {
        try {
            let orders: Order[];
            if (user.role === UserRole.Client) {
                orders = await this.orders.find({
                    where: {
                        customer: user,
                        ...(status && { status }),
                    },
                });
            } else if (user.role === UserRole.Delivery) {
                orders = await this.orders.find({
                    where: {
                        driver: user,
                        ...(status && { status }),
                    },
                });
            } else if (user.role === UserRole.Owner) {
                const restaurants = await this.restaurants.find({
                    where: {
                        owner: user,
                    },
                    relations: ["orders"],
                });
                orders = restaurants.map(({ orders }) => orders).flat();
                if (status) {
                    orders = orders.filter(({ status: orderStatus }) => orderStatus === status);
                }
            }
            return {
                ok: true,
                orders,
            };
        } catch {
            return {
                ok: false,
                error: "Could not get orders",
            };
        }
    }

    canSeeOrder(user: User, order: Order): boolean {
        let canSee = true;
        if (user.role === UserRole.Client && order.customerId !== user.id) {
            canSee = false;
        }
        if (user.role === UserRole.Delivery && order.driverId !== user.id) {
            canSee = false;
        }
        if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
            canSee = false;
        }

        return canSee;
    }

    canEditOrder(user: User, status): boolean {
        let canEdit = true;
        if (user.role === UserRole.Client) {
            canEdit = false;
        }
        if (user.role === UserRole.Owner) {
            if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
                canEdit = false;
            }
        }
        if (user.role === UserRole.Delivery) {
            if (status !== OrderStatus.PickedUp && status !== OrderStatus.Delivered) {
                canEdit = false;
            }
        }

        return canEdit;
    }

    async getOrder(
        user: User,
        { id: orderId }: GetOrderDto,
    ): Promise<GetOrderOutput> {
        try {
            const order = await this.orders.findOne(orderId, {
                relations: ["restaurants"],
            });
            if (!order) {
                return {
                    ok: false,
                    error: "Order not found",
                };
            }

            if (!this.canSeeOrder(user, order)) {
                return {
                    ok: false,
                    error: "You can't see that",
                };
            }

            return {
                ok: true,
                order,
            };
        } catch {
            return {
                ok: false,
                error: "Could not get order",
            };
        }
    }

    async editOrder(
        user: User,
        { id: orderId, status }: EditOrderDto,
    ) {
        try {
            const order = await this.orders.findOne(orderId, {
                relations: ["restaurants"],
            });
            if (!order) {
                return {
                    ok: false,
                    error: "Order not found",
                };
            }

            if (!this.canSeeOrder(user, order)) {
                return {
                    ok: false,
                    error: "You can't see that",
                };
            }

            if(!this.canEditOrder(user, status)) {
                return {
                    ok: false,
                    error: "You can't do that",
                };
            }

            await this.orders.save([{
                id: orderId,
                status,
            }]);

            if (user.role === UserRole.Owner) {
                if (status === OrderStatus.Cooked) {
                    await this.pubSub.publish(NEW_COOKED_ORDER, {
                        cookedOrders: { ...order, status },
                    });
                }
            }

            await this.pubSub.publish(NEW_ORDER_UPDATE, {
                orderUpdates: { ...order, status },
            });

            return {
                ok: true,
            };
        } catch {
            return {
                ok: false,
                error: "Could not edit Order",
            };
        }
    }
}