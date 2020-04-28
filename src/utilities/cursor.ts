export class Cursor {
  public static create(offset: number): string {
    return Buffer.from(offset.toString()).toString('base64');
  }

  public static getOffset(encodedValue: string) {
    const decodedValue = Buffer.from(encodedValue, 'base64').toString('ascii');
    const offset = parseInt(decodedValue);
    if (Number.isNaN(offset)) {
      throw new Error(`Invalid cursor: ${decodedValue}. Expected cursor to be an offset`);
    }

    return offset;
  }
}
