CKEDITOR.dialog.add('glossifyDialog', function(editor) {
  // console.log(editor)
  // console.log(CKEDITOR)
  // if (typeof editor.config.contentsCss === 'object') {
  //   editor.config.contentsCss.push(CKEDITOR.getUrl('/profiles/custom/cgov_site/modules/custom/cgov_ckeditor/js/plugins/cgov_glossifier/dialogs/reference/old.css'));
  // }
  // editor.addContentsCss('/profiles/custom/cgov_site/modules/custom/cgov_ckeditor/js/plugins/cgov_glossifier/dialogs/reference/old.css')
  return {
    title: 'Glossify Page',
    buttons: [ CKEDITOR.dialog.cancelButton, CKEDITOR.dialog.okButton ],
    onShow: requestGlossification,
    onOk: saveGlossificationChoices,
    // minWidth: 300,
    // minHeight: 300,
    // width: "40vw",
    // height: "75vh",
    resizable: CKEDITOR.DIALOG_RESIZE_BOTH,
    contents: [
      {
        id: 'tab_1',
        label: 'Tab 1',
        title: 'Tab 1 Title',
        accessKey: 'X',
        elements: [
          {
            id: 'html',
            type: 'html',
            label: 'Select Elements to Glossify',
            html: '<div class="glossify-dialog-container"><div class="spinner">Loading...</div></div>',
            style: 'width: 75vw; height: 75vh;'
          }
        ],
      }
    ]
  };
})

function ReplaceWithPolyfill() {
  'use-strict'; // For safari, and IE > 10
  var parent = this.parentNode, i = arguments.length, currentNode;
  if (!parent) return;
  if (!i) // if there are no arguments
    parent.removeChild(this);
  while (i--) { // i-- decrements i and returns the value of i before the decrement
    currentNode = arguments[i];
    if (typeof currentNode !== 'object'){
      currentNode = this.ownerDocument.createTextNode(currentNode);
    } else if (currentNode.parentNode){
      currentNode.parentNode.removeChild(currentNode);
    }
    // the value of "i" below is after the decrement
    if (!i) // if currentNode is the first argument (currentNode === arguments[0])
      parent.replaceChild(currentNode, this);
    else // if currentNode isn't the first
      parent.insertBefore(this.previousSibling, currentNode);
  }
}
if (!Element.prototype.replaceWith)
    Element.prototype.replaceWith = ReplaceWithPolyfill;
if (!CharacterData.prototype.replaceWith)
    CharacterData.prototype.replaceWith = ReplaceWithPolyfill;
if (!DocumentType.prototype.replaceWith)
    DocumentType.prototype.replaceWith = ReplaceWithPolyfill;

// IE11 for the win! Need a way to handle nodelists with modern array methods.
function arrayifyNodelist(nodeList){
  return Array.prototype.slice.call(nodeList, 0);
}

function requestGlossification() {
  // This is how we blow away the reset CSS
  // But we'll need to recreate a lot of it to retain the drupal UI look.
  // this.getElement().removeClass('cke_reset_all');
  // This should eventually allow us to hook in and override. Still not working.
  // this.getElement().addClass("glossify-dialog-container")

  // ### This gets us the html content of the editor that called the dialog.
  const rawBody = this.getParentEditor().getData();
  // TODO: Confirm whether getting the langcode from the editor instance is sufficient.
  // https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#property-langCode
  const language = this.getParentEditor().langCode;
  const preparedBody = cGovPrepareStr(rawBody);

  function processResponse(responseBody) {
    const dialogBody = createDialogBodyHtml(preparedBody, responseBody, language);
    // Each CKEditor instance builds its own dialog element at the bottom of the page.
    // There is no standard way of targeting them for reuse.
    // This lets us stay within the scope of the correct dialog. Other methods built into the CKEditor dialog
    // element like getContentElement come with their own complications. By using the $ attribute
    // we have access to native DOM elements and bypass the CKEditor API.
    htmlArea = this.getElement().$.querySelector('.glossify-dialog-container');
    htmlArea.innerHTML = dialogBody;

    // We used a simple span with a rel=glossified attribute to "remember" which terms
    // were previously glossified. We need to first set the input to 'checked' to reflect its
    // previously selected state and then remove the span tag.
    const previouslyGlossifiedTerms = this.getElement().$.querySelectorAll("span[rel='glossified']");
    const previouslyGlossifiedTermsArray = arrayifyNodelist(previouslyGlossifiedTerms);
    previouslyGlossifiedTermsArray.forEach(function(span) {
      const termText = span.dataset.term;
      const termId = span.dataset.id;
      const termLanguage = span.dataset.language;
      const labelString = createGlossificationTermOptionElementString(termText, termId, termLanguage);
      // Because we have a string instead of a DOM element to work with, we're going to use a little
      // trickery here to get a DOM element by first inserting the string and then reextracting it
      // as an element (which lets us programmatically check the input and use the replaceWith method.)
      span.innerHTML = labelString;
      const labelTag = span.querySelector('label');
      const inputTag = labelTag.querySelector('input');
      inputTag.checked = true;
      span.replaceWith(labelTag);
    })
  }

  // We have to nest our request in a preliminary request so that we can first
  // retrieve the necessary csrf token to make an authenticated request to the api.
  // NOTE: Nested jquery calls make it rough to main the this context for using getElement later
  const this_editor = this;
  jQuery.get(Drupal.url('session/token'))
    .done(function (data) {
      const csrfToken = data;
      jQuery.ajax({
        context: this_editor,
        url: '/pdq/api/glossifier',
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          'X-CSRF-Token': csrfToken,
        },
        data: JSON.stringify({
          'fragment': preparedBody,
          'languages': [
            'en'
          ],
          'dictionaries': [
            'Cancer.gov'
          ],
        }),
      })
      .done(function(data) {
        processResponse.call(this, data)
      })
      // TODO: Error Handling for non 200
    });
    // TODO: Error handling for non 200
}

