import CgdpJsx from '../../core/jsx';

type CgdpModalProps = {
	term: string;
	termPronounced: string;
	audioLink: string;
	termDefinition: string;
};

// The HTML Snippet that will be injected into the modal
/**
 *
 * @param term (string) the term being defined
 * @param termPronounced (string) the pronunciation of the term being defined
 * @param audioLink (string) the link to the audio file for the term
 * @param termDefinition (string) the definition of the term
 * @returns A React Component of the modal content
 */
const ModalContentSnippet: React.FunctionComponent<CgdpModalProps> = ({
	term,
	termPronounced,
	audioLink,
	termDefinition,
}) => {
	//const srText = lang === 'es' ? 'escuchar la pronunciación' : 'Listen to pronunciation';
	return (
		<div>
			<audio id="definition-audio">
				<source src={audioLink} type="audio/mp3" />
			</audio>
			<dl>
				<div>Definition: </div>
				<dt className="cgdp-definition-term">{term}</dt> {termPronounced}{' '}
				<a
					href="javascript:void(0)"
					//className="CDR_audiofile"
					onClick={() => {
						const audio = document.getElementById(
							'definition-audio'
						) as HTMLAudioElement;
						audio.play();
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						className="usa-icon"
					>
						<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
					</svg>
					<span className="usa-sr-only">listen</span>
				</a>
				<dd>{termDefinition}</dd>
			</dl>
		</div>
	);
};

/**
 *
 * @param term (string) the term being defined
 * @param termPronounced (string) the pronunciation of the term being defined
 * @param audioLink (string) the link to the audio file for the term
 * @param termDefinition (string) the definition of the term
 * @returns An HTMLElement of the modal content
 */
const getModalContentSnippet = (
	term: string,
	termPronounced: string,
	audioLink: string,
	termDefinition: string
): HTMLElement => {
	const modalContent = (
		<ModalContentSnippet
			term={term}
			termPronounced={termPronounced}
			audioLink={audioLink}
			termDefinition={termDefinition}
		/>
	);
	return modalContent as unknown as HTMLElement;
};

export default getModalContentSnippet;
