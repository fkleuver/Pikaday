/* tslint:disable */
import * as moment from "moment";
/* tslint:enable */

import { Pikaday } from "./../src/pikaday";

function getSut(opts?: any): Pikaday {
    return new Pikaday(opts);
}

const stubFunc = (...args: any[]) => {
    return args;
};
const spyFunc = (...args: any[]) => {
    return args;
};

describe("moment", () => {
    it("should be loaded", () => {
        expect(typeof moment).toBe("function");
    });
});

describe("Pikaday public method", () => {
    describe("#getDate()", () => {
        it("should return null if date not set", () => {
            const sut = getSut();
            const actual = sut.getDate();

            expect(actual).toBeNull();
        });
    });

    describe("#toString()", () => {
        it("should return empty string when date not set", () => {
            const sut = getSut();
            const actual = sut.toString();

            expect(actual).toEqual("");
        });

        it("should return date string, formatted by moment, when date is set", () => {
            const sut = getSut({ format: "DD-MM-YY" });
            const date = new Date(2014, 3, 25);
            sut.setDate(date);
            (sut as any).moment = moment;
            const actual = sut.toString();

            expect(actual).toEqual("25-04-14");
        });

        it("should use toString function if one is provided", () => {
            const opts: any = { toString: spyFunc };
            spyOn(opts, "toString");
            const sut = getSut(opts);
            const date = new Date();
            sut.setDate(date);
            sut.toString();

            expect(opts.toString).toHaveBeenCalled();
        });

        it("should pass current format option to the toString function", () => {
            const expectedFormat = "DD/MM/YYYY";
            const opts: any = { toString: spyFunc, format: expectedFormat };
            spyOn(opts, "toString");
            const sut = getSut(opts);
            const date: Date = new Date();
            sut.setDate(date);
            sut.toString();

            expect(opts.toString).toHaveBeenCalledWith(jasmine.anything(), expectedFormat);
        });

        it("should use parse function if one is provided", () => {
            const opts: any = { parse: spyFunc };
            spyOn(opts, "parse");
            const sut = getSut(opts);
            const mockField: any = { value: "", setAttribute: stubFunc, dispatchEvent: stubFunc };
            (sut as any).opts.field = mockField;
            (sut as any).onInputChange({});

            expect(opts.parse).toHaveBeenCalled();
        });

        it("should pass input value and current format to the parse function", () => {
            const expectedValue = "test value";
            const expectedFormat = "DD/MM/YYYY";
            const opts: any = { parse: spyFunc, format: expectedFormat };
            spyOn(opts, "parse");
            const sut = getSut(opts);
            const mockField: any = { value: expectedValue, setAttribute: stubFunc, dispatchEvent: stubFunc };
            (sut as any).opts.field = mockField;
            (sut as any).onInputChange({});

            expect(opts.parse).toHaveBeenCalledWith(expectedValue, expectedFormat);
        });
    });

    describe("When specifying minDate option in Constructor", () => {
        it("Should remove the time portion (flattening to midnight)", () => {
            const date = new Date(2015, 1, 17, 22, 10, 5);
            const expected = new Date(2015, 1, 17, 0, 0, 0);
            const sut = getSut({ minDate: date });
            const actual = (sut as any).opts.minDate;

            expect(actual).toEqual(expected);
        });
    });

    describe("#setMinDate()", () => {
        it("should flatten date to midnight ignoring time portion (consistent with minDate option in ctor)", () => {
            const date = new Date(2015, 1, 17, 22, 10, 5);
            const expected = new Date(2015, 1, 17, 0, 0, 0);
            const sut = getSut();
            sut.setMinDate(date);
            const actual = (sut as any).opts.minDate;

            expect(actual).toEqual(expected);
        });
    });
});
