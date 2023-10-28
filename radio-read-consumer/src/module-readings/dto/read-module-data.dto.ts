import ReadingsEnrichedData from '../types/readings-enriched-data.type';

type ReadModuleDataDto = {
  moduleDbId: number;
  lastReadDate: Date;
  data: ReadingsEnrichedData[];
};

export default ReadModuleDataDto;
