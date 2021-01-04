import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne } from "typeorm";

import { Dish, DishOption } from "src/restaurants/entities/dish.entity";
import { CoreEntity } from "src/common/entitites/core.entity";

@InputType("OrderItemInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
    @Field(type => Dish)
    @ManyToOne(type => Dish, { nullable: true, onDelete: "CASCADE" })
    dish: Dish;

    @Field(type => [DishOption], { nullable: true })
    @Column({ type: "json", nullable: true })
    options?: DishOption[];
}