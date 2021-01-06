import { ArgsType, Field, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "../../common/dto/output.dto";
import { User } from "../entities/user.entity";

@ArgsType()
export class UserProfileDto {
    @Field(type => Number)
    userId: number;
}

@ObjectType()
export class UserProfileOutput extends CoreOutput {
    @Field(type => User, { nullable: true })
    user?: User;
}