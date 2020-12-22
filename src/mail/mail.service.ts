import { Inject, Injectable } from "@nestjs/common";
import got from "got";
import * as FormData from "form-data";

import { EmailVar, MailModuleOptions } from "./mail.interfaces";
import { CONFIG_OPTIONS } from "../common/common.constants";

@Injectable()
export class MailService {
    constructor(@Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions) {}

    // when get not free account on mailgun, add property 'to' instead of hardcode below
    private async sendEmail(subject: string, template: string, emailVars: EmailVar[]) {
        const form = new FormData();
        form.append("from", `From Nuber Eats <mailgun@${this.options.domain}>`);
        form.append("to", this.options.fromEmail);  // special for dev env, not for prod
        form.append("subject", subject);
        form.append("template", template);

        emailVars.forEach(({ key, value }) => form.append(`v:${key}`, value));

        try {
            const response = await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
                headers: {
                    "Authorization": `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString("base64")}`,
                },
                method: "POST",
                body: form,
            });
            console.log(response.body)
        } catch (e) {
            console.log(e);
        }
    }

    sendVerificationEmail(email: string, code: string) {
        this.sendEmail("Verify Your Email", "verify_email", [
            { key: "code", value: code },
            { key: "username", value: email },
        ]);
    }
}
