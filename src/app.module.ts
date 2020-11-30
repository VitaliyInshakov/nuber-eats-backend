import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";

import { RestaurantsModule } from "./restaurants/restaurants.module";

@Module({
    imports: [
        GraphQLModule.forRoot({
            autoSchemaFile: join(process.cwd(), "src/schema.gql"),
        }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: "localhost",
            port: 5432,
            username: "postgres",
            password: "postgres",
            database: "nuber-eats",
            synchronize: true,
            logging: true,
        }),
        RestaurantsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
