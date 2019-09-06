export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface StringMap {
  [key: string]: string;
}
export interface StringMapOptional {
  [key: string]: string | undefined;
}

export type DateTime = string;
export type IDType = string;

export interface BaseEntity {
  id: IDType;
  [key: string]: any;
}

export interface WhereInput {
  id_eq?: IDType;
  id_in?: IDType[];
}

export interface DeleteReponse {
  id: IDType;
}

export type ClassType<T = any> = new (...args: any[]) => T;

export type Maybe<T> = T | void;

export function defaultColumnType(databaseType: string, dataType: string) {
  const mapping: any = {
    postgres: {
      date: 'timestamp',
      float: 'float8',
      json: 'jsonb',
    },
    sqlite: {
      date: 'datetime',
      float: 'float',
      // NOTE: this is a hack for the current codegen.  This data type is only used by sqlite, so we've
      // overloaded it so that TypeORM doesn't blow up (thinks it's a string), but Warthog can properly
      // label the column as JSON
      json: 'varying character',
    },
  };

  if (!mapping[databaseType]) {
    throw new Error("Can't find databaseType");
  }
  if (!mapping[databaseType][dataType]) {
    throw new Error(`Can't find dataType for ${databaseType}`);
  }

  return mapping[databaseType][dataType];
}
