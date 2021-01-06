import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

import { CoreOutput } from "src/common/dto/output.dto";
import { Restaurant } from "../entities/restaurants.entity";

@InputType()
export class RestaurantDto {
    @Field(type => Int)
    restaurantId: number;
}

@ObjectType()
export class RestaurantOutput extends CoreOutput {
    @Field(type => Restaurant, { nullable: true })
    restaurant?: Restaurant;
}