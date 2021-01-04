import { Args, Mutation, Resolver } from "@nestjs/graphql";

import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { Role } from "src/auth/role.decorator";
import { Order } from "./entities/order.entity";
import { OrdersService } from "./orders.service";
import { CreateOrderDto, CreateOrderOutput } from "./dto/create-order.dto";

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
}