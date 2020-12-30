import { Field, InputType, ObjectType } from "@nestjs/graphql";

import { PaginationDto, PaginationOutput } from "src/common/dto/pagination.dto";
import { Restaurant } from "../entities/restaurants.entity";

@InputType()
export class SearchRestaurantDto extends PaginationDto {
    @Field(type => String)
    query: string;
}

@ObjectType()
export class SearchRestaurantOutput extends PaginationOutput {
    @Field(type => [Restaurant], { nullable: true })
    restaurants?: Restaurant[];
}