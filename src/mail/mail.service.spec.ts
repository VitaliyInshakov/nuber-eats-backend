import { Test } from "@nestjs/testing";
import * as FormData from "form-data";
import got from "got";

import { MailService } from "./mail.service";
import { CONFIG_OPTIONS } from "../common/common.constants";

const TEST_DOMAIN = "test_domain";

jest.mock("got");
jest.mock("form-data");

describe("MailService", () => {
    let service: MailService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                MailService,
                {
                    provide: CONFIG_OPTIONS,
                    useValue: {
                        apiKey: "test_apiKey",
                        domain: TEST_DOMAIN,
                        fromEmail: "test_fromEmail",
                    },
                },
            ],
        }).compile();

        service = module.get(MailService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("sendVerificationEmail", () => {
        it("should call sendEmail", () => {
            const sendVerificationEmailArgs = {
                email: "email",
                code: "code",
            };

            jest.spyOn(service, "sendEmail").mockImplementation(async () => true);
            service.sendVerificationEmail(sendVerificationEmailArgs.email, sendVerificationEmailArgs.code);
            expect(service.sendEmail).toHaveBeenCalledTimes(1);
            expect(service.sendEmail).toHaveBeenCalledWith("Verify Your Email", "verify_email", [
                { key: "code", value: sendVerificationEmailArgs.code },
                { key: "username", value: sendVerificationEmailArgs.email },
            ]);
        });
    });

    describe("sendEmail", () => {
        it("sends email", async () => {
            const result = await service.sendEmail("", "", []);
            const formSpy = jest.spyOn(FormData.prototype, "append");
            expect(formSpy).toHaveBeenCalled();
            expect(got.post).toHaveBeenCalledTimes(1);
            expect(got.post).toHaveBeenCalledWith(
                `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
                expect.any(Object),
            );
            expect(result).toEqual(true);
        });

        it("should fail on error", async () => {
            jest.spyOn(got, "post").mockImplementation(() => {
                throw new Error();
            });
            const result = await service.sendEmail("", "", []);
            expect(result).toEqual(false);
        });
    });
});