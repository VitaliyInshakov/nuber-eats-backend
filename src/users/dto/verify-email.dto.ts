import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { MutationOutput } from "../../common/dto/output.dto";
import { Verification } from "../entities/verification.entity";

@ObjectType()
export class VerifyEmailOutput extends MutationOutput {}

@InputType()
export class VerifyEmailDto extends PickType(Verification, ["code"]) {}