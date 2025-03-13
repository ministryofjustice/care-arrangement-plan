import { mostlyLiveComplete, willChangeDuringSchoolHolidaysComplete } from './sessionHelpers'
import { CAPSession } from '../@types/session'

describe('sessionHelpers', () => {
  describe('mostlyLiveComplete', () => {
    it('returns false if mostly live is not filled out', () => {
      expect(mostlyLiveComplete({})).toEqual(false)
    })

    it('returns true if mostly live is other', () => {
      const session: Partial<CAPSession> = {
        livingAndVisiting: {
          mostlyLive: {
            where: 'other',
            describeArrangement: 'arrangement',
          },
        },
      }

      expect(mostlyLiveComplete(session)).toEqual(true)
    })

    it('returns false for split living if the schedule is not complete', () => {
      const session: Partial<CAPSession> = {
        livingAndVisiting: {
          mostlyLive: {
            where: 'split',
          },
        },
      }

      expect(mostlyLiveComplete(session)).toEqual(false)
    })

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
      }

      expect(mostlyLiveComplete(session)).toEqual(true)
    })

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
      }

      expect(mostlyLiveComplete(session)).toEqual(true)
    })

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
      }

      expect(mostlyLiveComplete(session)).toEqual(true)
    })

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
      }

      expect(mostlyLiveComplete(session)).toEqual(true)
    })

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
      }

      expect(mostlyLiveComplete(session)).toEqual(false)
    })

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
      }

      expect(mostlyLiveComplete(session)).toEqual(false)
    })

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
      }

      expect(mostlyLiveComplete(session)).toEqual(false)
    })

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
      }

      expect(mostlyLiveComplete(session)).toEqual(false)
    })
  })

  describe('willChangeDuringSchoolHolidaysComplete', () => {
    test('returns false if the will change during holidays is not filled out', () => {
      const session: Partial<CAPSession> = {}

      expect(willChangeDuringSchoolHolidaysComplete(session)).toEqual(false)
    })

    test('returns false if the will change during holidays is true but the how change is not filled out', () => {
      const session: Partial<CAPSession> = {
        handoverAndHolidays: {
          willChangeDuringSchoolHolidays: {
            willChange: true,
            noDecisionRequired: false,
          },
        },
      }

      expect(willChangeDuringSchoolHolidaysComplete(session)).toEqual(false)
    })

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
      }

      expect(willChangeDuringSchoolHolidaysComplete(session)).toEqual(true)
    })

    test('returns true if the will change during holidays is false', () => {
      const session: Partial<CAPSession> = {
        handoverAndHolidays: {
          willChangeDuringSchoolHolidays: {
            willChange: false,
            noDecisionRequired: false,
          },
        },
      }

      expect(willChangeDuringSchoolHolidaysComplete(session)).toEqual(true)
    })

    test('returns true if the will change during holidays is no decision required', () => {
      const session: Partial<CAPSession> = {
        handoverAndHolidays: {
          willChangeDuringSchoolHolidays: {
            noDecisionRequired: true,
          },
        },
      }

      expect(willChangeDuringSchoolHolidaysComplete(session)).toEqual(true)
    })
  })
})
