import CgdpJsx from '../../core/jsx';

// The array of media in the response
// This is where the images are for the definition
type ResponseMediaArrayObject = {
	Type: string;
	Caption: string;
	Alt: string;
	ImageSources: Array<{
		Size: string;
		Src: string;
	}>;
};

// The props of the modal component
type CgdpModalProps = {
	term: string;
	termPronounced?: string;
	audioLink?: string;
	termDefinition: string;
	media: Array<ResponseMediaArrayObject>;
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
	media,
}) => {
	// Get Page Language for audio svg screen reader text
	const renderMedia = (media: Array<ResponseMediaArrayObject>) => {
		const images = media.filter((item) => item.Type === 'Image');
		const imageHtml = images.map((image) => {
			// This comes from glossaryPopups, gets image source based on "size"
			const imageSrc = image.ImageSources.filter(
				(src) => src.Size === '571'
			).shift();
			if (!imageSrc) return;
			return (
				<div className="cgdp-image">
					<figure>
						<img src={imageSrc.Src} alt={image.Alt} />
						{image.Caption && (
							<figcaption className="cgdp-image__caption">
								<div className="cgdp-image__caption-text">{image.Caption}</div>
							</figcaption>
						)}
					</figure>
				</div>
			);
		});
		return imageHtml;
	};
	const lang = document.documentElement.lang;
	const modalHeading = lang === 'es' ? 'Definición' : 'Definition';
	const srText =
		lang === 'es' ? 'escuchar la pronunciación' : 'Listen to pronunciation';
	return (
		<div>
			{audioLink && (
				<audio id="definition-audio">
					<source src={audioLink} type="audio/mp3" />
				</audio>
			)}
			<h3 className="nci-heading-h3">{modalHeading}: </h3>
			<dl>
				<dt>
					<dfn className="cgdp-definition-term">{term}</dfn>
					{termPronounced && <span> {termPronounced} </span>}
					<button
						className="cgdp_audiofile"
						onClick={() => {
							const audio = document.getElementById(
								'definition-audio'
							) as HTMLAudioElement;
							if (!audio) return;
							audio.play();
						}}
					>
						<span className="usa-sr-only">{srText}</span>
					</button>
				</dt>
				<dd>{termDefinition}</dd>
			</dl>
			{renderMedia(media)}
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
	termDefinition: string,
	media: Array<ResponseMediaArrayObject>
): HTMLElement => {
	const modalContent = (
		<ModalContentSnippet
			term={term}
			termPronounced={termPronounced}
			audioLink={audioLink}
			termDefinition={termDefinition}
			media={media}
		/>
	);
	return modalContent as unknown as HTMLElement;
};

export default getModalContentSnippet;
