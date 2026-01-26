import { CAPSession } from '../@types/session';

import { mostlyLiveComplete, willChangeDuringSchoolHolidaysComplete } from './sessionHelpers';

describe('sessionHelpers', () => {
  describe('mostlyLiveComplete', () => {
    it('returns false if mostly live is not filled out', () => {
      expect(mostlyLiveComplete({})).toBe(false);
    });

    it('returns true if mostly live is other', () => {
      const session: Partial<CAPSession> = {
        livingAndVisiting: {
          mostlyLive: {
            default: {
              where: 'other',
              describeArrangement: 'arrangement',
            },
          },
        },
      };

      expect(mostlyLiveComplete(session)).toBe(true);
    });

    it('returns false for split living if the schedule is not complete', () => {
      const session: Partial<CAPSession> = {
        livingAndVisiting: {
          mostlyLive: {
            default: {
              where: 'split',
            },
          },
        },
      };

      expect(mostlyLiveComplete(session)).toBe(false);
    });

    it('returns true for split living if the schedule is complete', () => {
      const session: Partial<CAPSession> = {
        livingAndVisiting: {
          mostlyLive: {
            default: {
              where: 'split',
            },
          },
          whichSchedule: {
            default: {
              noDecisionRequired: true,
            },
          },
        },
      };

      expect(mostlyLiveComplete(session)).toBe(true);
    });

    it("returns true if visits won't happen", () => {
      const session: Partial<CAPSession> = {
        livingAndVisiting: {
          mostlyLive: {
            default: {
              where: 'withInitial',
            },
          },
          overnightVisits: {
            willHappen: false,
          },
          daytimeVisits: {
            willHappen: false,
          },
        },
      };

      expect(mostlyLiveComplete(session)).toBe(true);
    });

    it('returns true if visits will happen', () => {
      const session: Partial<CAPSession> = {
        livingAndVisiting: {
          mostlyLive: {
            default: {
              where: 'withInitial',
            },
          },
          overnightVisits: {
            willHappen: true,
            whichDays: {
              noDecisionRequired: true,
            },
          },
          daytimeVisits: {
            willHappen: true,
            whichDays: {
              noDecisionRequired: true,
            },
          },
        },
      };

      expect(mostlyLiveComplete(session)).toBe(true);
    });

    it("returns false if overnight visits aren't decided", () => {
      const session: Partial<CAPSession> = {
        livingAndVisiting: {
          mostlyLive: {
            default: {
              where: 'withInitial',
            },
          },
          daytimeVisits: {
            willHappen: false,
          },
        },
      };

      expect(mostlyLiveComplete(session)).toBe(false);
    });

    it("returns false if overnight visits will happen but aren't decided", () => {
      const session: Partial<CAPSession> = {
        livingAndVisiting: {
          mostlyLive: {
            default: {
              where: 'withInitial',
            },
          },
          overnightVisits: {
            willHappen: true,
          },
          daytimeVisits: {
            willHappen: false,
          },
        },
      };

      expect(mostlyLiveComplete(session)).toBe(false);
    });

    it("returns false if daytime visits aren't decided", () => {
      const session: Partial<CAPSession> = {
        livingAndVisiting: {
          mostlyLive: {
            default: {
              where: 'withInitial',
            },
          },
          overnightVisits: {
            willHappen: false,
          },
        },
      };

      expect(mostlyLiveComplete(session)).toBe(false);
    });

    it("returns false if daytime visits will happen but aren't decided", () => {
      const session: Partial<CAPSession> = {
        livingAndVisiting: {
          mostlyLive: {
            default: {
              where: 'withInitial',
            },
          },
          overnightVisits: {
            willHappen: false,
          },
          daytimeVisits: {
            willHappen: true,
          },
        },
      };

      expect(mostlyLiveComplete(session)).toBe(false);
    });
  });

  describe('willChangeDuringSchoolHolidaysComplete', () => {
    test('returns false if the will change during holidays is not filled out', () => {
      const session: Partial<CAPSession> = {};

      expect(willChangeDuringSchoolHolidaysComplete(session)).toBe(false);
    });

    test('returns false if the will change during holidays is true but the how change is not filled out', () => {
      const session: Partial<CAPSession> = {
        handoverAndHolidays: {
          willChangeDuringSchoolHolidays: {
            willChange: true,
            noDecisionRequired: false,
          },
        },
      };

      expect(willChangeDuringSchoolHolidaysComplete(session)).toBe(false);
    });

    test('returns true if the will change during holidays is true and the how change is filled out', () => {
      const session: Partial<CAPSession> = {
        handoverAndHolidays: {
          willChangeDuringSchoolHolidays: {
            willChange: true,
            noDecisionRequired: false,
          },
          howChangeDuringSchoolHolidays: {
            default: {
              noDecisionRequired: true,
            },
          },
        },
      };

      expect(willChangeDuringSchoolHolidaysComplete(session)).toBe(true);
    });

    test('returns true if the will change during holidays is false', () => {
      const session: Partial<CAPSession> = {
        handoverAndHolidays: {
          willChangeDuringSchoolHolidays: {
            willChange: false,
            noDecisionRequired: false,
          },
        },
      };

      expect(willChangeDuringSchoolHolidaysComplete(session)).toBe(true);
    });

    test('returns true if the will change during holidays is no decision required', () => {
      const session: Partial<CAPSession> = {
        handoverAndHolidays: {
          willChangeDuringSchoolHolidays: {
            noDecisionRequired: true,
          },
        },
      };

      expect(willChangeDuringSchoolHolidaysComplete(session)).toBe(true);
    });
  });
});
