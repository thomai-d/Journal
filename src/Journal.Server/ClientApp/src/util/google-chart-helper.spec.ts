import { resultToChartData } from './google-chart-helper';

test('Daily values should be converted correctly', () => {

  const input:any = [
    { key: 'a', values: { '2000-01-01': 1, '2000-01-02': 2 }},
    { key: 'b', values: { '2000-01-02': 3 }},
  ];

  const expected = [
    ['Date', 'a', 'b' ],
    [ new Date(2000, 1, 1), 1, null ],
    [ new Date(2000, 1, 2), 2, 3 ]
  ];

  expect(resultToChartData(input))
        .toStrictEqual(expected);
});

test('Week values should be converted correctly', () => {
  const input:any = [
    { key: 'a', values: { '10/2000': 1, '11/2000': 2 }},
    { key: 'b', values: { '11/2000': 3 }},
  ];

  const expected = [
    ['Date', 'a', 'b' ],
    [ '10/2000', 1, null ],
    [ '11/2000', 2, 3 ]
  ];

  expect(resultToChartData(input))
        .toStrictEqual(expected);
});

test('Year values should be converted correctly', () => {
  const input:any = [
    { key: 'a', values: { '2000': 1, '2001': 2 }},
    { key: 'b', values: { '2001': 3 }},
  ];

  const expected = [
    ['Date', 'a', 'b' ],
    [ '2000', 1, null ],
    [ '2001', 2, 3 ]
  ];

  expect(resultToChartData(input))
        .toStrictEqual(expected);
});