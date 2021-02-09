import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Restaurant } from "src/restaurants/entities/restaurants.entity";
import { PaymentService } from "./payments.service";
import { PaymentResolver } from "./payments.resolver";
import { Payment } from "./entities/payment.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Payment, Restaurant])],
    providers: [PaymentService, PaymentResolver],
})
export class PaymentsModule {}
