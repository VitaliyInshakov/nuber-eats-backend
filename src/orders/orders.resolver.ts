import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";

import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { Role } from "src/auth/role.decorator";
import { Order } from "./entities/order.entity";
import { OrdersService } from "./orders.service";
import { CreateOrderDto, CreateOrderOutput } from "./dto/create-order.dto";
import { GetOrdersDto, GetOrdersOutput } from "./dto/get-orders.dto";
import { GetOrderDto, GetOrderOutput } from "./dto/get-order.dto";
import { EditOrderDto, EditOrderOutput } from "./dto/edit-order.dto";

const pubsub = new PubSub();

@Resolver(of => Order)
export class OrdersResolver {
    constructor(private readonly ordersService: OrdersService) {}

    @Mutation(returns => CreateOrderOutput)
    @Role(["Client"])
    async createOrder(
        @AuthUser() customer: User,
        @Args("input") createOrderDto: CreateOrderDto,
    ): Promise<CreateOrderOutput> {
        return this.ordersService.createOrder(customer, createOrderDto);
    }

    @Query(returns => GetOrdersOutput)
    @Role(["Any"])
    async getOrders(
        @AuthUser() user: User,
        @Args("input") getOrdersDto: GetOrdersDto,
    ): Promise<GetOrdersOutput> {
        return this.ordersService.getOrders(user, getOrdersDto);
    }

    @Query(returns => GetOrderOutput)
    @Role(["Any"])
    async getOrder(
        @AuthUser() user: User,
        @Args("input") getOrderDto: GetOrderDto,
    ): Promise<GetOrderOutput> {
        return this.ordersService.getOrder(user, getOrderDto);
    }

    @Mutation(returns => EditOrderOutput)
    @Role(["Any"])
    async editOrder(
        @AuthUser() user: User,
        @Args("input") editOrderDto: EditOrderDto,
    ): Promise<EditOrderOutput> {
        return this.ordersService.editOrder(user, editOrderDto);
    }

    @Subscription(returns => String)
    orderSubscription() {
        return pubsub.asyncIterator("");
    }
}