import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../constants/formFields';
import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../test-utils/testMocks';

const app = testAppSetup();

describe(paths.NUMBER_OF_CHILDREN, () => {
  describe('GET', () => {
    it('should render number of children page', async () => {
      const response = await request(app).get(paths.NUMBER_OF_CHILDREN).expect('Content-Type', /html/);

      const dom = new JSDOM(response.text);

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('How many children is this for?');
      expect(dom.window.document.querySelector('h2')).toBeNull();
      expect(dom.window.document.querySelector(`#${formFields.NUMBER_OF_CHILDREN}`)).not.toHaveAttribute(
        'aria-describedby',
      );
    });

    it('should render error flash responses correctly', async () => {
      sessionMock.numberOfChildren = 4;

      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.NUMBER_OF_CHILDREN,
          type: 'field',
          value: 7,
        },
      ]);
      Object.assign(flashFormValues, [{ [formFields.NUMBER_OF_CHILDREN]: '7' }]);

      const dom = new JSDOM((await request(app).get(paths.NUMBER_OF_CHILDREN)).text);

      expect(dom.window.document.querySelector('h2')).toHaveTextContent('There is a problem');
      expect(dom.window.document.querySelector(`#${formFields.NUMBER_OF_CHILDREN}`)).toHaveValue('7');
      expect(dom.window.document.querySelector(`#${formFields.NUMBER_OF_CHILDREN}`)).toHaveAttribute(
        'aria-describedby',
        `${formFields.NUMBER_OF_CHILDREN}-error`,
      );
    });

    it('should render the previous value if it exists', async () => {
      const numberOfChildren = 4;

      sessionMock.numberOfChildren = numberOfChildren;

      const dom = new JSDOM((await request(app).get(paths.NUMBER_OF_CHILDREN)).text);

      expect(dom.window.document.querySelector(`#${formFields.NUMBER_OF_CHILDREN}`)).toHaveValue(`${numberOfChildren}`);
    });
  });

  describe('POST', () => {
    it.each(['', 'abc', '7', '6!', '0'])(
      "should reload page and set flash when the number of children is '%s'",
      async (numberOfChildren) => {
        await request(app)
          .post(paths.NUMBER_OF_CHILDREN)
          .send({ [formFields.NUMBER_OF_CHILDREN]: numberOfChildren })
          .expect(302)
          .expect('location', paths.NUMBER_OF_CHILDREN);

        expect(flashMock).toHaveBeenCalledWith('errors', [
          {
            location: 'body',
            msg: 'Invalid value',
            path: formFields.NUMBER_OF_CHILDREN,
            type: 'field',
            value: numberOfChildren,
          },
        ]);
        expect(flashMock).toHaveBeenCalledWith('formValues', { [formFields.NUMBER_OF_CHILDREN]: numberOfChildren });
      },
    );

    it.each([
      ['6', 6],
      ['1', 1],
      ['  2  ', 2],
    ])(
      "should redirect to about the children page and set session data if the number of children is '%s'",
      async (numberOfChildrenBody, numberOfChildren) => {
        await request(app)
          .post(paths.NUMBER_OF_CHILDREN)
          .send({ [formFields.NUMBER_OF_CHILDREN]: numberOfChildrenBody })
          .expect(302)
          .expect('location', paths.ABOUT_THE_CHILDREN);

        expect(sessionMock.numberOfChildren).toEqual(numberOfChildren);
      },
    );

    it("should reset the children's names when a new number of children is set", async () => {
      sessionMock.namesOfChildren = ['James', 'Rachel', 'Jack'];
      sessionMock.numberOfChildren = 3;

      await request(app)
        .post(paths.NUMBER_OF_CHILDREN)
        .send({ [formFields.NUMBER_OF_CHILDREN]: 2 })
        .expect(302)
        .expect('location', paths.ABOUT_THE_CHILDREN);

      expect(sessionMock.namesOfChildren).toBeUndefined();
      expect(sessionMock.numberOfChildren).toBe(2);
    });

    it("should not reset the children's names when the same number of children is set", async () => {
      const namesOfChildren = ['James', 'Rachel', 'Jack'];
      sessionMock.namesOfChildren = namesOfChildren;
      sessionMock.numberOfChildren = 3;

      await request(app)
        .post(paths.NUMBER_OF_CHILDREN)
        .send({ [formFields.NUMBER_OF_CHILDREN]: 3 })
        .expect(302)
        .expect('location', paths.ABOUT_THE_CHILDREN);

      expect(sessionMock.namesOfChildren).toEqual(namesOfChildren);
      expect(sessionMock.numberOfChildren).toBe(3);
    });
  });
});
