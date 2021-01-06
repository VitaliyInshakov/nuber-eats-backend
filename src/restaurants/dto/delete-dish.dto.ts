import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

import { CoreOutput } from "src/common/dto/output.dto";

@InputType()
export class DeleteDishDto {
    @Field(type => Int)
    dishId: number;
}

@ObjectType()
export class DeleteDishOutput extends CoreOutput {}
