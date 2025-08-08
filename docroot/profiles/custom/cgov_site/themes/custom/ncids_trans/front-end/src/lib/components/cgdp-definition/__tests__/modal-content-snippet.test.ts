import '@testing-library/jest-dom';
import getModalContentSnippet from '../modal-content-snippet';
import { GlossaryMedia } from 'src/lib/services/glossary-api-glossary-term';

const mockImagesInResponse = [
	{
		Type: 'Image',
		Caption: 'The Image Caption',
		Alt: 'The Image Alt Text',
		ImageSources: [
			{
				Size: '571',
				Src: 'https://nci-media.cancer.gov/pdq/media/images/764135-571.jpg',
			},
		],
	} as GlossaryMedia,
] as GlossaryMedia[];

describe('modal-content-snippet', () => {
	it('should render the appropriate html from the data', () => {
		const element = getModalContentSnippet(
			'term',
			'term pronounced,',
			'https://nci-media.cancer.gov/pdq/media/audio/705162.mp3',
			'term definition',
			mockImagesInResponse
		);
		const termText = element.querySelector(
			'.cgdp-definition-term'
		)?.textContent;
		expect(termText).toBe('term');
	});
	// We'll need a test for playing the audio from the SVG click
});
