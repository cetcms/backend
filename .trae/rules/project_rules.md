## 项目记忆
### 规则
- 项目记忆记录储存在项目根目录下的 .trae/rules/project_memory.md 文件中
- 每次分析/修改后必须生成并更新项目记忆记录
- 在以下场景载入记忆记录辅助工作：
    - 分析代码时
    - 修复问题时
    - 新增功能时
    - 优化性能时
    - 代码重构时
- 使用极简缩写格式节省 token
- 只记录核心逻辑和关键变更
- 记忆记录只包含必要信息，避免冗余

### 记忆格式
[类型标识] 主题
- 修改摘要 (1行)
- 分析结论 (1行)
- 关联文件: file1, file2
- 后续建议: (可选)

### 类型标识
- `[FIX]` 问题修复
- `[OPT]` 性能优化  
- `[REF]` 代码重构
- `[ADD]` 功能添加
- `[ANAL]` 分析结论

### 示例
[FIX] 数组越界异常
- 添加边界检查 guard clause
- 未处理空数组导致崩溃
- 关联文件: utils.js
- 后续建议: 增加单元测试覆盖边界情况


### 全局要求
- 每条记录不超过 5 行
- 使用英文缩写 (如: fn→function, var→variable)
- 避免完整句子，用关键词描述
- 优先级: 原因 > 方案 > 细节


## 作者信息
 - 邮箱：oyhemail@163.com
 - 作者：imoyh

## 包管理方式
 - JS/TS 项目使用 pnpm 进行管理
 - Python 项目使用 uv 进行管理
 - 请勿直接修改 package.json 或 pyproject.toml 文件
 - 请勿直接修改 requirements.txt 文件
 - 请勿直接修改 package-lock.json 文件
 - 请勿直接修改 uv.lock 文件
 - 请勿直接修改 node_modules 目录
 - 请勿直接修改 .venv 目录

 ## 代码规范
 - 代码注释：使用 JSDoc 注释，注释内容请用中文
 - JS/TS 项目请严格遵循 [ESLint](https://eslint.org/) 规范
 - Python 项目请严格遵循 [Black](https://black.readthedocs.io/en/stable/) 规范

 ## 代码提交
 - 代码提交请使用 git 进行管理
 - 代码提交请使用 feat: 或 fix: 等前缀
 - 代码提交请使用中文描述
 - 代码提交描述格式：
    - 第一行：使用 feat: 或 fix: 等前缀列出代码提交标题
    - 第二行：空行
    - 第三行：使用中文描述代码提交内容
    - 第四行：空行
    - 第五行：使用无序列表格式描述代码提交内容详情
