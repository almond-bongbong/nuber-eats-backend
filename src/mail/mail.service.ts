import { Inject, Injectable } from '@nestjs/common';
import got from 'got';
import * as FormData from 'form-data';
import { CONFIG_OPTIONS } from '../common/constants';
import { MailModuleOptions } from './mail.interface';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    console.log(options);
    this.sendEmail('test', 'content', 'dlcndaks12@naver.com');
  }

  private async sendEmail(subject: string, template: string, to: string) {
    const form = new FormData();
    form.append('from', `Excited User <mailgun@${this.options.domain}>`);
    form.append('to', to);
    form.append('subject', subject);
    // form.append('text', content);
    form.append('template', template);
    form.append('v:username', 'max');
    form.append('v:code', '1234');

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
}
