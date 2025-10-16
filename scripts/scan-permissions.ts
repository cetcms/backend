import { readFileSync, existsSync, writeFileSync, readdirSync } from 'fs';
import * as path from 'node:path';
import process from 'process';

import { Logger } from '@nestjs/common';
import { get, set } from 'radash';
import { PermissionItem } from 'src/auth/graphql';
import { PermissionAliasHandler } from 'src/common/handlers';
import { Client } from 'src/generated/graphql';
import { Project, SyntaxKind, VariableDeclarationKind } from 'ts-morph';
import voca from 'voca';

const logger = new Logger('ScanPermissionsScript');

const main = async () => {
  // 初始化 ts-morph 项目
  const project = new Project({
    tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
  });

  // 添加源文件
  project.addSourceFilesAtPaths('src/**/*.ts');

  const permissions: PermissionItem[] = [];
  const contextRecords: Record<string, boolean> = {};

  // 遍历所有源文件
  for (const sourceFile of project.getSourceFiles()) {
    // 查找所有类声明
    sourceFile.getClasses().forEach((classDeclaration) => {
      // 获取类名
      const className = classDeclaration.getName();
      const classDocs = classDeclaration.getJsDocs();
      // 获取类注释
      const classComment = classDocs.map((doc) => doc.getCommentText()).join('\n') || 'unknown';
      // 获取 @group 标识信息
      const classGroupTag = classDocs.flatMap((doc) => doc.getTags()).find((tag) => tag.getTagName() === 'group');
      const classGroup = voca.capitalize(
        voca.camelCase(voca.trim(classGroupTag ? classGroupTag.getCommentText() : 'unknown'))
      );

      // 遍历类中的所有方法
      classDeclaration.getMethods().forEach((method) => {
        // 查找 @UsePermission 装饰器
        const permissionDecorator = method.getDecorator('UsePermission');
        if (permissionDecorator) {
          let attrs: Client[] = [];
          const args = permissionDecorator.getArguments();
          const arrayArg = args[0]?.asKind(SyntaxKind.ArrayLiteralExpression);
          if (arrayArg) {
            attrs = arrayArg.getElements().map((el) => {
              return el.getText() as Client;
            });
          }

          const methodName = method.getName();
          const methodComment =
            method
              .getJsDocs()
              .map((doc) => doc.getCommentText())
              .join('\n') || 'unknown';

          // 校验权限定义是否重复
          const alias = PermissionAliasHandler(className || 'Unknown', methodName);
          const context = `${className}.${method.getName()}`;
          if (contextRecords[alias.name]) {
            throw new Error(`Duplicate permission definition: ${JSON.stringify(alias)}`);
          }
          contextRecords[context] = true;

          permissions.push({
            name: alias.name,
            subject: className || 'Unknown',
            subjectLabel: classComment,
            group: classGroup,
            action: methodName,
            actionLabel: methodComment,
            clients: attrs,
          });
        }
      });
    });
  }

  // 使用 ts-morph 创建输出文件
  const outputDir = path.join(process.cwd(), 'src', 'generated');
  project.createDirectory(outputDir);
  const outputPath = path.join(outputDir, 'permissions.ts');

  // 检查文件是否已存在，如果存在则删除
  const existingFile = project.getSourceFile(outputPath);
  if (existingFile) {
    existingFile.delete();
  }

  // 创建新的源文件
  const sourceFile = project.createSourceFile(outputPath, '', { overwrite: true });

  // 添加导入语句
  sourceFile.addImportDeclaration({
    moduleSpecifier: 'src/auth/graphql',
    namedImports: ['PermissionItem'],
  });
  sourceFile.addImportDeclaration({
    moduleSpecifier: 'src/generated/graphql',
    namedImports: ['Client'],
  });

  // 创建权限常量声明，使用 Writer 以生成枚举引用而不是字符串
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: 'Permissions',
        type: 'PermissionItem[]',
        initializer: (writer) => {
          writer.write('[').newLine();
          permissions.forEach((p, idx) => {
            writer.write('  {').newLine();
            writer.write(`    name: ${JSON.stringify(p.name)},`).newLine();
            writer.write(`    subject: ${JSON.stringify(p.subject)},`).newLine();
            writer.write(`    subjectLabel: ${JSON.stringify(p.subjectLabel)},`).newLine();
            writer.write(`    group: ${JSON.stringify(p.group)},`).newLine();
            writer.write(`    action: ${JSON.stringify(p.action)},`).newLine();
            writer.write(`    actionLabel: ${JSON.stringify(p.actionLabel)},`).newLine();
            writer.write('    clients: [');
            p.clients.forEach((t, i) => {
              // t 是诸如 "Client.Admin" 的代码片段文本
              writer.write(String(t));
              if (i < p.clients.length - 1) writer.write(', ');
            });
            writer.write('],').newLine();
            writer.write('  }');
            if (idx < permissions.length - 1) writer.write(',');
            writer.newLine();
          });
          writer.write(']');
        },
      },
    ],
  });

  // 添加权限文件的别名生成
  sourceFile.addEnum({
    name: 'PermissionAlias',
    isExported: true,
    members: permissions.map((p) => PermissionAliasHandler(p.subject, p.action)),
  });

  // 先格式化再保存
  sourceFile.formatText();
  await sourceFile.save();

  logger.log(`权限信息已写入到: ${outputPath}`);
  logger.log(`共扫描到 ${permissions.length} 个权限定义`);

  // 生成权限的国际化文件
  generatePermissionI18n(permissions);

  logger.log('Permissions scan complete');
};

