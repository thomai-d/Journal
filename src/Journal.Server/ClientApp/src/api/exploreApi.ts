import axios from 'axios';

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

export async function explore(group: GroupByTime, tags: string[]): Promise<Document[]> {
  const response = await axios.post('api/explore', {
    aggregate: 'count',
    GroupByTime: group
  });

  if (response.status === 200) {
    return response.data;
  }
 
  throw new Error('Explore query failed');
}