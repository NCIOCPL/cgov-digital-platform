import { reducer, defaultState } from '../form';

import { UPDATE_FORM, CLEAR_FORM } from '../../identifiers';

// const mockForm = {
//   type: 'Bartholin Gland Transitional Cell Carcinoma',
//   age: '55',
//   zip: '10001',
// };

describe('Search reducer', () => {
  it('has default state', () => {
    expect(reducer(defaultState, {})).toMatchSnapshot();
  });

  it('does not alter state if action type is missing', () => {
    const action = {
      type: undefined,
      payload: ['foo'],
    };
    const newState = reducer(defaultState, action);
    expect(newState).toEqual(defaultState);
  });

  it('updates state when form is cleared', () => {
    const oldState = { foo: 'bar' };
    const action = { type: CLEAR_FORM };
    const newState = reducer(oldState, action);
    expect(newState).toEqual(defaultState);
  });

  it('updates state when form is updated', () => {
    const oldState = Object.assign({}, defaultState);
    const action = {
      type: UPDATE_FORM,
      payload: {
        field: 'foo',
        value: 'bar',
      },
    };
    const newState = reducer(oldState, action);
    expect(newState.foo).toBe('bar');
  });
});
