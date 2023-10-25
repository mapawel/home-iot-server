import ReadingFieldType from '../../reading-types/types/reading-field.type';

type DataType = {
  reading: string | number | boolean;
  type: ReadingFieldType;
  readingTypeDbId: number;
};

export default DataType;
