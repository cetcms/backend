import { readFileSync } from 'fs';
import fs, { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { getDMMF } from '@prisma/internals';
import { set, get } from 'radash';

export const main = async () => {
  const schema = fs.readFileSync(path.resolve(process.cwd(), 'prisma/schema.prisma'), 'utf-8');
  const dmmf = await getDMMF({ datamodel: schema });
  const { models } = dmmf.datamodel;
  const enums: Array<{ name: string; values: readonly string[] }> =
    dmmf.schema.enumTypes.model?.flatMap((v) => ({
      name: v.name,
      values: v.values,
    })) || [];
  const enumsMap: Record<string, string[]> = enums.reduce((res: any, v) => {
    res[v.name] = v.values;
    return res;
  }, {});

  // 动态获取支持的语言
  const i18nDir = path.resolve(process.cwd(), 'src/i18n/translations');
  const languages = readdirSync(i18nDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  let relations = {};
  const translations = {};
  for (const model of models) {
    for (const field of model.fields) {
      const fieldType = field.type;
      const fieldName = field.name;
      const modelName = model.name;
      const key = `${modelName}.${fieldName}`;
      if (field.relationName) {
        relations = set(relations, key, fieldType);
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
        if (field.kind === 'enum') {
          if (enumsMap[fieldType]) {
            enumsMap[fieldType].forEach((enumValue) => {
              const enumKey = `enum.${fieldType}.${enumValue}`;
              if (!get(translations[langFilePath], enumKey)) {
                translations[langFilePath] = set(translations[langFilePath], enumKey, enumValue);
              }
            });
          }
          translations[langFilePath] = set(translations[langFilePath], `${modelName}._enums.${fieldName}`, fieldType);
        }
        if (!get(translations[langFilePath], key)) {
          translations[langFilePath] = set(translations[langFilePath], key, key);
        }
        if (field.relationName) {
          translations[langFilePath] = set(
            translations[langFilePath],
            `${modelName}._relations.${fieldName}`,
            fieldType
          );
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
