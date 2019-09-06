import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { BaseService } from '@plugin/typeorm-graphql';
import { Department } from '@entity/auth/department';

@Service('DepartmentService')
export default class DepartmentService extends BaseService<Department> {
  constructor(@InjectRepository(Department) readonly repository: Repository<Department>) {
    super(Department, repository);
  }
}
