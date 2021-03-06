import { CustomError } from 'ts-custom-error'

export class UserNotFoundError extends CustomError {
  constructor(attemptedParam: string, attemptedValue: string) {
    super(
      `user not found via parameter ${attemptedParam} and value ${attemptedValue}`
    )
  }
}

export class RepoCreateError extends CustomError {
  constructor(arg: unknown) {
    if (arg instanceof RepoCreateError) return arg
    else {
      const msg =
        typeof arg === 'string'
          ? arg
          : `Database create error: ${(arg as Error).message}`
      super(msg)
    }
  }
}
export class RepoReadError extends CustomError {
  constructor(arg: unknown) {
    if (arg instanceof RepoReadError) return arg
    else {
      const msg =
        typeof arg === 'string'
          ? arg
          : `Database read error: ${(arg as Error).message}`
      super(msg)
    }
  }
}

export class RepoUpdateError extends CustomError {
  constructor(arg: unknown) {
    if (arg instanceof RepoUpdateError) return arg
    else {
      const msg =
        typeof arg === 'string'
          ? arg
          : `Database update error: ${(arg as Error).message}`
      super(msg)
    }
  }
}
export class RepoDeleteError extends CustomError {
  constructor(arg: unknown) {
    if (arg instanceof RepoDeleteError) return arg
    else {
      const msg =
        typeof arg === 'string'
          ? arg
          : `Database delete error: ${(arg as Error).message}`
      super(msg)
    }
  }
}

export class RepoTransactionError extends CustomError {
  constructor(arg: unknown) {
    if (arg instanceof RepoTransactionError) return arg
    else {
      const msg =
        typeof arg === 'string'
          ? arg
          : `Database transaction error: ${(arg as Error).message}`
      super(msg)
    }
  }
}

export class NotAllowedError extends CustomError {}
export class InputError extends CustomError {}
export class LookupError extends CustomError {}
export class NotAuthenticatedError extends CustomError {
  constructor() {
    super('Request is not authenticated')
  }
}
