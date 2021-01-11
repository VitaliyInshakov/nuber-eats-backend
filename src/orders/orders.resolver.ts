import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { Inject } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";

import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { Role } from "src/auth/role.decorator";
import { NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUB_SUB } from "src/common/common.constants";
import { Order } from "./entities/order.entity";
import { OrdersService } from "./orders.service";
import { CreateOrderDto, CreateOrderOutput } from "./dto/create-order.dto";
import { GetOrdersDto, GetOrdersOutput } from "./dto/get-orders.dto";
import { GetOrderDto, GetOrderOutput } from "./dto/get-order.dto";
import { EditOrderDto, EditOrderOutput } from "./dto/edit-order.dto";
import { OrderUpdatesDto } from "./dto/order-updates.dto";
import { TakeOrderDto, TakeOrderOutput } from "./dto/take-order.dto";

@Resolver(of => Order)
export class OrdersResolver {
    constructor(
        private readonly ordersService: OrdersService,
        @Inject(PUB_SUB) private readonly pubSub: PubSub,
    ) {}

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

    @Subscription(returns => Order, {
        filter: ({ pendingOrders: { ownerId } }, _, { user }) => {
            return ownerId === user.id;
        },
        resolve: ({ pendingOrders: { order } }) => order,
    })
    @Role(["Owner"])
    pendingOrders() {
        return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
    }

    @Subscription(returns => Order)
    @Role(["Delivery"])
    cookedOrders() {
        return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
    }

    @Subscription(returns => Order, {
        filter: ({ orderUpdates }, { input: { id } }, { user }) => {
            if (
                orderUpdates.driverId !== user.id
                && orderUpdates.customerId !== user.id
                && orderUpdates.restaurant.ownerId !== user.id
            ) {
                return false;
            }
            return orderUpdates.id === id;
        },
    })
    @Role(["Any"])
    orderUpdates(@Args("input") orderUpdatesDto: OrderUpdatesDto) {
        return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
    }

    @Mutation(returns => TakeOrderOutput)
    @Role(["Delivery"])
    takeOrder(
        @AuthUser() driver: User,
        @Args("input") takeOrderDto: TakeOrderDto,
    ): Promise<TakeOrderOutput> {
        return this.ordersService.takeOrder(driver, takeOrderDto);
    }
}