import { InputType, ObjectType, PickType } from "@nestjs/graphql";

import { Order } from "../entities/order.entity";
import { CoreOutput } from "../../common/dto/output.dto";

@InputType()
export class TakeOrderDto extends PickType(Order, ["id"]) {}

@ObjectType()
export class TakeOrderOutput extends CoreOutput {}