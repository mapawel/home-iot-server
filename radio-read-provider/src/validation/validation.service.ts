import { validate, ValidationError } from 'class-validator';
import { BadRequestException } from '../exceptions/http-exceptions/bad-request.exception';
import { plainToInstance } from 'class-transformer';
import { ClassType } from 'class-transformer-validator';

class ValidationService<ValidateClassType extends object> {
  private instance: ValidateClassType;
  private error: BadRequestException;

  constructor(
    private readonly validatedClass: ClassType<ValidateClassType>,
    private readonly plain: object,
  ) {}

  public async validateAndGetInstance(): Promise<
    [ValidateClassType, BadRequestException]
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
        this.error = new BadRequestException({ errors });
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
