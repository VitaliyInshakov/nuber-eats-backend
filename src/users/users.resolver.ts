import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { CreateAccountDto, CreateAccountOutput } from "./dto/create-account.dto";
import { LoginDto, LoginOutput } from "./dto/login.dto";
import { UserProfileDto, UserProfileOutput } from "./dto/user-profile.dto";
import { EditProfileDto, EditProfileOutput } from "./dto/edit-profile.dto";
import { VerifyEmailDto, VerifyEmailOutput } from "./dto/verify-email.dto";

@Resolver(of => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) {}

    @Query(returns => User)
    @Role(["Any"])
    me(@AuthUser() authUser: User) {
        return authUser;
    }

    @Query(returns => UserProfileOutput)
    @Role(["Any"])
    async userProfile(@Args() userProfileDto: UserProfileDto): Promise<UserProfileOutput> {
        return this.usersService.findById(userProfileDto.userId);
    }

    @Mutation(returns => CreateAccountOutput)
    async createAccount(
        @Args("input") createAccountDto: CreateAccountDto,
    ): Promise<CreateAccountOutput> {
        return this.usersService.createAccount(createAccountDto);
    }

    @Mutation(returns => LoginOutput)
    async login(@Args("input") loginDto: LoginDto): Promise<LoginOutput> {
        return this.usersService.login(loginDto);
    }

    @Mutation(returns => EditProfileOutput)
    @Role(["Any"])
    async editProfile(
        @AuthUser() authUser: User,
        @Args("input") editProfileDto: EditProfileDto,
    ): Promise<EditProfileOutput> {
        return this.usersService.editProfile(authUser.id, editProfileDto);
    }

    @Mutation(returns => VerifyEmailOutput)
    async verifyEmail(@Args("input") { code }: VerifyEmailDto): Promise<VerifyEmailOutput> {
        return this.usersService.verifyEmail(code);
    }
}