import CgdpJsx from '..';

import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, screen } from '@testing-library/dom';

describe('eddl-util', () => {
	afterEach(() => {
		// Hack to clean out the dom.
		document.getElementsByTagName('body')[0].innerHTML = '';
		jest.resetAllMocks();
	});

	it('renders html correctly', async () => {
		const myComponent = <div id="foo">Hello World</div>;
		const el = myComponent as unknown as HTMLElement;
		expect(el.outerHTML).toBe('<div id="foo">Hello World</div>');
	});

	it('supports click handlers', async () => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		const mockHandler = jest.fn(() => {});

		const myComponent = (
			<button onClick={mockHandler} id="foo">
				Hello World
			</button>
		);
		const el = myComponent as unknown as HTMLElement;

		document.body.appendChild(el);

		const btn = await screen.findByRole('button', {});

		fireEvent.click(btn);

		expect(mockHandler).toHaveBeenCalled();
	});

	it('handles empty props', async () => {
		const myComponent = <div></div>;
		const el = myComponent as unknown as HTMLElement;
		expect(el.outerHTML).toBe('<div></div>');
	});
});
