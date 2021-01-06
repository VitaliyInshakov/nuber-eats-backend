import { InputType, ObjectType, PickType } from "@nestjs/graphql";

import { CoreOutput } from "src/common/dto/output.dto";
import { Order } from "../entities/order.entity";

@InputType()
export class EditOrderDto extends PickType(Order, ["id", "status"]) {}

@ObjectType()
export class EditOrderOutput extends CoreOutput {}