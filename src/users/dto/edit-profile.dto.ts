import { CoreOutput } from "../../common/dto/output.dto";
import { InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { User } from "../entities/user.entity";

@ObjectType()
export class EditProfileOutput extends CoreOutput {}

@InputType()
export class EditProfileDto extends PartialType(PickType(User, ["email", "password"])) {}