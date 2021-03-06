import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from "typeorm";
import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { InternalServerErrorException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { IsBoolean, IsEnum, IsString } from "class-validator";

import { CoreEntity } from "src/common/entitites/core.entity";
import { Restaurant } from "src/restaurants/entities/restaurants.entity";
import { Order } from "src/orders/entities/order.entity";
import { Payment } from "src/payments/entities/payment.entity";

export enum UserRole {
    Owner = "Owner",
    Client = "Client",
    Delivery = "Delivery",
}

registerEnumType(UserRole, { name: "UserRole"});

@InputType("UserInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
    @Field(type => String)
    @Column({ unique: true })
    email: string;

    @Field(type => String)
    @Column({ select: false })
    @IsString()
    password: string;

    @Field(type => UserRole)
    @Column({ type: "enum", enum: UserRole })
    @IsEnum(UserRole)
    role: UserRole;

    @Column({ default: false })
    @Field(type => Boolean)
    @IsBoolean()
    verified: boolean;

    @Field(type => [Restaurant])
    @OneToMany(type => Restaurant, restaurant => restaurant.owner)
    restaurants: Restaurant[];

    @Field(type => [Order])
    @OneToMany(type => Order, order => order.customer)
    orders: Order[];

    @Field(type => [Order])
    @OneToMany(type => Order, order => order.driver)
    rides: Order[];

    @Field(type => [Payment])
    @OneToMany(type => Payment, payment => payment.user)
    payments: Payment[];

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
        if (this.password) {
            try {
                this.password = await bcrypt.hash(this.password, 10);
            } catch (e) {
                console.log(e);
                throw new InternalServerErrorException();
            }
        }
    }

    async checkPassword(password: string): Promise<boolean> {
        try {
            return await bcrypt.compare(password, this.password);
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException();
        }
    }
}