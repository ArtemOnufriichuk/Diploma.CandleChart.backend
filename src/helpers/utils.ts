import { createLogger, format, transports } from 'winston';
import { validate, ValidationError } from 'class-validator';
import { ValidationArrError } from './errors';

export const filterObj: Function = (
  o: any,
  deep = true,
  values: any[] = [null, '', 0, undefined]
) =>
  Object.entries(o)
    .map(([key, value]) => {
      if (deep) {
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          value = filterObj(value, deep, values);
        }
      }
      return [key, value];
    })
    .filter(([key, value]) => {
      return !values.includes(value);
    })
    .reduce((obj, [key, val]) => {
      return { ...obj, [key as any]: val };
    }, {});

export const entityValidator: (
  entity: any,
  skipMissingProperties?: boolean
) => Promise<never | void> = async (
  entity: any,
  skipMissingProperties = false
): Promise<never | void> => {
  const errors: ValidationError[] = await validate(entity, { skipMissingProperties });
  if (errors.length) {
    throw new ValidationArrError(
      errors.map((e) => ({
        origin: e.property,
        value: e.value,
        message: Object.values(e.constraints || {})
      }))
    );
  }
};

const myCryptoFormat = format.printf(({ timestamp, message }) => {
  const { crypto, event, args } = JSON.parse(message);
  return `${timestamp} | ${crypto} ${event} args: ${JSON.stringify(args)}`;
});

export const loggerCrypto = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), myCryptoFormat),
  transports: [new transports.Console(), new transports.File({ filename: './log/crypto.log' })]
});
