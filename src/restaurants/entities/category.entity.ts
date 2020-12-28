import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Column, Entity, OneToMany } from "typeorm";
import { IsString } from "class-validator";
import { CoreEntity } from "../../common/entitites/core.entity";
import { Restaurant } from "./restaurants.entity";

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
    @Field(type => String)
    @Column()
    @IsString()
    name: string;

    @Field(type => String)
    @Column()
    @IsString()
    coverImage: string;

    @Field(type => [Restaurant])
    @OneToMany(type => Restaurant, restaurant => restaurant.category)
    restaurants: Restaurant[];
}
