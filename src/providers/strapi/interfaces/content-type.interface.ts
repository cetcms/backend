/**
 * 内容类型定义
 */
export interface ContentTypeSchema {
  draftAndPublish: boolean;
  displayName: string;
  singularName: string;
  pluralName: string;
  description: string;
  pluginOptions: {
    'content-manager': Record<string, any>;
    'content-type-builder': Record<string, any>;
  };
  kind: 'collectionType' | 'singleType';
  collectionName: string;
  attributes: {
    [key: string]: Record<string, any>;
  };
  visible: boolean;
  restrictRelationsTo: string[];
}

/**
 * 内容类型
 */
export interface ContentType {
  uid: string;
  plugin: string;
  apiID: string;
  schema: ContentTypeSchema;
}
