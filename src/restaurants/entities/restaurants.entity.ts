import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne } from "typeorm";
import { IsString } from "class-validator";
import { CoreEntity } from "../../common/entitites/core.entity";
import { Category } from "./category.entity";

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
    @Field(type => String)
    @Column()
    @IsString()
    name: string;

    @Field(type => String)
    @Column()
    @IsString()
    coverImage: string;

    @Field(type => String)
    @Column()
    @IsString()
    address: string;

    @Field(type => Category)
    @ManyToOne(type => Category, category => category.restaurants)
    category: Category;
}
