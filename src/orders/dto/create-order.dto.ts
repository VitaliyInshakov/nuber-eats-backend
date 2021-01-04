import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

import { MutationOutput } from "src/common/dto/output.dto";
import { DishOption } from "src/restaurants/entities/dish.entity";

@InputType()
class CreateOrderItemDto {
    @Field(type => Int)
    dishId: number;

    @Field(type => DishOption, { nullable: true })
    options?: DishOption;
}

@InputType()
export class CreateOrderDto {
    @Field(type => Int)
    restaurantId: number;

    @Field(type => [CreateOrderItemDto])
    items: CreateOrderItemDto[];
}

@ObjectType()
export class CreateOrderOutput extends MutationOutput {}