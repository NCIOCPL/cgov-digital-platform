import CgdpJsx from '../../core/jsx';
import type {
	GlossaryImageMedia,
	GlossaryMedia,
} from '../../services/glossary-api-glossary-term';
import { MediaType } from '../../services/glossary-api-enums';

// The props of the modal component
type CgdpModalProps = {
	term: string;
	termPronounced?: string;
	audioLink?: string;
	termDefinitionHtml: string;
	media: Array<GlossaryMedia>;
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
	termDefinitionHtml,
	media,
}) => {
	// Get Page Language for audio svg screen reader text
	const renderMedia = (media: Array<GlossaryMedia>) => {
		const images = media?.filter(
			(item) => item.Type === MediaType.Image
		) as Array<GlossaryImageMedia>;
		const imageHtml = images?.map((image) => {
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
			<div className="cgdp-definition__heading">{modalHeading}</div>
			{audioLink && (
				<audio id="definition-audio">
					<source src={audioLink} type="audio/mp3" />
				</audio>
			)}
			<dl>
				<dt>
					<dfn className="cgdp-definition-term">{term}</dfn>
					{termPronounced && <span> {termPronounced} </span>}
					{audioLink && (
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
					)}
				</dt>
				<dd dangerouslySetInnerHTML={{ __html: termDefinitionHtml }} />
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
	termDefinitionHtml: string,
	media: Array<GlossaryMedia>
): HTMLElement => {
	const modalContent = (
		<ModalContentSnippet
			term={term}
			termPronounced={termPronounced}
			audioLink={audioLink}
			termDefinitionHtml={termDefinitionHtml}
			media={media}
		/>
	);
	return modalContent as unknown as HTMLElement;
};

export default getModalContentSnippet;
