import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import * as jwt from "jsonwebtoken";

import { User } from "./entities/user.entity";
import { CreateAccountDto } from "./dto/create-account.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        private readonly config: ConfigService
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

            await this.users.save(this.users.create({ email, password, role }));
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
                token: jwt.sign({ id: user.id }, this.config.get("TOKEN_SECRET")),
            };
        } catch (error) {
            return {
                ok: false,
                error,
            };
        }
    }
}