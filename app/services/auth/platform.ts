import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { BaseService } from '@plugin/typeorm-graphql';
import { Platform } from '@entity/auth/platform';

@Service('PlatformService')
export default class PlatformService extends BaseService<Platform> {
  constructor(@InjectRepository(Platform) readonly repository: Repository<Platform>) {
    super(Platform, repository);
  }
}
