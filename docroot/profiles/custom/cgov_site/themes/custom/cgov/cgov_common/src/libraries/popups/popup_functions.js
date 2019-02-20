import $ from 'jquery';
import dictionary from 'Core/libraries/dictionaryServices';
import queryString from 'query-string';
import * as config from 'Core/libraries/nciConfig/NCI.config';
import linkAudioPlayer from 'Core/libraries/linkAudioPlayer/linkAudioPlayer';
import NCIModal from 'Core/libraries/modal';


const lang = $('html').attr('lang') || 'en';
// Set the language for finding the dictionary term/definition
let longLang = 'English'; 
if (lang === 'es') {
	longLang = 'Spanish';
}

let modal = new NCIModal();

const popupFunctions = () => {

	// get the full definition from the dictionary service
	const _getDefinition = (term) => {
		return dictionary.search('term', term, longLang, 'exact');
	};
	// get the full definition from the dictionary service
	const _getTerm = (lookup,id) => {
		return dictionary.getTerm(lookup, id, longLang);
	};

	const popWindow = (type, urlargs) => {
			
		if (type === "definition") {
			let term = urlargs.replace(/\s/g, '+');
			$.when(_getDefinition(term)).done(function (termObject) {
				if (termObject.result && termObject.result.length > 0) {
					// if we have a term in our return JSON, trigger the modal which will render the JSON data
					triggerModal(termObject.result[0].term);
				}
			});

		} else if (type === "help") {
			const searchHelpURL = '/Common/PopUps/popHelp.html';

			$.ajax({
				url:searchHelpURL,
				dataType: 'html',
				success: (response) => {
					// extract the body content from html document
					const pattern = /<body[^>]*>((.|[\n\r])*)<\/body>/im;
					const content = pattern.exec(response)[1];
					triggerModal(content);
				}
			});
			
		} else if (type === "defbyid") {
			// parse querystring so we can get definition id and dictionary
			let params = queryString.parse(urlargs);
			// id's are prefixed with "CDR0000" in the html but the backend service errors out if included in request
			let id = Object.keys(params)[0].replace("CDR0000",''); 
			// Cancer.gov is not defined as a dictionary in DictionaryService so we assign it 'term'
			let lookup = 'term';
			if(params.dictionary && params.dictionary !== 'Cancer.gov') {
				lookup = params.dictionary;
			}

			// fetch the term data from the service using ajax
			$.when(_getTerm(lookup,id)).catch(function(jqXHR, textStatus, error){
				console.log(`dictionary request failed. lookup:${lookup}, id:${id}`);
				console.log(textStatus,error);
			}).done(function (termObject) {
				//TODO: error returns 404 html page, not an error object
				if (termObject.term) {
					// if we have a term in our return JSON, trigger the modal which will render the JSON data
					triggerModal(termObject.term);
				}
			});
		} else {
			// fallback?
			window.open(urlargs, '', 'scrollbars=yes,resizable=yes,width=550,height=550');
		}
	}

	const triggerModal = (term) => {

		let content = typeof term === "object" ? renderTerm(term) : term;

		modal.setContent(content);
		modal.showModal();

		// After the template has been rendered, initialize JS modules

		// initialize audio player
		if(!!term.pronunciation) {
			linkAudioPlayer(".modal__content .CDR_audiofile");
		}

		// initialize video player
		if(!!term.videos && term.videos.length) {
			flexVideo();
		}
	}

	const renderTerm = (term) => {
		// render any images
		const renderImages = (images) => {
			//TODO: render as a carousel if more than two images?
			let template = `
				${images.map(item => `<figure><img src="https://www.cancer.gov${item.ref}" alt="${item.alt}" /><figcaption><div class="caption-container">${item.caption}</div></figcaption></figure>`).join('')}
			`;
			return template
    }
    
		// this is the complete template that will be rendered to the dialog popup. It will conditionally check for data values before attempting to render anything. This way we can avoid property undefined errors and empty DOM nodes.
		let template = `
			<dl>
				<dt class="term">
					<div class="title">${config.lang.Definition_Title[lang]}:</div>
					<dfn>${term.term}</dfn>
					${term.pronunciation ? `<span class="pronunciation">${term.pronunciation.key} <a href="https://www.cancer.gov${term.pronunciation.audio}" class="CDR_audiofile"><span class="hidden">listen</span></a></span>` : ''}
				</dt>
				${term.definition.html ? `<dd class="definition">${term.definition.html}</dd>` : ''}
				${!!term.images && !!term.images.length ? renderImages(term.images) : ''}
			</dl>
		`;

		return template;
	}

	window.popWindow = popWindow;


	function dynPopWindow(url, name, windowAttributes){
		// just forwarding this hard coded method to popWindow. All instances of dynPopWindow are for Search Help currently
		const type = url.match('Help.aspx').length ? 'help' : 'popup';
		popWindow(type,url);
	}

	window.dynPopWindow = dynPopWindow;
}

export default popupFunctions;