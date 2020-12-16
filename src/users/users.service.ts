import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";

import { User } from "./entities/user.entity";
import { CreateAccountDto } from "./dto/create-account.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "../jwt/jwt.service";
import { EditProfileDto } from "./dto/edit-profile.dto";
import { Verification } from "./entities/verification.entity";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        @InjectRepository(Verification) private readonly verifications: Repository<Verification>,
        private readonly jwtService: JwtService
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
            await this.verifications.save(this.verifications.create({
                code: "",
                user,
            }));
            return { ok: true };
        } catch (e) {
            return { ok: false, error: "Couldn't create account" };
        }
    }

    async login({ email, password }: LoginDto): Promise<{ ok: boolean, error?: string; token?: string }> {
        try {
            const user = await this.users.findOne({ email });
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
                error,
            };
        }
    }

    async findById(id: number): Promise<User> {
        return await this.users.findOne(id);
    }

    async editProfile(userId: number, { email, password }: EditProfileDto): Promise<User> {
        const user = await this.users.findOne(userId);

        if (email) {
            user.email = email;
            user.verified = false;
            await this.verifications.save(this.verifications.create({ user }));
        }

        if (password) {
            user.password = password;
        }

        return await this.users.save(user);
    }
}