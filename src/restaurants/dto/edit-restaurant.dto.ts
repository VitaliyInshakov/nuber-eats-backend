import { Field, InputType, ObjectType, PartialType } from "@nestjs/graphql";

import { MutationOutput } from "src/common/dto/output.dto";
import { CreateRestaurantDto } from "./create-restaurant.dto";

@InputType()
export class EditRestaurantDto extends PartialType(CreateRestaurantDto) {
    @Field(type => Number)
    restaurantId: number;
}

@ObjectType()
export class EditRestaurantOutput extends MutationOutput {}