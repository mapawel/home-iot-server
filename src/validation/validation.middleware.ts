import { validate, ValidationError } from 'class-validator';
import { BadRequestException } from '../exceptions/http-exceptions/bad-request.exception';

// import { ClassType } from 'class-transformer-validator';

async function isValid<T extends object>(toValidate: T) {
  const errors: ValidationError[] = await validate(toValidate, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length > 0) {
    console.log('before');
    return new BadRequestException({ errors });
  }
}

export default isValid;
