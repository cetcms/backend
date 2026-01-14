import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

import { ContentDataType } from './content-type.graphql';

/**
 * SEO 分析状态枚举
 */
export enum SeoAnalysisStatus {
  /** 分析中 */
  Analyzing = 'Analyzing',
  /** 待分析 */
  Queued = 'Queued',
  /** 完成 */
  Completed = 'Completed',
  /** 失败 */
  Failed = 'Failed',
  /** 超时 */
  Timeout = 'Timeout',
  /** 未分析 */
  None = 'None',
}

registerEnumType(SeoAnalysisStatus, {
  name: 'SeoAnalysisStatus',
  description: 'SEO 分析状态',
  valuesMap: {
    Analyzing: { description: '分析中' },
    Queued: { description: '队列中' },
    Completed: { description: '完成' },
    Failed: { description: '失败' },
    Timeout: { description: '超时' },
    None: { description: '未分析' },
  },
});

@ObjectType()
export class WebsiteSeoPage {
  @Field(() => Number)
  id: number;

  @Field(() => String)
  apiId: string;

  @Field(() => String)
  locale: string;

  @Field(() => Boolean)
  isItem: boolean;

  @Field(() => String)
  document: string;

  @Field(() => String)
  documentId: string;

  @Field(() => String)
  documentTitle: string;

  @Field(() => ContentDataType)
  contentType: ContentDataType;

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
}
