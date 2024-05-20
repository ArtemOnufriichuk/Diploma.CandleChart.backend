export enum SortingOperation {
  ASC = 1,
  DESC = -1
}

export const Sortable: Function = (target: any, propertyKey: string) => {
  const orderMeta: string[] = Reflect.getMetadata('ORDER_PARAMETER', target) || [];
  orderMeta.push(propertyKey);
  Reflect.defineMetadata('ORDER_PARAMETER', orderMeta, target);
};
