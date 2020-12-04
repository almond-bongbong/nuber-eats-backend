import { Inject, Injectable } from '@nestjs/common';
import got from 'got';
import * as FormData from 'form-data';
import { CONFIG_OPTIONS } from '../common/constants';
import { MailModuleOptions, MailVar } from './mail.interface';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  private async sendEmail(
    subject: string,
    content: string,
    mailVars: MailVar[],
    to: string,
  ) {
    const form = new FormData();
    form.append('from', `Max from Nuber eats <mailgun@${this.options.domain}>`);
    form.append('to', to);
    form.append('subject', subject);
    // form.append('template', template);
    mailVars.forEach(({ key, value }) => form.append(`v:${key}`, value));
    form.append('html', content);

    try {
      const response = await got(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );

      console.log(response.body);
    } catch (error) {
      console.log(error);
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail(
      'Verify Your Email',
      `Hello, ${email}<br/>Click to http://localhost:3000/confirm?code=${code}`,
      [
        { key: 'username', value: email },
        { key: 'code', value: code },
      ],
      email,
    );
  }
}
