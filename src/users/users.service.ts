import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";

import { User } from "./entities/user.entity";
import { CreateAccountDto } from "./dto/create-account.dto";

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

    async createAccount({
        email,
        password,
        role,
    }: CreateAccountDto): Promise<string | undefined> {
        try {
            const exists = await this.users.findOne({ email });
            if (exists) {
                 return "There is a user with that email already";
            }

            await this.users.save(this.users.create({ email, password, role }));
        } catch (e) {
            return "Couldn't create account";
        }
    }
}