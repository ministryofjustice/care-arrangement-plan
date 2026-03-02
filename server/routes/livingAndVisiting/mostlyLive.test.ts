import { SessionData } from 'express-session';
import { JSDOM } from 'jsdom';
import request from 'supertest';

import { whereMostlyLive } from '../../@types/fields';
import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

const session: Partial<SessionData> = {
  namesOfChildren: ['James', 'Rachel', 'Jack'],
  numberOfChildren: 3,
  initialAdultName: 'Sarah',
  secondaryAdultName: 'Steph',
};

describe(paths.LIVING_VISITING_MOSTLY_LIVE, () => {
  describe('GET', () => {
    beforeEach(() => {
      Object.assign(sessionMock, structuredClone(session));
    });

    it('should render the mostly live page', async () => {
      const response = await request(app).get(paths.LIVING_VISITING_MOSTLY_LIVE).expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('Where will the children mostly live?');
      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toBeNull();
      expect(dom.window.document.querySelector(':checked')).toBeNull();
      expect(dom.window.document.querySelector('fieldset')).not.toHaveAttribute('aria-describedby');
      // Field names now use -0 suffix for the default/all children entry
      expect(dom.window.document.querySelector(`label[for="${formFields.MOSTLY_LIVE_WHERE}-0"]`)).toHaveTextContent(
        `With ${session.initialAdultName}`,
      );
      expect(dom.window.document.querySelector(`label[for="${formFields.MOSTLY_LIVE_WHERE}-0-2"]`)).toHaveTextContent(
        `With ${session.secondaryAdultName}`,
      );
      expect(dom.window.document.querySelector(`label[for="${formFields.MOSTLY_LIVE_WHERE}-0-3"]`)).toHaveTextContent(
        `They will split time between ${session.initialAdultName} and ${session.secondaryAdultName}`,
      );
      expect(dom.window.document.querySelector(`#${formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT}-0`)).not.toHaveAttribute(
        'aria-describedby',
      );
    });

    it('should render error flash responses correctly', async () => {
      const primaryError = 'errorOne';
      const secondaryError = 'errorTwo';
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: primaryError,
          path: `${formFields.MOSTLY_LIVE_WHERE}-0`,
          type: 'field',
        },
        {
          location: 'body',
          msg: secondaryError,
          path: `${formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT}-0`,
          type: 'field',
        },
      ]);

      const dom = new JSDOM((await request(app).get(paths.LIVING_VISITING_MOSTLY_LIVE)).text);

      expect(dom.window.document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent(
        'There is a problem',
      );
      expect(dom.window.document.querySelector('fieldset')).toHaveAttribute(
        'aria-describedby',
        `${formFields.MOSTLY_LIVE_WHERE}-0-error`,
      );
      expect(dom.window.document.querySelector(`#${formFields.MOSTLY_LIVE_WHERE}-0-error`)).toHaveTextContent(
        primaryError,
      );
      expect(dom.window.document.querySelector(`#${formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT}-0`)).toHaveAttribute(
        'aria-describedby',
        `${formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT}-0-error`,
      );
      expect(
        dom.window.document.querySelector(`#${formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT}-0-error`),
      ).toHaveTextContent(secondaryError);
    });

    it('should render field value flash responses correctly', async () => {
      const arrangement = 'arrangement';
      Object.assign(flashFormValues, [
        { [`${formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT}-0`]: arrangement, [`${formFields.MOSTLY_LIVE_WHERE}-0`]: 'other' },
      ]);

      sessionMock.livingAndVisiting = {
        mostlyLive: {
          default: {
            where: 'withInitial',
            describeArrangement: 'wrong arrangement',
          },
        },
      };

      const dom = new JSDOM((await request(app).get(paths.LIVING_VISITING_MOSTLY_LIVE)).text);

      // The "other" option is the 5th item, so it gets ID suffix -0-5
      expect(dom.window.document.querySelector(`#${formFields.MOSTLY_LIVE_WHERE}-0-5`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT}-0`)).toHaveValue(
        arrangement,
      );
    });

    it('should render field previous values correctly', async () => {
      const arrangement = 'arrangement';

      sessionMock.livingAndVisiting = {
        mostlyLive: {
          default: {
            where: 'other',
            describeArrangement: arrangement,
          },
        },
      };

      const dom = new JSDOM((await request(app).get(paths.LIVING_VISITING_MOSTLY_LIVE)).text);

      // The "other" option is the 5th item, so it gets ID suffix -0-5
      expect(dom.window.document.querySelector(`#${formFields.MOSTLY_LIVE_WHERE}-0-5`)).toBeChecked();
      expect(dom.window.document.querySelector(`#${formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT}-0`)).toHaveValue(
        arrangement,
      );
    });
  });

  describe('POST', () => {
    it('should reload page and set flash when the radio button is not filled', async () => {
      await request(app)
        .post(paths.LIVING_VISITING_MOSTLY_LIVE)
        .expect(302)
        .expect('location', paths.LIVING_VISITING_MOSTLY_LIVE);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Choose where the children will mostly live',
          path: `${formFields.MOSTLY_LIVE_WHERE}-0`,
          type: 'field',
        },
      ]);
    });

    it('should reload page and set flash when the radio button is other, but arrangements are not described', async () => {
      await request(app)
        .post(paths.LIVING_VISITING_MOSTLY_LIVE)
        .send({ [`${formFields.MOSTLY_LIVE_WHERE}-0`]: 'other' })
        .expect(302)
        .expect('location', paths.LIVING_VISITING_MOSTLY_LIVE);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Describe the living arrangement you are proposing',
          path: `${formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT}-0`,
          type: 'field',
          value: '',
        },
      ]);
    });

    it('should redirect to task list page if the page is correctly filled and other is selected', async () => {
      const where = 'other';
      const describeArrangement = 'arrangement';
      await request(app)
        .post(paths.LIVING_VISITING_MOSTLY_LIVE)
        .send({
          [`${formFields.MOSTLY_LIVE_WHERE}-0`]: where,
          [`${formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT}-0`]: describeArrangement,
        })
        .expect(302)
        .expect('location', paths.TASK_LIST);

      expect(sessionMock.livingAndVisiting).toEqual({
        mostlyLive: {
          default: {
            where,
            describeArrangement,
          },
        },
      });
    });

    it.each([
      [paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN, 'withInitial'],
      [paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN, 'withSecondary'],
      [paths.LIVING_VISITING_WHICH_SCHEDULE, 'split'],
    ])(
      'should redirect to %s if the page is correctly filled and %s is selected',
      async (expectedRedirect, selection) => {
        sessionMock.livingAndVisiting = {
          mostlyLive: { default: { where: 'other' } },
          overnightVisits: { willHappen: true },
        };

        await request(app)
          .post(paths.LIVING_VISITING_MOSTLY_LIVE)
          .send({
            [`${formFields.MOSTLY_LIVE_WHERE}-0`]: selection,
            [`${formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT}-0`]: 'arrangement',
          })
          .expect(302)
          .expect('location', expectedRedirect);

        expect(sessionMock.livingAndVisiting).toEqual({
          mostlyLive: {
            default: {
              where: selection,
            },
          },
        });
      },
    );

    it('should not reset the livingAndVisiting data if the same option is set', async () => {
      const where: whereMostlyLive = 'withInitial';
      const initialLivingAndVisiting = {
        mostlyLive: { default: { where } },
        overnightVisits: { willHappen: true },
      };

      sessionMock.livingAndVisiting = initialLivingAndVisiting;

      await request(app)
        .post(paths.LIVING_VISITING_MOSTLY_LIVE)
        .send({ [`${formFields.MOSTLY_LIVE_WHERE}-0`]: where })
        .expect(302)
        .expect('location', paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN);

      expect(sessionMock.livingAndVisiting).toEqual(initialLivingAndVisiting);
    });

    it('should not reset the livingAndVisiting data if the option is other', async () => {
      const where: whereMostlyLive = 'other';
      const arrangement = 'new arrangement';

      sessionMock.livingAndVisiting = {
        mostlyLive: { default: { where, describeArrangement: 'old arrangement' } },
      };

      await request(app)
        .post(paths.LIVING_VISITING_MOSTLY_LIVE)
        .send({ [`${formFields.MOSTLY_LIVE_WHERE}-0`]: where, [`${formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT}-0`]: arrangement });

      expect(sessionMock.livingAndVisiting).toEqual({
        mostlyLive: {
          default: {
            where,
            describeArrangement: arrangement,
          },
        },
      });
    });
  });
});
