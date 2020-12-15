import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class CoreEntity {
    @PrimaryGeneratedColumn()
    @Field(type => Number)
    id: number;

    @CreateDateColumn()
    @Field(type => Date)
    createAt: Date;

    @UpdateDateColumn()
    @Field(type => Date)
    updateAt: Date;
}