import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";

import { User } from "./entities/user.entity";
import { CreateAccountDto } from "./dto/create-account.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "../jwt/jwt.service";
import { EditProfileDto, EditProfileOutput } from "./dto/edit-profile.dto";
import { Verification } from "./entities/verification.entity";
import { VerifyEmailOutput } from "./dto/verify-email.dto";
import { UserProfileOutput } from "./dto/user-profile.dto";
import { MailService } from "../mail/mail.service";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        @InjectRepository(Verification) private readonly verifications: Repository<Verification>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
    ) {}

    async createAccount({
        email,
        password,
        role,
    }: CreateAccountDto): Promise<{ ok: boolean, error?: string }> {
        try {
            const exists = await this.users.findOne({ email });
            if (exists) {
                 return { ok: false, error: "There is a user with that email already" };
            }

            const user = await this.users.save(this.users.create({ email, password, role }));
            const verification = await this.verifications.save(this.verifications.create({
                user,
            }));
            this.mailService.sendVerificationEmail(user.email, verification.code);

            return { ok: true };
        } catch (e) {
            return { ok: false, error: "Couldn't create account" };
        }
    }

    async login({ email, password }: LoginDto): Promise<{ ok: boolean, error?: string; token?: string }> {
        try {
            const user = await this.users.findOne(
                { email },
                { select: ["id", "password"] },
            );
            if (!user) {
                return {
                    ok: false,
                    error: "User not found",
                };
            }

            const passwordCorrect = await user.checkPassword(password);
            if (!passwordCorrect) {
                return {
                    ok: false,
                    error: "Wrong password",
                };
            }

            return {
                ok: true,
                token: this.jwtService.sign(user.id),
            };
        } catch (error) {
            return {
                ok: false,
                error: "Can't log user in",
            };
        }
    }

    async findById(id: number): Promise<UserProfileOutput> {
        try {
            const user = await this.users.findOneOrFail({ id });
            return {
                ok: true,
                user,
            };
        } catch (e) {
            return {
                ok: false,
                error: "User not found",
            };
        }
    }

    async editProfile(userId: number, { email, password }: EditProfileDto): Promise<EditProfileOutput> {
        try {
            const user = await this.users.findOne(userId);
            if (email) {
                user.email = email;
                user.verified = false;
                const verification = await this.verifications.save(this.verifications.create({ user }));
                this.mailService.sendVerificationEmail(user.email, verification.code);
            }

            if (password) {
                user.password = password;
            }
            await this.users.save(user);
            return {
                ok: true,
            };
        } catch (error) {
            return {
                ok: false,
                error: "Couldn't update profile",
            };
        }
    }

    async verifyEmail(code: string): Promise<VerifyEmailOutput> {
        try {
            const verification = await this.verifications.findOne({ code }, { relations: ["user"] });

            if (verification) {
                verification.user.verified = true;
                this.users.save(verification.user);
                await this.verifications.delete(verification.id);
                return {
                    ok: true,
                };
            }

           return {
                ok: false,
               error: "Verification not found",
           };
        } catch (error) {
            return {
                ok: false,
                error,
            };
        }
    }
}