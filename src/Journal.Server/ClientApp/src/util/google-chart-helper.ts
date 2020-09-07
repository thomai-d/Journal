import { ValuesResult } from '../api';

export function resultToChartData(result: ValuesResult[]) {
      const keys = result.map(i => i.key);
      const resultDict: { [key: string]: { [date: string ]: number }} = {};
      result.forEach(res => resultDict[res.key] = res.values);

      const allDates = Array.from(new Set(result.flatMap(col => Object.keys(col.values)))).sort();
      const data = allDates.map(date => {
        const data = keys.map(key => resultDict[key][date] ?? null);
        return [parseApiDateStr(date), ...data];
      });

      const headers = [ 'Date', ...keys];
      return [ headers, ...data ];
}

  function parseApiDateStr(str: string): any {
    if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // 2000-01-01
      const parts = str.split('-');
      return new Date(+parts[0], +parts[1], +parts[2]);
    }
    else if (str.match(/^\d{2}\/\d{4}$/)) {
      // 14/2000
      return str;
    }
    else if (str.match(/^\d{4}$/)) {
      // 2000
      return str;
    }
    else
      throw new Error(`Invalid date: ${str}`);
  }