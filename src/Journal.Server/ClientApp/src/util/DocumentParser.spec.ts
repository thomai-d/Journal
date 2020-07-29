import { DocumentParser } from './DocumentParser';

test('parsing tags should work', () => {
  const tags = DocumentParser.parseTags('#a #b #c');
  expect(tags).toEqual(['a', 'b', 'c']);
});

test('parsing no tags should return empty array', () => {
  const tags = DocumentParser.parseTags('');
  expect(tags).toEqual([]);
});

test('parsing object values should work', () => {
  const obj = DocumentParser.parseObjectValues('$a=hallo $b=3.14 $c=\'hallo i bims\'');
  expect(obj).toEqual({
    a: 'hallo',
    b: 3.14,
    c: 'hallo i bims'
  });
});

test('parsing empty object should return null', () => {
  const obj = DocumentParser.parseObjectValues('');
  expect(obj).toBeNull();
});
