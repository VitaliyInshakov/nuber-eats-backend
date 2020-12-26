import { Inject, Injectable } from "@nestjs/common";
import got from "got";
import * as FormData from "form-data";

import { EmailVar, MailModuleOptions } from "./mail.interfaces";
import { CONFIG_OPTIONS } from "../common/common.constants";

@Injectable()
export class MailService {
    constructor(@Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions) {}

    // when get not free account on mailgun, add property 'to' instead of hardcode below
    async sendEmail(subject: string, template: string, emailVars: EmailVar[]): Promise<boolean> {
        const form = new FormData();
        form.append("from", `From Nuber Eats <mailgun@${this.options.domain}>`);
        form.append("to", this.options.fromEmail);  // special for dev env, not for prod
        form.append("subject", subject);
        form.append("template", template);

        emailVars.forEach(({ key, value }) => form.append(`v:${key}`, value));

        try {
            await got.post(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
                headers: {
                    "Authorization": `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString("base64")}`,
                },
                body: form,
            });

            return true;
        } catch (e) {
            return false;
        }
    }

    sendVerificationEmail(email: string, code: string) {
        this.sendEmail("Verify Your Email", "verify_email", [
            { key: "code", value: code },
            { key: "username", value: email },
        ]);
    }
}
