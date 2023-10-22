import ReadingFieldType from '../../reading-types/types/reading-field.type';
import ReadingType from '../../reading-types/entity/reading-type';

type DataType = {
  reading: string | number | boolean;
  type: ReadingFieldType;
  readingTypeDbId: number;
};

export default DataType;
