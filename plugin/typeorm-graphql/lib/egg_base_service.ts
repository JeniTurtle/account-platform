import { BaseModel, StandardDeleteResponse, getFindOperator, WhereInput } from 'warthog';
import { Context, Application, EggAppConfig } from 'egg';
import { validate } from 'class-validator';
import { ArgumentValidationError } from 'type-graphql';
import { DeepPartial, FindManyOptions, FindOperator, getRepository, Repository } from 'typeorm';

export interface IFindParam {
  where?: any;
  orderBy?: any; // Fix this
  limit?: number;
  offset?: number;
  fields?: string[];
}

export class EggBaseService {
  protected ctx: Context;
  protected app: Application;
  protected config: EggAppConfig;

  init(ctx: Context) {
    this.ctx = ctx;
    this.app = ctx.app;
    this.config = ctx.app.config;
    return this;
  }
}

export class BaseService<E extends BaseModel> extends EggBaseService {
  private serviceMap: Map<string, BaseService<any>> = new Map();

  repository: Repository<any>;

  // TODO: need to figure out why we couldn't type this as Repository<E>
  constructor(protected entityClass: any, repository?: Repository<any>) {
    super();
    if (!entityClass) {
      throw new Error('BaseService requires an entity Class');
    }
    // TODO: This handles an issue with typeorm-typedi-extensions where it is unable to
    // Inject the proper repository
    if (!repository) {
      this.repository = getRepository(entityClass);
    } else {
      this.repository = repository;
    }
    if (!repository) {
      throw new Error(`BaseService requires a valid repository, class ${entityClass}`);
    }
  }

  getService<E extends BaseModel>(entityClass: any, repository?: Repository<any>): BaseService<E> {
    if (this.serviceMap.has(entityClass.name)) {
      const service = this.serviceMap.get(entityClass.name);
      if (service && service.repository === repository) {
        return service;
      }
    }
    const newService = new BaseService<E>(entityClass, repository);
    this.serviceMap.set(entityClass.name, newService);
    return newService;
  }

  private async findOption<W extends WhereInput>({ where, limit, offset, fields, orderBy }: IFindParam = {}): Promise<
    any
  > {
    const findOptions: FindManyOptions = {};

    if (limit) {
      findOptions.take = limit;
    }
    if (offset) {
      findOptions.skip = offset;
    }
    if (fields) {
      // We always need to select ID or dataloaders will not function properly
      if (fields.indexOf('id') === -1) {
        fields.push('id');
      }
      findOptions.select = fields;
    }
    if (orderBy) {
      // TODO: allow multiple sorts
      const parts = orderBy.toString().split('_');
      const attr = parts[0];
      const direction: 'ASC' | 'DESC' = parts[1] as 'ASC' | 'DESC';
      // TODO: ensure key is one of the properties on the model
      findOptions.order = {
        [attr]: direction,
      };
    }

    // Soft-deletes are filtered out by default, setting `deletedAt_all` is the only way to
    // turn this off
    where = where || {};
    if (Array.isArray(where)) {
      for (const index in where) {
        if (!where[index].deletedAt_all) {
          // eslint-disable-next-line @typescript-eslint/camelcase
          where[index] = { ...where[index], deletedAt_eq: null }; // Filter out soft-deleted items
        }
        delete where[index].deletedAt_all;
      }
    } else {
      // TODO: Bug: does not support deletedAt_gt: "2000-10-10" or deletedAt_not: null
      if (!where.deletedAt_all) {
        // eslint-disable-next-line @typescript-eslint/camelcase
        where = { ...where, deletedAt_eq: null }; // Filter out soft-deleted items
      }
      delete where.deletedAt_all;
    }

    findOptions.where = this.processWhereOptions<W>(where);
    return findOptions;
  }

  async find<W extends WhereInput>({ where, limit, offset, fields, orderBy }: IFindParam = {}): Promise<E[]> {
    const findOptions: any = await this.findOption<W>({ where, limit, offset, fields, orderBy });
    return await this.repository.find(findOptions);
  }

  async count<W extends WhereInput>({ where }: IFindParam = {}): Promise<number> {
    const findOptions: any = await this.findOption<W>({ where });
    return await this.repository.count(findOptions);
  }

  async findAndCount<W extends WhereInput>({ where, limit, offset, fields, orderBy }: IFindParam = {}): Promise<any> {
    const findOptions: any = await this.findOption<W>({ where, limit, offset, fields, orderBy });
    const [rows, count] = await this.repository.findAndCount(findOptions);
    return { rows, count };
  }

