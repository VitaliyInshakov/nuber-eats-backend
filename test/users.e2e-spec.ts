import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as request from "supertest";
import { getConnection, Repository } from "typeorm";
import { AppModule } from "../src/app.module";
import { User } from "../src/users/entities/user.entity";
import { Verification } from "../src/users/entities/verification.entity";

jest.mock("got", () => {
    return {
        post: jest.fn(),
    };
});

const GRAPHQL_ENDPOINT = "/graphql";
const testUser = {
    email: "test_user@mail.com",
    password: "12345",
};

describe("UsersModule (e2e)", () => {
    let app: INestApplication;
    let usersRepository: Repository<User>;
    let verificationsRepository: Repository<Verification>;
    let jwtToken: string;

    const baseTestRequest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
    const publicTestRequest = (query: string) => baseTestRequest().send({ query });
    const privateTestRequest = (query: string) => baseTestRequest().set("X-JWT", jwtToken).send({ query });

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = module.createNestApplication();
        usersRepository = module.get(getRepositoryToken(User));
        verificationsRepository = module.get(getRepositoryToken(Verification));
        await app.init();
    });

    afterAll(async () => {
        await getConnection().dropDatabase();
        await app.close();
    });

    describe("createAccount", () => {
        it("should create account", () => {
            return publicTestRequest(`
                mutation {
                    createAccount(input: {
                        email: "${testUser.email}",
                        password: "${testUser.password}",
                        role: Owner,
                    }) {
                        ok
                        error
                    }
                }
            `)
            .expect(200)
            .expect(res => {
                expect(res.body.data.createAccount.ok).toBe(true);
                expect(res.body.data.createAccount.error).toBe(null);
            });
        });

        it("should fail if account already exists", () => {
            return publicTestRequest(`
                mutation {
                    createAccount(input: {
                        email: "${testUser.email}",
                        password: "${testUser.password}",
                        role: Owner,
                    }) {
                        ok
                        error
                    }
                }
            `)
            .expect(200)
            .expect(res => {
                expect(res.body.data.createAccount.ok).toBe(false);
                expect(res.body.data.createAccount.error).toEqual(expect.any(String));
            });
        });
    });

    describe("login", () => {
        it("should login with correct credentials", () => {
            return publicTestRequest(`
                mutation {
                    login(input: {
                        email: "${testUser.email}",
                        password: "${testUser.password}",
                    }) {
                        ok
                        error
                        token
                    }
                }
            `)
            .expect(200)
            .expect(res => {
                const { body: { data: { login } } } = res;
                expect(login.ok).toBe(true);
                expect(login.error).toBe(null);
                expect(login.token).toEqual(expect.any(String));
                jwtToken = login.token;
            });
        });

        it("should not be able to login with wrong credentials", () => {
            return publicTestRequest(`
                mutation {
                    login(input: {
                        email: "${testUser.email}",
                        password: "xxx",
                    }) {
                        ok
                        error
                        token
                    }
                }
            `)
            .expect(200)
            .expect(res => {
                const { body: { data: { login } } } = res;
                expect(login.ok).toBe(false);
                expect(login.error).toBe("Wrong password");
                expect(login.token).toBe(null);
            });
        });
    });

    describe("userProfile", () => {
        let userId: number;

        beforeAll(async () => {
            const [user] = await usersRepository.find();
            userId = user.id;
        });

        it("should see a user profile", () => {
            return privateTestRequest(`
                {
                    userProfile(userId: ${userId}) {
                        ok
                        error
                        user {
                            id
                        }
                    }
                }
            `)
            .expect(200)
            .expect(res => {
                const { body: { data: { userProfile: { ok, error, user: { id } } } } } = res;
                expect(ok).toBe(true);
                expect(error).toBe(null);
                expect(id).toBe(userId);
            });
        });

        it("should not found a profile", () => {
            return privateTestRequest(`
                {
                    userProfile(userId: 66) {
                        ok
                        error
                        user {
                            id
                        }
                    }
                }
            `)
            .expect(200)
            .expect(res => {
                const { body: { data: { userProfile: { ok, error, user } } } } = res;
                expect(ok).toBe(false);
                expect(error).toBe("User not found");
                expect(user).toBe(null);
            });
        });
    });

    describe("me", () => {
        it("should find my profile", () => {
            return privateTestRequest(`
                {
                    me {
                        email
                    }
                }
            `)
            .expect(200)
            .expect(res => {
                const { body: { data: { me: { email } } } } = res;
                expect(email).toBe(testUser.email);
            });
        });

        it("should not allow logged out user", () => {
            return publicTestRequest(`
                {
                    me {
                        email
                    }
                }
            `)
            .expect(200)
            .expect(res => {
                const { body: { errors: [error] } } = res;
                expect(error.message).toBe("Forbidden resource");
            });
        });
    });

    describe("editProfile", () => {
        const NEW_EMAIL = "test_user+1@mail.com";
        it("should change email", () => {
            return privateTestRequest(`
                mutation {
                    editProfile(input: {
                        email: "${NEW_EMAIL}"
                    }) {
                        ok
                        error
                    }
                }
            `)
            .expect(200)
            .expect(res => {
                const { body: { data: { editProfile: { ok, error } } } } = res;
                expect(ok).toBe(true);
                expect(error).toBe(null);
            });
        });

        it("should have new email", () => {
            return privateTestRequest(`
                {
                    me {
                        email
                    }
                }
            `)
            .expect(200)
            .expect(res => {
                const { body: { data: { me: { email } } } } = res;
                expect(email).toBe(NEW_EMAIL);
            });
        });
    });

    describe("verifyEmail", () => {
        let verificationCode: string;

        beforeAll(async () => {
            const [verification] = await verificationsRepository.find();
            verificationCode = verification.code;
        });

        it("should verify email", () => {
            return publicTestRequest(`
                mutation {
                    verifyEmail(input: {
                        code: "${verificationCode}"
                    }) {
                        ok
                        error
                    }
                }
            `)
            .expect(200)
            .expect(res => {
                const { body: { data: { verifyEmail: { ok, error } } } } = res;
                expect(ok).toBe(true);
                expect(error).toBe(null);
            });
        });

        it("should fail on wrong verification code", () => {
            return publicTestRequest(`
                mutation {
                    verifyEmail(input: {
                        code: "wrong_code"
                    }) {
                        ok
                        error
                    }
                }
            `)
            .expect(200)
            .expect(res => {
                const { body: { data: { verifyEmail: { ok, error } } } } = res;
                expect(ok).toBe(false);
                expect(error).toBe("Verification not found");
            });
        });
    });
});
