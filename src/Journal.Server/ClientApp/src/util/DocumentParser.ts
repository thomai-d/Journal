class _DocumentParser {

  public parseObjectValues(text: string): { [ key: string ]: any } | null {
    var keyValueRx = /\$(?<KEY>[A-Za-z_\-À-ž]+)=(('(?<VALUE2>.+?)')|((?<VALUE1>.+?)(\s|$)))/g;
    let match: RegExpExecArray | null;
    const obj: { [key: string]: any } = {};
    while (!!(match = keyValueRx.exec(text))) {
      if (!match.groups)
        continue;

      const key = match.groups['KEY'];
      const value = match.groups['VALUE2'] ?? match.groups['VALUE1'];
      const numericValue = Number(value);
      obj[key] = isNaN(numericValue) ? value : numericValue;
    }

    if (Object.keys(obj).length > 0) {
      return obj;
    }

    return null;
  }

  public parseTags(text: string): string[] {
    const allTags = text.match(/#[A-Za-z_\-À-ž]+/g);
    const tags = allTags?.map(t => t.substr(1)) ?? [];
    return [...new Set(tags)];
  }
}

export const DocumentParser = new _DocumentParser();