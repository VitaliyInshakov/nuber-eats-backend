import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { CreateAccountDto, CreateAccountOutput } from "./dto/create-account.dto";
import { LoginDto, LoginOutput } from "./dto/login.dto";
import { AuthGuard } from "../auth/auth.guard";

@Resolver(of => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) {}

    @Query(returns => User)
    @UseGuards(AuthGuard)
    me() {

    }

    @Mutation(returns => CreateAccountOutput)
    async createAccount(
        @Args("input") createAccountDto: CreateAccountDto,
    ): Promise<CreateAccountOutput> {
        try {
            return await this.usersService.createAccount(createAccountDto);
        } catch (error) {
            return {
                ok: false,
                error,
            };
        }
    }

    @Mutation(returns => LoginOutput)
    async login(@Args("input") loginDto: LoginDto): Promise<LoginOutput> {
        try {
            return await this.usersService.login(loginDto);
        } catch (error) {
            return {
                ok: false,
                error,
            };
        }
    }
}