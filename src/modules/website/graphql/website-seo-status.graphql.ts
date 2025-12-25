import { Field, Int, ObjectType } from '@nestjs/graphql';

/**
 * SEO 分析全局摘要
 */
@ObjectType()
export class SeoAnalysisSummary {
  @Field(() => Int, { description: '分析中' })
  analyzing: number;

  @Field(() => Int, { description: '队列中' })
  queued: number;

  @Field(() => Int, { description: '完成' })
  completed: number;

  @Field(() => Int, { description: '失败' })
  failed: number;

  @Field(() => Int, { description: '超时' })
  timeout: number;

  @Field(() => Int, { description: '未分析' })
  none: number;
}
