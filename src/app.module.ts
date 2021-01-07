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
import { MailModule } from './mail/mail.module';
import { Restaurant } from "./restaurants/entities/restaurants.entity";
import { Category } from "./restaurants/entities/category.entity";
import { RestaurantsModule } from "./restaurants/restaurants.module";
import { AuthModule } from "./auth/auth.module";
import { Dish } from "./restaurants/entities/dish.entity";
import { OrdersModule } from "./orders/orders.module";
import { Order } from "./orders/entities/order.entity";
import { OrderItem } from "./orders/entities/order-item.entity";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
            validationSchema: Joi.object({
                NODE_ENV: Joi.string().valid("development", "production", "test").required(),
                DB_HOST: Joi.string().required(),
                DB_PORT: Joi.string().required(),
                DB_USERNAME: Joi.string().required(),
                DB_PASSWORD: Joi.string().required(),
                DB_NAME: Joi.string().required(),
                TOKEN_SECRET: Joi.string().required(),
            }),
        }),
        GraphQLModule.forRoot({
            installSubscriptionHandlers: true,
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
            logging: process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test",
            entities: [User, Verification, Restaurant, Category, Dish, Order, OrderItem],
        }),
        JwtModule.forRoot({
            privateKey:  process.env.TOKEN_SECRET,
        }),
        MailModule.forRoot({
            apiKey: process.env.MAILGUN_API_KEY,
            domain: process.env.MAILGUN_DOMAIN,
            fromEmail: process.env.MAILGUN_FROM_EMAIL,
        }),
        AuthModule,
        UsersModule,
        RestaurantsModule,
        OrdersModule,
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
