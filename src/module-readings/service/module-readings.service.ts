import mySQLDataSource from '../../data-sources/mySQL.data-source';
import { Repository, QueryFailedError } from 'typeorm';
import ModuleReadingNumber from '../entity/module-reading-number';
import ModuleReadingBool from '../entity/module-reading-bool';
import { BadRequestException } from '../../exceptions/http-exceptions/bad-request.exception';
import { InternalServiceException } from '../../exceptions/internal-services-exceptions/internal-service.exception';
import ReadingType from '../../reading-types/entity/reading-type';
import ReadingTypeField from '../../reading-types/types/reading-field.type';
import MessageDataType from '../../radio-validation/parsed-message-data.type';
import Module from '../../modules/entity/module';

class ModuleReadingsService {
  private readonly moduleReadingNumber: Repository<ModuleReadingNumber> =
    mySQLDataSource.getRepository(ModuleReadingNumber);
  private readonly moduleReadingBool: Repository<ModuleReadingBool> =
    mySQLDataSource.getRepository(ModuleReadingBool);

  constructor() {}

  // async getModules(): Promise<Module[]> {
  //   try {
  //     return await this.moduleRepository.find({});
  //   } catch (err: unknown) {
  //     if (err instanceof QueryFailedError)
  //       throw new BadRequestException({ errors: [err.driverError] });
  //     throw new InternalServiceException('Exception in getModules()');
  //   }
  // }

  async addReading(
    readings: MessageDataType,
    module: Module,
  ): Promise<ModuleReadingNumber | ModuleReadingBool> {
    try {
      const temp = readings.temperature as number;

      return await this.moduleReadingNumber.save({
        reading: temp,
        addedAt: new Date(),
        module: { id: 4 },
        readingType: { id: 1 },
      });
    } catch (err: unknown) {
      if (err instanceof QueryFailedError) {
        console.log(JSON.stringify(err.driverError));
        throw new BadRequestException({ errors: [err.driverError] });
      }
      throw new InternalServiceException(`Exception in addReading()-> ${err}`);
    }
  }
}

export default ModuleReadingsService;
