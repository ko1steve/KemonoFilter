export class StringFormatter {
  public static readonly EMPTY_STRING = '';
  public static readonly SPACE = ' ';

  public static uint8ArrayToString(uint8Array: Uint8Array): string {
    return Array.from(uint8Array, charCode => String.fromCharCode(charCode)).join(StringFormatter.EMPTY_STRING);
  }

  public static arrayBufferToString(ab: ArrayBuffer): string {
    return StringFormatter.uint8ArrayToString(new Uint8Array(ab));
  }

  public static stringToArrayBuffer(str: string): ArrayBuffer {
    const arrayBuffer = new ArrayBuffer(str.length * 2);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < str.length; i++) {
      uint8Array[i] = str.charCodeAt(i);
    }
    return arrayBuffer;
  }

  public static stringToUint8Array(str: string): Uint8Array {
    const array = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      array[i] = str.charCodeAt(i);
    }
    return array;
  };
}
