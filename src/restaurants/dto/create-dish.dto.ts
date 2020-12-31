import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";

import { MutationOutput } from "src/common/dto/output.dto";
import { Dish } from "../entities/dish.entity";

@InputType()
export class CreateDishDto extends PickType(Dish, ["name", "price", "description", "options"]) {
    @Field(type => Int)
    restaurantId: number;
}

@ObjectType()
export class CreateDishOutput extends MutationOutput {}