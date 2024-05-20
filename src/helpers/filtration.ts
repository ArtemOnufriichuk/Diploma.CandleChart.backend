import { LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not, IsNull } from 'typeorm';
import { ValidationError } from './errors';

export enum SearchOperation {
  EQUAL = '==',
  NOT_EQUAL = '!=',
  LIKE = '=~',
  GREATER = '>',
  LESS = '<',
  GREATER_OR_EQUAL = '>=',
  LESS_OR_EQUAL = '<='
}

interface SearchOptions {
  validationAndConvert: (value: string) => any;
}

export interface SearchParameterI {
  searchOperations: SearchOperation[];
  validationAndConvert?: (value: string) => any;
}

export const SearchParameter: Function = (
  searchOperations: SearchOperation[],
  searchOptions?: SearchOptions
) => (target: any, propertyKey: string) => {
  const searchMeta: { [key: string]: SearchParameterI } =
    Reflect.getMetadata('SEARCH_PARAMETER', target) || {};
  const { validationAndConvert } = searchOptions || {};
  searchMeta[propertyKey] = { searchOperations };
  if (validationAndConvert) {
    searchMeta[propertyKey] = { ...searchMeta[propertyKey], validationAndConvert };
  }
  Reflect.defineMetadata('SEARCH_PARAMETER', searchMeta, target);
};

export const convertFilterWithOr = (
  rawFilter: {
    key: string;
    value: any;
    operation: SearchOperation;
  }[]
): { [key: string]: any }[] => {
  if (rawFilter.length !== 2) {
    throw new ValidationError('You have to provide only 2 filters with or operation', '?filter=');
  }
  return [convertFilter([rawFilter[0]]), convertFilter([rawFilter[1]])];
};

export const convertFilter = (
  rawFilter: {
    key: string;
    value: any;
    operation: SearchOperation;
  }[]
): { [key: string]: any } => {
  return rawFilter.reduce((obj, { key, value, operation }) => {
    const filterValue: any = {};
    switch (operation) {
      case SearchOperation.EQUAL:
        filterValue[key] = value;
        break;
      case SearchOperation.NOT_EQUAL:
        filterValue[key] = Not(value);
        break;
      case SearchOperation.LIKE:
        filterValue[key] = Like(`%${value}%`);
        break;
      case SearchOperation.GREATER:
        filterValue[key] = MoreThan(value);
        break;
      case SearchOperation.LESS:
        filterValue[key] = LessThan(value);
        break;
      case SearchOperation.GREATER_OR_EQUAL:
        filterValue[key] = MoreThanOrEqual(value);
        break;
      case SearchOperation.LESS_OR_EQUAL:
        filterValue[key] = LessThanOrEqual(value);
        break;
    }
    if (value === null) {
      if (operation === SearchOperation.EQUAL) {
        filterValue[key] = IsNull();
      }
      if (operation === SearchOperation.NOT_EQUAL) {
        filterValue[key] = Not(IsNull());
      }
    }
    return { ...obj, ...filterValue };
  }, {});
};
