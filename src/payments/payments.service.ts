import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";

import { User } from "src/users/entities/user.entity";
import { Restaurant } from "src/restaurants/entities/restaurants.entity";
import { Payment } from "./entities/payment.entity";
import { CreatePaymentDto, CreatePaymentOutput } from "./dto/create-payment.dto";
import { GetPaymentsOutput } from "./dto/get-payments.dto";

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment) private readonly payments: Repository<Payment>,
        @InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
        private schedulerRegistry: SchedulerRegistry,
    ) {}

    async createPayment(
        owner: User,
        { restaurantId, transactionId }: CreatePaymentDto,
    ): Promise<CreatePaymentOutput> {
        try {
            const restaurant = await this.restaurants.findOne(restaurantId);
            if (!restaurant) {
                return {
                    ok: false,
                    error: "Restaurant not found",
                };
            }
            if (restaurant.ownerId !== owner.id) {
                return {
                    ok: false,
                    error: "You can't do that",
                };
            }

            await this.payments.save(this.payments.create({
                transactionId,
                user: owner,
                restaurant,
            }));

            return {
                ok: true,
            };
        } catch {
            return {
                ok: false,
                error: "Could not create payment",
            };
        }
    }

    async getPayments(user: User): Promise<GetPaymentsOutput> {
        try {
            const payments = await this.payments.find({ user: user });
            return {
                ok: true,
                payments,
            }
        } catch {
            return {
                ok: false,
                error: "Could not load payments",
            };
        }
    }

    @Cron("30 * * * * *", {
        name: "myJob",
    })
    async checkForPayments() {
        console.log("Checking for payments");
        const job = this.schedulerRegistry.getCronJob("myJob");
        job.stop();
    }
}