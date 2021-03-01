import { Field, ObjectType } from "@nestjs/graphql";

import { CoreOutput } from "src/common/dto/output.dto";
import { Restaurant } from "../entities/restaurants.entity";

@ObjectType()
export class MyRestaurantsDto extends CoreOutput {
    @Field(type => [Restaurant])
    restaurants?: Restaurant[];
}