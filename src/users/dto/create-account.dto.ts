import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { User } from "../entities/user.entity";
import { CoreOutput } from "../../common/dto/output.dto";

@InputType()
export class CreateAccountDto extends PickType(User, ["email", "password", "role"]) {}

@ObjectType()
export class CreateAccountOutput extends CoreOutput {}