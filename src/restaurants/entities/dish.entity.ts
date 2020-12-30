import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { IsNumber, IsString, Length } from "class-validator";

import { CoreEntity } from "src/common/entitites/core.entity";
import { Restaurant } from "./restaurants.entity";

@InputType("DishInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
    @Field(type => String)
    @Column({ unique: true })
    @IsString()
    name: string;

    @Field(type => Int)
    @Column()
    @IsNumber()
    price: number;

    @Field(type => String)
    @Column()
    @IsString()
    photo: string;

    @Field(type => String)
    @Column()
    @Length(5, 140)
    description: string;

    @Field(type => Restaurant)
    @ManyToOne(
        type => Restaurant,
        restaurant => restaurant.menu,
        { onDelete: "CASCADE"},
    )
    restaurant: Restaurant;

    @RelationId((dish: Dish) => dish.restaurant)
    restaurantId: number;
}