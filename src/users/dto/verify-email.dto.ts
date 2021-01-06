import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "../../common/dto/output.dto";
import { Verification } from "../entities/verification.entity";

@ObjectType()
export class VerifyEmailOutput extends CoreOutput {}

@InputType()
export class VerifyEmailDto extends PickType(Verification, ["code"]) {}