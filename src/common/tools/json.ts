import MaskData from 'maskdata';

/**
 * 深度克隆对象
 * 通过序列化和反序列化实现对象的深拷贝
 * @template T - 返回对象的类型
 * @param object - 需要克隆的对象
 * @returns 克隆后的新对象
 */
export function JsonClone<T = any>(object: any): T {
  return JsonParse(JsonStringify(object));
}

/**
 * 解析 JSON 字符串
 * 将 JSON 字符串转换为 JavaScript 对象
 * @template T - 返回对象的类型
 * @param string - 需要解析的 JSON 字符串
 * @returns 解析后的 JavaScript 对象
 */
export function JsonParse<T = any>(string: string): T {
  return JSON.parse(string);
}

/**
 * 将对象序列化为 JSON 字符串
 * 支持 bigint 类型的序列化处理
 * @param object - 需要序列化的对象
 * @param space - 缩进空格数，用于格式化输出
 * @returns 序列化后的 JSON 字符串
 */
export function JsonStringify(object: any, space?: number) {
  return JSON.stringify(
    object,
    (key, value) => {
      if (typeof value === 'bigint') return value.toString();
      return value;
    },
    space
  );
}

/**
 * 对对象中的敏感信息进行掩码处理
 * 支持手机号、邮箱、地址、密码、JWT token 等敏感字段的自动掩码
 * @template T - 返回对象的类型
 * @param object - 需要进行掩码处理的对象
 * @returns 掩码处理后的新对象
 */
export function JsonMask<T = any>(object: any): T {
  // 执行掩码操作
  return MaskData.maskJSON2<any>(JsonClone(object), {
    phoneFields: ['*phone', '*phoneNumber'],
    emailFields: ['*email', '*emailAddress'],
    stringFields: ['*address', '*lastName'],
    passwordFields: ['*password', '*newPassword', '*confirmPassword', '*fingerprint', '*x-fingerprint'],
    jwtFields: ['*authorization', '*token', '*accessToken', '*refreshToken'],
    jwtMaskOptions: {
      maxMaskedCharacters: 32,
    },
  });
}
