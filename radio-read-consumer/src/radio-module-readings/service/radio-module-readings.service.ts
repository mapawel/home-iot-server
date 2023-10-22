import {Repository, QueryFailedError} from 'typeorm';
import ModuleDataDto from '../../radio-validation/dto/module-data.dto';
import ReadingFieldType from '../../reading-types/types/reading-field.type';
import DataType from '../../radio-validation/type/data.type';

class RadioModuleReadingsService<T extends object> {
    private readonly dataTypesRepositiries: Map<ReadingFieldType, Repository<T>> =
        new Map();

    constructor(
        repositoriesList: {
            readingFieldType: ReadingFieldType;
            repository: Repository<T>;
        }[],
    ) {
        repositoriesList.forEach(
            (el: { readingFieldType: ReadingFieldType; repository: Repository<T> }) =>
                this.dataTypesRepositiries.set(el.readingFieldType, el.repository),
        );
    }

    async addReadings({moduleDbId, data}: ModuleDataDto) {
        for (const dataElement of data) {
            const {reading, type, readingTypeDbId}: DataType = dataElement;

            const repoForDataType: Repository<T> | undefined =
                this.dataTypesRepositiries.get(type);
            if (!repoForDataType)
                throw new Error(
                    `not repository fot data of type: ${type} supplied to RadioModuleReadingServide`,
                );
            await repoForDataType.save({
                reading,
                addedAt: new Date(),
                module: {id: moduleDbId},
                readingType: {id: readingTypeDbId},
            } as T);
        }
    }

    //
    // private iterateAndSwitchData(data: MessageDataType) {
    //   const a = Object.entries(data);
    // }
    //
    // private getReadingTypeFromDb(name: string) {}
    //
    // private saveReadingTypeNumber(reading: number) {
    //   try {
    //     const temp = data.temperature as number;
    //
    //     return await this.moduleReadingNumberRepository.save({
    //       reading: temp,
    //       addedAt: new Date(),
    //       module: { id: moduleDbId },
    //       readingType: { id: 1 },
    //     });
    //   } catch (err: unknown) {
    //     if (err instanceof QueryFailedError) {
    //       console.log(JSON.stringify(err.driverError));
    //       throw new BadRequestException({ errors: [err.driverError] });
    //     }
    //     throw new ServiceException(`Exception in addReading()-> ${err}`);
    //   }
    // }
    //
    // private saveReadingTypeBool(reading: boolean) {}
}

export default RadioModuleReadingsService;