/**
 * 生成权限相关的国际化文件
 * @param permissions 权限列表
 */
const generatePermissionI18n = (permissions: PermissionItem[]) => {
  // 动态获取支持的语言
  const i18nDir = path.resolve(process.cwd(), 'src/i18n/translations');
  const languages = readdirSync(i18nDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  // 初始化翻译对象
  const translations: Record<string, any> = {};

  // 为每种语言处理权限翻译
  for (const lang of languages) {
    const permissionFilePath = path.resolve(process.cwd(), `src/i18n/translations/${lang}/permissions.json`);

    // 读取现有的翻译文件或创建空对象
    if (!translations[permissionFilePath]) {
      if (existsSync(permissionFilePath)) {
        const fileContent = readFileSync(permissionFilePath, 'utf-8') || '{}';
        translations[permissionFilePath] = JSON.parse(fileContent);
      } else {
        translations[permissionFilePath] = {};
      }
    }

    for (const permission of permissions) {
      const groupKey = `group.${permission.group}`;
      const subjectKey = `subject.${permission.subject}`;
      const actionKey = `action.${permission.subject}.${permission.action}`;

      if (!get(translations[permissionFilePath], groupKey)) {
        translations[permissionFilePath] = set(translations[permissionFilePath], groupKey, permission.group);
      }
      if (!get(translations[permissionFilePath], subjectKey)) {
        translations[permissionFilePath] = set(
          translations[permissionFilePath],
          subjectKey,
          permission.subjectLabel || permission.subject
        );
      }
      if (!get(translations[permissionFilePath], actionKey)) {
        translations[permissionFilePath] = set(
          translations[permissionFilePath],
          actionKey,
          permission.actionLabel || permission.action
        );
      }

      if (lang === 'zh') {
        translations[permissionFilePath] = set(
          translations[permissionFilePath],
          subjectKey,
          permission.subjectLabel || permission.subject
        );
        translations[permissionFilePath] = set(
          translations[permissionFilePath],
          actionKey,
          permission.actionLabel || permission.action
        );
      }
    }

    // 写入文件
    writeFileSync(permissionFilePath, JSON.stringify(translations[permissionFilePath], null, 2));
    logger.log(`权限国际化文件已生成: ${permissionFilePath}`);
  }
};

main()
  .then(() => {
    logger.log('Running in external script mode');
  })
  .catch((err) => {
    console.error(err);
  });
