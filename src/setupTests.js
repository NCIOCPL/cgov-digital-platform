import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });
//
// Treat calls to console.error as test failures
//
// If you need to test error handling in a component
// then mock console.error inside your unit test,
// or check that the functions are throwing
let error = console.error;
console.error = function(message) {
    error.apply(console, arguments); // keep default behaviour
    throw message instanceof Error ? message : new Error(message);
};
