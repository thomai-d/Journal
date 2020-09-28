export type NumberDict = { [key: string]: number };

export interface Document {
  id: string;
  author: string;
  content: string;
  tags: string[];
  values: NumberDict;
  created: string;
  attachments: AttachmentPreview[];
}

export interface AttachmentPreview {
  id: string;
  fileName: string;
}

export type GroupByTime = 'day' | 'week' | 'month' | 'year';

export interface WeekValue extends YearValue {
  day: number;
}

export interface DayValue extends MonthValue {
  day: number;
}

export interface MonthValue extends YearValue {
  month: number;
}

export interface YearValue {
  year: number;
  value: number;
}

export interface ValuesResult {
  key: string;
  values: { [key: string]: number };
}