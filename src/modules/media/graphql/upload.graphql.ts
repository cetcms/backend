import { ArgsType, Field } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

@ArgsType()
export class UploadFileArgs {
  @Field(() => GraphQLUpload)
  file: Promise<FileUpload>;

  @Field(() => String)
  storePath: string;

  @Field(() => String, { nullable: true })
  name?: string;
}
