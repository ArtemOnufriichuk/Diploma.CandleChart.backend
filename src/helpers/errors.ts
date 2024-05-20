export class ValidationError {
  public message: string;
  public origin?: string;
  public status: number;
  public type: string;

  constructor(msg: string, origin?: string) {
    this.message = msg;
    this.origin = origin;
    this.status = 400;
    this.type = ValidationError.name;
  }
}
export class ValidationArrError {
  public errors: { message: string[]; origin?: string }[];
  public status: number;
  public type: string;

  constructor(errors: { message: string[]; origin?: string; value?: any }[]) {
    this.errors = errors;
    this.status = 400;
    this.type = ValidationArrError.name;
  }
}
export class NotFoundError {
  public message: string;
  public status: number;
  public type: string;

  constructor(msg: string) {
    this.message = msg;
    this.status = 404;
    this.type = NotFoundError.name;
  }
}
export class ServerError {
  public message: string;
  public status: number;
  public type: string;

  constructor(msg: string) {
    this.message = msg;
    this.status = 500;
    this.type = ServerError.name;
  }
}
