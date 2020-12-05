import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { CreateAccountDto, CreateAccountOutput } from "./dto/create-account.dto";

@Resolver(of => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) {}

    @Mutation(returns => CreateAccountOutput)
    async createAccount(
        @Args("input") createAccountDto: CreateAccountDto,
    ): Promise<CreateAccountOutput> {
        try {
            const error = await this.usersService.createAccount(createAccountDto);
            if (error) {
                return {
                    ok: false,
                    error,
                };
            }
            return {
                ok: true,
            };
        } catch (error) {
            return {
                ok: false,
                error,
            };
        }
    }
}