import ReadingFieldType from '../../reading-types/types/reading-field.type';

type ReadingsEnrichedData = {
  reading: string | number | boolean;
  type: ReadingFieldType;
  readingTypeDbId: number;
};

export default ReadingsEnrichedData;
