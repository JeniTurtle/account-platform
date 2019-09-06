import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { BaseService } from '@plugin/typeorm-graphql';
import { Organization } from '@entity/auth/organization';

@Service('OrganizationService')
export default class OrganizationService extends BaseService<Organization> {
  constructor(@InjectRepository(Organization) readonly repository: Repository<Organization>) {
    super(Organization, repository);
  }
}
