export class Helpers {
  static generateRandomNumber(integerLength: number): string {
    const characters = '123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < integerLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }
}
