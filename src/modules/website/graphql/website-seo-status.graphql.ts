import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

/**
 * SEO 分析状态枚举
 */
export enum SeoAnalysisStatus {
  /** 分析中 */
  Analyzing = 'analyzing',
  /** 队列中 */
  Queued = 'queued',
  /** 空闲 */
  Idle = 'idle',
}

registerEnumType(SeoAnalysisStatus, {
  name: 'SeoAnalysisStatus',
  description: 'SEO 分析状态',
  valuesMap: {
    Analyzing: { description: '分析中' },
    Queued: { description: '队列中' },
    Idle: { description: '空闲' },
  },
});

/**
 * 网站 SEO 页面状态
 */
@ObjectType()
export class WebsiteSeoPageStatus {
  @Field(() => Number)
  id: number;

  @Field(() => String)
  apiId: string;

  @Field(() => String)
  url: string;

  @Field(() => String)
  title: string;

  @Field(() => SeoAnalysisStatus)
  status: SeoAnalysisStatus;

  @Field(() => String)
  md5: string;

  @Field(() => Int, { nullable: true, description: 'SEO 得分 (0-100)' })
  score?: number;

  @Field(() => Boolean, { description: '是否有可用报告' })
  hasReport: boolean;
}

/**
 * SEO 分析全局摘要
 */
@ObjectType()
export class SeoAnalysisSummary {
  @Field(() => Int, { description: '总共正在分析的 URL 数' })
  totalAnalyzing: number;

  @Field(() => Int, { description: '队列中等待的任务数' })
  queueSize: number;

  @Field(() => Int, { description: '当前活跃任务数' })
  activeTasks: number;

  @Field(() => Int, { description: '最大并发数' })
  maxConcurrent: number;
}

/**
 * 网站 SEO 页面状态列表响应
 */
@ObjectType()
export class WebsiteSeoPageStatusList {
  @Field(() => [WebsiteSeoPageStatus])
  pages: WebsiteSeoPageStatus[];

  @Field(() => SeoAnalysisSummary)
  summary: SeoAnalysisSummary;
}
