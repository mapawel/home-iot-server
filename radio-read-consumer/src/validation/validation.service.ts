import { validate, ValidationError } from 'class-validator';
import ValidationException from '../exceptions/validation.exception';
import { plainToInstance } from 'class-transformer';
import { ClassType } from 'class-transformer-validator';
import { ValidationExceptionCode } from '../exceptions/dict/exception-codes.enum';
import { Level } from '../logger/dict/level.enum';

class ValidationService<ValidateClassType extends object> {
  private instance: ValidateClassType;
  private error: ValidationException;

  constructor(
    private readonly validatedClass: ClassType<ValidateClassType>,
    private readonly plain: object,
  ) {}

  public async validateAndGetInstance(): Promise<
    [ValidateClassType, ValidationException]
  > {
    try {
      this.instance = plainToInstance(this.validatedClass, this.plain);
      await this.isValid<ValidateClassType>(this.instance);
      return [this.instance, this.error];
    } catch (err) {
      throw new Error(
        'Error while validateAndGetInstance() in ValidationService',
        {
          cause: err,
        },
      );
    }
  }

  private async isValid<T extends object>(toValidate: T) {
    try {
      const errors: ValidationError[] = await validate(toValidate, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      if (errors.length > 0) {
        this.error = new ValidationException(
          ValidationExceptionCode.VALIDATION_ERROR,
          Level.ERROR,
          { cause: errors },
        );
      }
    } catch (err) {
      throw new Error('Error while isValid() in ValidationService', {
        cause: err,
      });
    }
  }
}

function getValidationService<T extends object>(
  validatedClass: ClassType<T>,
  plain: object,
) {
  return new ValidationService<T>(validatedClass, plain);
}

export default getValidationService;