function createGlossificationTermOptionElementString(termText, termId, termLanguage, isFirstOccurenceOfTerm){
  // Create element to wrap term for checkbox selection
  // IE Add in inputs now with all the rest of the attributes as data attributes.
  // Then when I strip the checkboxes I can build the anchor tag.
  // This is because, even on percussion now, clicking the links causes you to be
  // directed to an error page. That would avoid the issue.
  const firstStyles = isFirstOccurenceOfTerm ? "background-color: #ffff00;" : "";
  const labelStyle = "display: inline-block;" + firstStyles;
  const wrappedTerm =
    "<label "
    + "data-term-id='" + termId + "' "
    + "data-language='" + termLanguage + "' "
    + "style='"
    + labelStyle
    + "' data-glossify-label>"
    + termText
    + "<input type='checkbox'"
    + "/>"
    + "</label>";
  return wrappedTerm;
}

// Create a glossified term.
// Future revisions to change the form of these links (for modal purposes
// possibly) should look to change this logic.
function glossifyTermFromLabel(label){
  const originalText = label.textContent;
  const id = label.dataset.termId;
  const language = label.dataset.language;
  const paramString = id + "&version=Patient&language=" + language;
  const href = "/Common/PopUps/popDefinition.aspx?id=" + paramString;
  const onClickHandler = function() {
    window.popWindow('defbyid', paramString);
    return false;
  };

  const anchor = document.createElement('a');
  anchor.onclick = onClickHandler;
  anchor.className = 'definition';
  anchor.href = href;
  anchor.textContent = originalText;

  label.replaceWith(anchor);
}

/**
 * Given an array of objects containing configuration data
 * for a glossary term and a string containing the original HTML (after
 * being processed for sending to the API), we want to generate checkboxes
 * allowing a user to select the terms they want to be 'glossified' (i.e be
 * wrapper in an anchor tag pointing at the glossary term).
 *
 * @param {string} originalHtml
 * @param {Object[]} candidateTermConfigs
 */
function createDialogBodyHtml(originalHtml, candidateTermConfigs, language){
  // Instead of editing the string contents, we create a new string. This
  // allows us to do the whole concatenation in one pass. The slow pointer
  // keeps the new, longer string in sync with the indexes of the original string.
  // (Which is important as long as the api uses indexes and length to identify terms).
  let processedHtml = "";
  let slowPointer = 0;
  for(let i = 0; i < candidateTermConfigs.length; i++){
    const termConfig = candidateTermConfigs[i];
    const termStartIndex = termConfig.start;
    const termLength = termConfig.length;
    const termEndIndex = termStartIndex + termLength;
    const preceedingSnippet = originalHtml.slice(slowPointer, termStartIndex);
    processedHtml += preceedingSnippet;
    slowPointer = termStartIndex;
    const termText = originalHtml.slice(slowPointer, termEndIndex);
    slowPointer = termEndIndex;
    const termId = termConfig.doc_id;
    const isFirstOccurenceOfTerm = termConfig.first_occurrence;
    const wrappedTerm = createGlossificationTermOptionElementString(termText, termId, language, isFirstOccurenceOfTerm)
    processedHtml += wrappedTerm;
  }
  // We need to grab the tail of the originalHtml
  const tailSnippet = originalHtml.slice(slowPointer);
  processedHtml += tailSnippet;
  return processedHtml;
}

