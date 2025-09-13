import { Resolver } from '@nestjs/graphql';

import { CompanyService } from './company.service';

@Resolver()
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}
}
