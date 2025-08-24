export class CommonTool {
  public static showLog (param: any, ...optionalParams: any[]): void {
    console.log('%c[ForumUserBlacklist] ' + param, 'color: green font-weight: bold', ...optionalParams);
  }
}
