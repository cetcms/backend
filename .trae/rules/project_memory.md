# 项目记忆记录

[REF] Repository类型系统重构
- 统一所有repository的Input类型定义为具体实体类型
- 为所有CRUD方法添加明确Promise返回类型声明
- 关联文件: admin.repository.ts, admin-company.repository.ts, admin-role.repository.ts, auth.repository.ts, company-role.repository.ts, company-user.repository.ts, company.repository.ts, media-file.repository.ts, media-folder.repository.ts, request-log.repository.ts, user.repository.ts