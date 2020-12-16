import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";
import { join } from "path";

import { UsersModule } from "./users/users.module";
import { User } from "./users/entities/user.entity";
import { JwtModule } from "./jwt/jwt.module";
import { JwtMiddleware } from "./jwt/jwt.middleware";
import { Verification } from "./users/entities/verification.entity";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ".env",
            validationSchema: Joi.object({
                NODE_ENV: Joi.string().valid("development", "production").required(),
                DB_HOST: Joi.string().required(),
                DB_PORT: Joi.string().required(),
                DB_USERNAME: Joi.string().required(),
                DB_PASSWORD: Joi.string().required(),
                DB_NAME: Joi.string().required(),
                TOKEN_SECRET: Joi.string().required(),
            }),
        }),
        GraphQLModule.forRoot({
            autoSchemaFile: join(process.cwd(), "src/schema.gql"),
            context: ({ req }) => ({ user: req["user"] }),
        }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: process.env.NODE_ENV !== "production",
            logging: true,
            entities: [User, Verification],
        }),
        JwtModule.forRoot({
            privateKey:  process.env.TOKEN_SECRET,
        }),
        UsersModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): any {
        consumer.apply(JwtMiddleware).forRoutes({
            path: "/graphql",
            method: RequestMethod.POST,
        });
    }
}
