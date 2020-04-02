export class Cursor {
  public static create(prefix: string, offset: number): string {
    const value = `${prefix}:${offset}`;
    return Buffer.from(value).toString('base64');
  }

  public static getOffset(encodedValue: string) {
    return Cursor.decode(encodedValue).offset;
  }

  public static getClassName(encodedValue: string) {
    return Cursor.decode(encodedValue).className;
  }

  public static decode(encodedValue: string) {
    const decodedValue = Buffer.from(encodedValue, 'base64').toString('ascii');
    const tokens = decodedValue.split(':');

    if (tokens.length !== 2) {
      Cursor.throwInvalidCursorError(decodedValue);
    }

    const offset = parseInt(tokens[1]);
    if (Number.isNaN(offset)) {
      Cursor.throwInvalidCursorError(decodedValue);
    }

    return {
      className: tokens[0],
      offset,
    };
  }

  private static throwInvalidCursorError(decodedValue: string) {
    throw new Error(
      `Invalid cursor: ${decodedValue}. Expected cursor in the form "className:offset"`,
    );
  }
}
