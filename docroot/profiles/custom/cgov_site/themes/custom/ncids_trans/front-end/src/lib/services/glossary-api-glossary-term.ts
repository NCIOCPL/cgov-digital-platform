import {
	MediaType,
	GlossaryAudience,
	RelatedResourceType,
} from './glossary-api-enums';

export interface GlossaryImageMedia extends GlossaryMedia {
	Caption: string;
	Alt: string;
	ImageSources: Array<{
		Size: string;
		Src: string;
	}>;
}

// TODO: Need to define this type if used in the future
export interface GlossaryVideoMedia extends GlossaryMedia {
	unique_id: string;
}

export interface GlossaryMedia {
	Type: MediaType;
}

export type GlossaryTerm = {
	termId: number;
	language: string;
	dictionary: string;
	audience: GlossaryAudience;
	termName: string;
	firstLetter: string;
	prettyUrlName: string;
	pronunciation: {
		key: string;
		audio: string;
	};
	definition: {
		html: string;
		text: string;
	};
	otherLanguages: [
		{
			language: string;
			termName: string;
			prettyUrlName: string;
		}
	];
	relatedResources: [
		{
			type: RelatedResourceType;
			text: string;
		}
	];
	media: Array<GlossaryMedia>;
};
