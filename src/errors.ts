class CustomError extends Error {
  type;
  date;

  constructor(type: string, message: string) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }

    this.name = this.constructor.name;
    this.type = type;
    this.date = new Date();
  }

  is(customError: CustomError) {
    return this.type === customError.type;
  }
}

export class AlreadyUsedEmailError extends CustomError {
  constructor() {
    super('ALREADY_USED_EMAIL', 'There is a user with that email already');
  }
}

export class UserNotFoundError extends CustomError {
  constructor() {
    super('USER_NOT_FOUND', 'User not found');
  }
}

export class WrongPasswordError extends CustomError {
  constructor() {
    super('WRONG_PASSWORD', 'Wrong password');
  }
}
