import { ArgsType, Field, ObjectType } from "@nestjs/graphql";

import { MutationOutput } from "src/common/dto/output.dto";
import { Category } from "../entities/category.entity";

@ArgsType()
export class CategoryDto {
    @Field(type => String)
    slug: string;
}

@ObjectType()
export class CategoryOutput extends MutationOutput {
    @Field(type => Category, { nullable: true })
    category?: Category;
}