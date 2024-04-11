import { describe, expect, it } from "vitest";
import { getProjectName, isValidPackageName, toValidPackageName, toValidProjectName } from "../src/utils/normalize";

describe("resolve project name", () => {
  it("current dir", () => {
    expect(toValidProjectName(getProjectName("."))).toBe("create-l");
  });

  it("input project name", () => {
    expect(toValidProjectName(getProjectName("my-lib"))).toBe("my-lib");
  });

  it("input project name with space", () => {
    expect(toValidProjectName(getProjectName("my lib"))).toBe("my_lib");
  });
});

describe("validate package name", () => {
  it("package name with -", () => {
    expect(isValidPackageName("my-lib")).toBeTruthy();
  });

  it("package name with space", () => {
    expect(isValidPackageName("my lib")).toBeFalsy();
  });

  it("package name with prefix", () => {
    expect(isValidPackageName("@my/lib")).toBeTruthy();
  });

  it("package name with _", () => {
    expect(isValidPackageName("my_lib")).toBeTruthy();
  });

  it("package name with camelCase", () => {
    expect(isValidPackageName("myLib")).toBeFalsy();
  });

  it("package name with number", () => {
    expect(isValidPackageName("my-lib1")).toBeTruthy();
  });
});

describe("to valid package name", () => {
  it("convert name with space", () => {
    expect(toValidPackageName("my lib")).toBe("my-lib");
  });

  it("convert name with camelCase", () => {
    expect(toValidPackageName("myLib")).toBe("my-lib");
  });

  it("convert name with capital", () => {
    expect(toValidPackageName("MyLib")).toBe("my-lib");
  });
});
