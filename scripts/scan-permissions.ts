import * as path from 'node:path';
import process from 'process';

import { Logger } from '@nestjs/common';
import { PermissionInfo } from 'src/auth/graphql';
import { Target } from 'src/generated/graphql/prisma';
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

  const permissions: PermissionInfo[] = [];
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
      // 获取 @module 标识信息
      const classModuleTag = classDocs.flatMap((doc) => doc.getTags()).find((tag) => tag.getTagName() === 'module');
      const classModule = voca.trim(classModuleTag ? classModuleTag.getCommentText() : 'unknown').toLowerCase();

      // 遍历类中的所有方法
      classDeclaration.getMethods().forEach((method) => {
        // 查找 @UsePermission 装饰器
        const permissionDecorator = method.getDecorator('UsePermission');
        if (permissionDecorator) {
          let attrs: Target[] = [];
          const args = permissionDecorator.getArguments();
          const arrayArg = args[0]?.asKind(SyntaxKind.ArrayLiteralExpression);
          if (arrayArg) {
            attrs = arrayArg.getElements().map((el) => {
              return el.getText() as Target;
            });
          }

          const methodComment =
            method
              .getJsDocs()
              .map((doc) => doc.getCommentText())
              .join('\n') || 'unknown';

          // 校验权限定义是否重复
          const context = `${className}.${method.getName()}`;
          if (contextRecords[context]) {
            throw new Error(`Duplicate permission definition: ${context}`);
          }
          contextRecords[context] = true;

          permissions.push({
            subject: className || 'Unknown',
            subjectLabel: classComment,
            module: classModule,
            action: method.getName(),
            actionLabel: methodComment,
            targets: attrs,
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
    namedImports: ['PermissionInfo'],
  });
  sourceFile.addImportDeclaration({
    moduleSpecifier: 'src/generated/graphql',
    namedImports: ['Target'],
  });

  // 创建权限常量声明，使用 Writer 以生成枚举引用而不是字符串
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: 'Permissions',
        type: 'PermissionInfo[]',
        initializer: (writer) => {
          writer.write('[').newLine();
          permissions.forEach((p, idx) => {
            writer.write('  {').newLine();
            writer.write(`    subject: ${JSON.stringify(p.subject)},`).newLine();
            writer.write(`    subjectLabel: ${JSON.stringify(p.subjectLabel)},`).newLine();
            writer.write(`    module: ${JSON.stringify(p.module)},`).newLine();
            writer.write(`    action: ${JSON.stringify(p.action)},`).newLine();
            writer.write(`    actionLabel: ${JSON.stringify(p.actionLabel)},`).newLine();
            writer.write('    targets: [');
            p.targets.forEach((t, i) => {
              // t 是诸如 "Target.Admin" 的代码片段文本
              writer.write(String(t));
              if (i < p.targets.length - 1) writer.write(', ');
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

  // 先格式化再保存
  sourceFile.formatText();
  await sourceFile.save();

  logger.log(`权限信息已写入到: ${outputPath}`);
  logger.log(`共扫描到 ${permissions.length} 个权限定义`);
  logger.log('Permissions scan complete');
};

main()
  .then(() => {
    logger.log('Running in external script mode');
  })
  .catch((err) => {
    console.error(err);
  });
