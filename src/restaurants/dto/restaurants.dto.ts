import { Field, InputType, ObjectType } from "@nestjs/graphql";

import { PaginationDto, PaginationOutput } from "src/common/dto/pagination.dto";
import { Restaurant } from "../entities/restaurants.entity";

@InputType()
export class RestaurantsDto extends PaginationDto {}

@ObjectType()
export class RestaurantsOutput extends PaginationOutput {
    @Field(type => [Restaurant], { nullable: true })
    results?: Restaurant[];
}