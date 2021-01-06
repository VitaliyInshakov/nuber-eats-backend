import { Field, InputType, ObjectType } from "@nestjs/graphql";

import { CoreOutput } from "src/common/dto/output.dto";

@InputType()
export class DeleteRestaurantDto {
    @Field(type => Number)
    restaurantId: number;
}

@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput {}