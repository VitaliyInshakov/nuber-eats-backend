import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

import { MutationOutput } from "src/common/dto/output.dto";
import { Restaurant } from "../entities/restaurants.entity";

@InputType()
export class RestaurantDto {
    @Field(type => Int)
    restaurantId: number;
}

@ObjectType()
export class RestaurantOutput extends MutationOutput {
    @Field(type => Restaurant, { nullable: true })
    restaurant?: Restaurant;
}