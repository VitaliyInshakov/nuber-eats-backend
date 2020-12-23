import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";
import { Verification } from "./entities/verification.entity";
import { JwtService } from "../jwt/jwt.service";
import { MailService } from "../mail/mail.service";

const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
};

const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

const mockMailService = {
    sendVerification: jest.fn(),
};

describe("UserService", () => {
    let service: UsersService;
    let usersRepository: MockRepository<User>;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository,
                },
                {
                    provide: getRepositoryToken(Verification),
                    useValue: mockRepository,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: MailService,
                    useValue: mockMailService,
                },
            ],
        }).compile();

        service = module.get(UsersService);
        usersRepository = module.get(getRepositoryToken(User));
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createAccount", () => {
        it("should fail if user exists", () => {

        });
    });

    it.todo("login");
    it.todo("findById");
    it.todo("editProfile");
    it.todo("verifyEmail");
});