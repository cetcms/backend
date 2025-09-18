// 模拟 chalk 模块以避免在测试环境中出现 ES 模块问题
jest.mock('chalk', () => {
  // 创建一个模拟的 chalk 对象，返回原始字符串
  const mockChalk = new Proxy(
    {},
    {
      get: (target, prop) => {
        if (typeof prop === 'string') {
          // 返回一个函数，该函数接收文本并返回原始文本
          return (text) => text;
        }
        return target[prop];
      },
      apply: (target, thisArg, argumentsList) => {
        // 当作为函数调用时，返回第一个参数（文本）
        return argumentsList[0];
      },
    }
  );

  // 为 chalk 的各种颜色方法返回相同的行为
  return {
    default: mockChalk,
    red: (text) => text,
    green: (text) => text,
    yellow: (text) => text,
    blue: (text) => text,
    magenta: (text) => text,
    cyan: (text) => text,
    white: (text) => text,
    gray: (text) => text,
  };
});

// 模拟 uuid 模块
jest.mock('uuid', () => {
  return {
    v7: jest.fn(() => 'mocked-uuid-v7'),
    // 如果需要其他 uuid 版本也可以添加
    v4: jest.fn(() => 'mocked-uuid-v4'),
    v1: jest.fn(() => 'mocked-uuid-v1'),
  };
});
