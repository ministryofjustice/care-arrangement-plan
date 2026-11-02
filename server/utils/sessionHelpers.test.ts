import { CAPSession } from '../@types/session';

import {
  childHealthComplete,
  childHealthNeedsComplete,
  mostlyLiveComplete,
  willChangeDuringSchoolHolidaysComplete,
} from './sessionHelpers';

describe('sessionHelpers', () => {
  describe('mostlyLiveComplete', () => {
    it('returns false if mostly live is not filled out', () => {
      expect(mostlyLiveComplete({})).toBe(false);
    });

    it('returns true if mostly live is other', () => {
      const session: Partial<CAPSession> = {
        livingAndVisiting: {
          mostlyLive: {
            where: 'other',
            describeArrangement: 'arrangement',
          },
        },
      };

      expect(mostlyLiveComplete(session)).toBe(true);
    });

    it('returns false for split living if the schedule is not complete', () => {
      const session: Partial<CAPSession> = {
        livingAndVisiting: {
          mostlyLive: {
            where: 'split',
          },
        },
      };

      expect(mostlyLiveComplete(session)).toBe(false);
    });

    it('returns true for split living if the schedule is complete', () => {
      const session: Partial<CAPSession> = {
        livingAndVisiting: {
          mostlyLive: {
            where: 'split',
          },
          whichSchedule: {
            noDecisionRequired: true,
          },
        },
      };

      expect(mostlyLiveComplete(session)).toBe(true);
    });

    it("returns true if visits won't happen", () => {
      const session: Partial<CAPSession> = {
        livingAndVisiting: {
          mostlyLive: {
            where: 'withInitial',
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
            where: 'withInitial',
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
            where: 'withInitial',
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
            where: 'withInitial',
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
            where: 'withInitial',
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
            where: 'withInitial',
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
            noDecisionRequired: true,
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

  describe('childHealthComplete', () => {
    it('returns false when child health has not been answered', () => {
      expect(childHealthComplete({})).toBe(false);
      expect(childHealthComplete({ childHealth: { noDecisionRequired: false, options: [] } })).toBe(false);
    });

    it('returns true when an option has been saved', () => {
      expect(childHealthComplete({ childHealth: { noDecisionRequired: false, options: ['bothParents'] } })).toBe(true);
    });

    it('returns true when the question was skipped', () => {
      expect(childHealthComplete({ childHealth: { noDecisionRequired: true } })).toBe(true);
    });
  });

  describe('childHealthNeedsComplete', () => {
    it('returns false when health needs have not been answered', () => {
      expect(childHealthNeedsComplete({})).toBe(false);
      expect(childHealthNeedsComplete({ childHealthNeeds: { noDecisionRequired: false } })).toBe(false);
    });

    it('returns true when a description has been saved', () => {
      expect(
        childHealthNeedsComplete({ childHealthNeeds: { noDecisionRequired: false, description: 'Inhaler' } }),
      ).toBe(true);
    });

    it('returns true when the question was skipped', () => {
      expect(childHealthNeedsComplete({ childHealthNeeds: { noDecisionRequired: true } })).toBe(true);
    });

    it('returns true when health needs were saved on the child health answer', () => {
      expect(childHealthNeedsComplete({ childHealth: { healthNeeds: 'Asthma' } })).toBe(true);
    });
  });
});
