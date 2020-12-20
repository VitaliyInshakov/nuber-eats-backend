import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { CreateAccountDto, CreateAccountOutput } from "./dto/create-account.dto";
import { LoginDto, LoginOutput } from "./dto/login.dto";
import { AuthGuard } from "../auth/auth.guard";
import { AuthUser } from "../auth/auth-user.decorator";
import { UserProfileDto, UserProfileOutput } from "./dto/user-profile.dto";
import { EditProfileDto, EditProfileOutput } from "./dto/edit-profile.dto";
import { VerifyEmailDto, VerifyEmailOutput } from "./dto/verify-email.dto";

@Resolver(of => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) {}

    @Query(returns => User)
    @UseGuards(AuthGuard)
    me(@AuthUser() authUser: User) {
        return authUser;
    }

    @Query(returns => UserProfileOutput)
    @UseGuards(AuthGuard)
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
    @UseGuards(AuthGuard)
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