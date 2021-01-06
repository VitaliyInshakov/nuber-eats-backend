import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { Restaurant } from "../entities/restaurants.entity";
import { CoreOutput } from "../../common/dto/output.dto";

@InputType()
export class CreateRestaurantDto extends PickType(Restaurant, ["name", "coverImage", "address"]) {
    @Field(type => String)
    categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}