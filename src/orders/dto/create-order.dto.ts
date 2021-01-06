import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

import { CoreOutput } from "src/common/dto/output.dto";
import { OrderItemOption } from "../entities/order-item.entity";

@InputType()
class CreateOrderItemDto {
    @Field(type => Int)
    dishId: number;

    @Field(type => [OrderItemOption], { nullable: true })
    options?: OrderItemOption[];
}

@InputType()
export class CreateOrderDto {
    @Field(type => Int)
    restaurantId: number;

    @Field(type => [CreateOrderItemDto])
    items: CreateOrderItemDto[];
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}