import { readFileSync } from 'fs';
import fs, { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { getDMMF } from '@prisma/internals';
import { set, get } from 'radash';

export const main = async () => {
  const schema = fs.readFileSync(path.resolve(process.cwd(), 'prisma/schema.prisma'), 'utf-8');
  const dmmf = await getDMMF({ datamodel: schema });
  const { models } = dmmf.datamodel;

  // 动态获取支持的语言
  const i18nDir = path.resolve(process.cwd(), 'src/i18n/translations');
  const languages = readdirSync(i18nDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  let relations = {};
  const translations = {};
  for (const model of models) {
    for (const field of model.fields) {
      if (field.relationName) {
        relations = set(relations, `${model.name}.${field.name}`, field.type);
      }
      for (const lang of languages) {
        const langFilePath = path.resolve(process.cwd(), `src/i18n/translations/${lang}/models.json`);
        if (!translations[langFilePath]) {
          if (existsSync(langFilePath)) {
            const fileContent = readFileSync(langFilePath, 'utf-8') || '{}';
            translations[langFilePath] = JSON.parse(fileContent);
          } else {
            translations[langFilePath] = {};
          }
        }
        if (field.relationName) {
          translations[langFilePath] = set(
            translations[langFilePath],
            `${model.name}._relations.${field.name}`,
            field.type
          );
        } else if (!get(translations[langFilePath], `${model.name}.${field.name}`)) {
          const key = `${model.name}.${field.name}`;
          translations[langFilePath] = set(translations[langFilePath], key, key);
        }
      }
    }
  }
  const relationContent = `export const ModelsRelation = ${JSON.stringify(relations, null, 2)} as const`;
  fs.writeFileSync(path.resolve(process.cwd(), 'src', 'contracts', 'models-relation.contract.ts'), relationContent);
  for (const savePath in translations) {
    fs.writeFileSync(savePath, JSON.stringify(translations[savePath], null, 2));
  }
};

main().then(() => process.exit(0));
