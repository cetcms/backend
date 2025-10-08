import * as fs from 'node:fs';
import * as path from 'node:path';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import acceptLanguage from 'accept-language';
import { Request } from 'express';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { ConfigService } from 'src/config/config.service';
import voca from 'voca';

@Injectable()
export class I18nService implements OnModuleInit {
  protected namespace: string;
  private readonly i18n = i18next;
  private readonly logger = new Logger(I18nService.name);
  private callbackLanguages = {
    zh: ['zh-hans', 'zh-sg', 'cn', 'chinese'],
    zhHant: ['zh-hant', 'zh-hk', 'zh-tw', 'zh-ms', 'tw', 'hk'],
  };

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const { defaultLocaleLang, defaultLocaleNs } = this.config.getAppConfig();
    const { languages, namespaces } = this.translationParams();
    acceptLanguage.languages([...languages, ...Object.values(this.callbackLanguages).flat()]);
    await this.i18n.use(Backend).init({
      debug: false,
      ns: namespaces,
      cleanCode: true,
      lowerCaseLng: true,
      saveMissing: true,
      preload: languages,
      defaultNS: defaultLocaleNs,
      fallbackNS: defaultLocaleNs,
      fallbackLng: defaultLocaleLang,
      backend: {
        loadPath: path.resolve(__dirname, 'translations', '{{lng}}', '{{ns}}.json'),
        addPath: path.resolve('src', 'i18n', 'translations', '{{lng}}', '{{ns}}.missing.json'),
      },
    });

    this.logger.log(`Initialized with languages: ${languages.join(', ')}`);
  }

  private translationParams() {
    const { defaultLocaleLang } = this.config.getAppConfig();
    const transDir = path.resolve(__dirname, 'translations');
    const langDir = path.resolve(transDir, defaultLocaleLang);
    const languages = fs.readdirSync(transDir, { withFileTypes: true });
    const namespaces = fs.readdirSync(langDir, { withFileTypes: true });
    const result = {
      languages: languages
        .filter((d) => d.isDirectory())
        .map((d) => d.name.split('.').shift())
        .filter((v) => !!v) as string[],
      namespaces: namespaces
        .filter((d) => d.isFile())
        .map((d) => d.name.split('.').shift())
        .filter((v) => !!v) as string[],
    };
    result.languages = [...new Set(result.languages)];
    result.namespaces = [...new Set(result.namespaces)];
    return result;
  }

  private parseLanguage(lng: string) {
    const key = Object.keys(this.callbackLanguages).find((key) => {
      const languages = this.callbackLanguages[key];
      if (Array.isArray(languages)) {
        return languages?.includes(voca.kebabCase(lng).toLowerCase());
      } else {
        return Boolean(this.callbackLanguages[voca.camelCase(lng)]);
      }
    });
    if (key) lng = voca.kebabCase(key);
    return lng.toLowerCase();
  }

  currentLanguage() {
    return this.i18n.language;
  }

  changeLanguage(lng: string) {
    lng = this.parseLanguage(lng);
    return this.i18n.changeLanguage(lng);
  }

  requestLanguage(req: Request) {
    const query = new Object(req.query);
    const { defaultLocaleLang } = this.config.getAppConfig();
    const { headers } = req;
    const language =
      query['language'] ||
      query['lang'] ||
      query['locale'] ||
      headers['x-language'] ||
      headers['x-languages'] ||
      headers['x-lang'] ||
      headers['x-locale'] ||
      headers['x-locales'] ||
      headers['accept-language'] ||
      headers['accept-languages'];
    return acceptLanguage.get(Array.isArray(language) ? language.join(',') : language) || defaultLocaleLang;
  }

  all(ns?: string, lng?: string) {
    const { defaultLocaleNs } = this.config.getAppConfig();
    if (!lng) lng = this.currentLanguage();
    if (!ns) ns = defaultLocaleNs;
    return this.i18n.getResourceBundle(lng, ns);
  }

  getI18n() {
    return this.i18n;
  }

  async useTranslation(ns?: string | string[], lng?: string) {
    const i18n = this.getI18n();
    if (lng) {
      lng = this.parseLanguage(lng);
      await i18n.changeLanguage(lng);
    }
    if (ns) i18n.setDefaultNamespace(ns);
    return i18n;
  }
}
