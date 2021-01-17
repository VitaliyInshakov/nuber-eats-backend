import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";

import { CoreEntity } from "src/common/entitites/core.entity";
import { User } from "src/users/entities/user.entity";
import { Restaurant } from "src/restaurants/entities/restaurants.entity";

@InputType("PaymentInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class Payment extends CoreEntity {
    @Field(type => String)
    @Column()
    transactionId: string;

    @Field(type => User)
    @ManyToOne(
        type => User,
        user => user.payments,
    )
    user: User;

    @RelationId((payment: Payment) => payment.user)
    userId: number;

    @Field(type => Restaurant)
    @ManyToOne(type => Restaurant)
    restaurant: Restaurant;

    @Field(type => Int)
    @RelationId((payment: Payment) => payment.restaurant)
    restaurantId: number;
}