function saveGlossificationChoices() {
  const dialogContainer = this.getElement().$.querySelector('.glossify-dialog-container')
  const labels = dialogContainer.querySelectorAll('label[data-glossify-label]');
  const labelsArray = arrayifyNodelist(labels);
  labelsArray.forEach(function(label) {
    const checkbox = label.querySelector('input');
    const isSelected = checkbox.checked;
    if(!isSelected) {
      // Restore the term as basic text. No glossification.
      const originalText = label.textContent;
      label.replaceWith(originalText);
    }
    else {
      glossifyTermFromLabel(label);
    }
  })
  const htmlArea = this.getElement().$.querySelector('.glossify-dialog-container').innerHTML;
  const currentEditor = this._.editor;
  // Note: editor.insertHtml does not clear previous contents of editor. This does.
  currentEditor.setData(htmlArea);
}

/**
 * Prepare the data for sending to web service.
 */
function cGovPrepareStr(data) {
  // DEPRECATED? TODO: Determine if this needs to be kept.
  // /**
  // * Replace Spanish-character entities with literal values
  // */
  // function fixSpanish(editorContent) {
  //   var fixedSpanish = editorContent;
  //   fixedSpanish = fixedSpanish.split('&Aacute;').join('Á');
  //   fixedSpanish = fixedSpanish.split('&aacute;').join('á');
  //   fixedSpanish = fixedSpanish.split('&Eacute;').join('É');
  //   fixedSpanish = fixedSpanish.split('&eacute;').join('é');
  //   fixedSpanish = fixedSpanish.split('&Iacute;').join('Í');
  //   fixedSpanish = fixedSpanish.split('&iacute;').join('í');
  //   fixedSpanish = fixedSpanish.split('&Oacute;').join('Ó');
  //   fixedSpanish = fixedSpanish.split('&oacute;').join('ó');
  //   fixedSpanish = fixedSpanish.split('&Uacute;').join('Ú');
  //   fixedSpanish = fixedSpanish.split('&uacute;').join('ú');
  //   fixedSpanish = fixedSpanish.split('&Yacute;').join('Ý');
  //   fixedSpanish = fixedSpanish.split('&yacute;').join('ý');
  //   fixedSpanish = fixedSpanish.split('&Ntilde;').join('Ñ');
  //   fixedSpanish = fixedSpanish.split('&ntilde;').join('ñ');
  //   return fixedSpanish;
  // }

	let tempData = data;
  let result = "";
  // 1) Save previously glossified term state as an element that the API will
  // ignore.
  tempData = cachePreviouslyGlossifiedTerms(tempData);
  // 2) Sanitize the string.
	for (let i=0; i < tempData.length; i++) {
		let c = tempData.charAt(i);
		if (c == "\n") {  //line feed substitute
			result += "&#x000a;";
		}
		else if (c == "\r") { //carriage return substitute
			result += "&#x000d;";
		}
		else if (c == "”") {	//right double quote
			result += "&#148;";
		}
		else if (c == "—") {	//em dash
			result += "&#151;";
		}
		else if (c == "–") {	//en dash
			result += "&#150;";
		}
		else if (c == "Á") {	//A accent - for some reason WS chokes on this
			result += "&#193;";
		}
		else if (c == "Í") {	//I accent
			result += "&#205;";
		}
		else {
			result += c;
		}
	}
	return result;
}


function cachePreviouslyGlossifiedTerms(body) {
  const glossifiedTermTest = new RegExp("<a\\s+class=\"definition\".+?>(.+?)</a>", "g");
  const result = body.replace(glossifiedTermTest, wrapTermToSaveState);
	return result;
}

function wrapTermToSaveState(match, firstCaptureGroup) {
  const fullMatch = match;
  const termMatch = firstCaptureGroup;
  // TODO: Error handling
  const extractDataTest = /(CDR[0-9]+).+language=([A-z]+)/i;
  const extractedData = fullMatch.match(extractDataTest);
  const id = extractedData[1];
  const language = extractedData[2];
  // All preexisting glossified links are expected to match the same pattern that
  // allows us to extract enough data to reconstruct them after a new glossification pass.
  // The API is already set up to ignore all tags but only the contents of a tags.
  // Since we use a span, we don't want the term to be findable and store it as a data attribute
  // rather than a text node.
  // We don't want to reglossify terms specifically because the terms
  // themselves may not match the glossary (because content editors can manually edit them
  // after a glossification pass and we need to preserve that alteration.)
  const wrappedTerm =
    "<span rel='glossified' data-id='" + id
    + "' data-language='" + language
    + "' data-term='" + termMatch + "'/>";
	return wrappedTerm;
}
