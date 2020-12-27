import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { AppModule } from "../src/app.module";

jest.mock("got", () => {
    return {
        post: jest.fn(),
    };
});

const GRAPHQL_ENDPONT = "/graphql";

describe("UsersModule (e2e)", () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = module.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await getConnection().dropDatabase();
        await app.close();
    });

    describe("createAccount", () => {
        it("should create account", () => {
            return request(app.getHttpServer())
                .post(GRAPHQL_ENDPONT)
                .send({
                    query: `
                    mutation {
                        createAccount(input: {
                            email: "test_user@mail.com",
                            password: "12345",
                            role: Owner,
                        }) {
                            ok
                            error
                        }
                    }
                    `
                })
                .expect(200)
                .expect(res => {
                    expect(res.body.data.createAccount.ok).toBe(true);
                    expect(res.body.data.createAccount.error).toBe(null);
                });
        });

        it("should fail if account already exists", () => {
            return request(app.getHttpServer())
                .post(GRAPHQL_ENDPONT)
                .send({
                    query: `
                    mutation {
                        createAccount(input: {
                            email: "test_user@mail.com",
                            password: "12345",
                            role: Owner,
                        }) {
                            ok
                            error
                        }
                    }
                    `
                })
                .expect(200)
                .expect(res => {
                    expect(res.body.data.createAccount.ok).toBe(false);
                    expect(res.body.data.createAccount.error).toEqual(expect.any(String));
                });
        });
    });

    it.todo("userProfile");
    it.todo("login");
    it.todo("me");
    it.todo("editProfile");
    it.todo("verifyEmail");
});