  // TODO: fix - W extends Partial<E>
  async findOne<W extends any>(where: W, fields?: string[]): Promise<E | null> {
    const items = await this.find<W>({ where, fields });
    if (!items.length) {
      return null;
    } else if (items.length > 1) {
      throw new Error(`Found ${items.length} ${this.entityClass.name}s where ${JSON.stringify(where)}`);
    }
    return items[0];
  }

  async create(data: DeepPartial<E>, userId?: string): Promise<E> {
    (data as any).createdById = userId; // TODO: fix any

    const results = await this.repository.create([data]);
    const obj = results[0];

    // Validate against the the data model
    // Without `skipMissingProperties`, some of the class-validator validations (like MinLength)
    // will fail if you don't specify the property
    const errors = await validate(obj, { skipMissingProperties: true });
    if (errors.length) {
      // TODO: create our own error format that matches Mike B's format
      throw new ArgumentValidationError(errors);
    }

    // TODO: remove any when this is fixed: https://github.com/Microsoft/TypeScript/issues/21592
    return await this.repository.save(obj, { reload: true });
  }

  async createMany(data: Array<DeepPartial<E>>, userId?: string): Promise<E[]> {
    data = data.map(item => {
      return { ...item, createdById: userId };
    });

    const results = await this.repository.create(data);

    // Validate against the the data model
    // Without `skipMissingProperties`, some of the class-validator validations (like MinLength)
    // will fail if you don't specify the property
    results.forEach(async obj => {
      const errors = await validate(obj, { skipMissingProperties: true });
      if (errors.length) {
        // TODO: create our own error format that matches Mike B's format
        throw new ArgumentValidationError(errors);
      }
    });

    // TODO: remove any when this is fixed: https://github.com/Microsoft/TypeScript/issues/21592
    return await this.repository.save(results, { reload: true });
  }

  // TODO: There must be a more succinct way to:
  //   - Test the item exists
  //   - Update
  //   - Return the full object
  // NOTE: assumes all models have a unique `id` field
  // W extends Partial<E>
  async update<W extends any>(data: DeepPartial<E>, where: W, userId: string): Promise<E | false> {
    (data as any).updatedById = userId; // TODO: fix any

    // const whereOptions = this.pullParamsFromClass(where);
    const found = await this.findOne(where);
    if (!found) {
      return false;
    }
    const idData = ({ id: found.id } as any) as DeepPartial<E>;
    const merged = this.repository.merge(new this.entityClass(), data, idData);

    // skipMissingProperties -> partial validation of only supplied props
    const errors = await validate(merged, { skipMissingProperties: true });
    if (errors.length) {
      throw new ArgumentValidationError(errors);
    }

    // TODO: remove `any` - getting issue here
    return await this.repository.save(merged);
  }

  async delete<W extends any>(
    where: W,
    userId: string,
  ): Promise<StandardDeleteResponse | StandardDeleteResponse[]> {
    const data = {
      deletedAt: new Date().toISOString(),
      deletedById: userId,
    };
    const resp: Array<{ id: string }> = [];
    const founds = await this.find({ where });
    const merged = founds.map(item => {
      resp.push({ id: item.id });
      const idData = ({ id: item.id } as any) as DeepPartial<E>;
      return this.repository.merge(new this.entityClass(), data as any, idData);
    });
    await this.repository.save(merged);
    return resp.length === 1 ? resp[0] : resp;
  }

  // extends WhereInput
  processWhereOptions<W extends any>(where: W) {
    if (Array.isArray(where)) {
      const whereOptions: Array<{ [key: string]: FindOperator<any> }> = [];
      Object.keys(where).forEach(k => {
        const options: any = {};
        for (const index in where[k]) {
          const key = index as keyof W;
          if (where[k][key] === undefined) {
            continue;
          }
          const [attr, operator] = getFindOperator(String(key), where[k][key]);
          options[attr] = operator;
        }
        whereOptions.push(options);
      });
      return whereOptions;
    } else {
      const whereOptions: { [key: string]: FindOperator<any> } = {};
      Object.keys(where).forEach(k => {
        const key = k as keyof W;
        if (where[key] !== undefined) {
          const [attr, operator] = getFindOperator(String(key), where[key]);
          whereOptions[attr] = operator;
        }
      });
      return whereOptions;
    }
  }
}
