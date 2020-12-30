import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { MutationOutput } from "./output.dto";

@InputType()
export class PaginationDto {
    @Field(type => Int, { defaultValue: 1 })
    page: number;
}

@ObjectType()
export class PaginationOutput extends MutationOutput {
    @Field(type => Int, { nullable: true })
    totalPages?: number;

    @Field(type => Int, { nullable: true })
    totalResults?: number;
}