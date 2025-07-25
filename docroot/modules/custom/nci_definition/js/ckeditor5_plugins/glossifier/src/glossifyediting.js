import { Plugin } from 'ckeditor5/src/core';
import GlossifyActionCommand from './glossifyactioncommand';

export default class GlossifyEditing extends Plugin {

  /**
   * Initializes the GlossifyEditing plugin.
   */
  init() {
    const config = this.editor.config.get('nci_definition');
    const schema = this.editor.model.schema;
    const conversion = this.editor.conversion;

    this._defineSchema(schema);

    this._defineUpcastConverter(conversion);
    this._defineLegacyUpcastConverter(conversion);
    this._defineEditingDowncast(conversion, config);
    this._defineDataDowncast(conversion);
    this._preventLinksInDefinitions(conversion);

    // Register nci-definition as an inline object so that <nci-definition>s are
    // correctly recognized as inline elements in editing pipeline.
    // This prevents converting spaces around definitions to `&nbsp;`s.
    this.editor.data.htmlProcessor.domConverter.inlineObjectElements.push('nci-definition');
    this.editor.editing.view.domConverter.inlineObjectElements.push('nci-definition');

    this.editor.commands.add(
      'glossifyAction',
      new GlossifyActionCommand(this.editor),
    );

    // Disable link command when selection is inside nciDefinition
    this._disableLinkCommandInDefinitions();
  }

  /**
   * Defines the shape (element name, attributes, etc) of the widget.
   */
  _defineSchema(schema) {

    // This defines the Model's schema, which is not the same as what is
    // in the HTML.
    // See https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_schema-SchemaItemDefinition.html
    schema.register("nciDefinition", {
      allowWhere: '$text',
      allowContentOf: '$block',
      isInline: true,
      isObject: true,
      disallowChildren: [
        'drupalEntity',
        'htmlObject',
        'htmlIframe',
        'htmlVar',
        'htmlInput',
        'htmlButton',
        'htmlTextarea',
        'htmlSelect',
        'htmlEmbed',
        'htmlOembed',
        'htmlCanvas',
        'htmlMeter',
        'htmlProgress',
        'htmlImg',
        'nciDefinition',
        'htmlAudio',
        'htmlVideo' ],
      // The definition should have the following attribute:
      allowAttributes: [
        'glossId',
        'glossDictionary',
        'glossAudience',
        'glossLang',
      ],
    });

    // Explicitly disallow links inside nciDefinition elements
    schema.addChildCheck((context, childDefinition) => {
      if (context.endsWith('nciDefinition') && childDefinition.name === 'a') {
        return false;
      }
    });
  }

  /**
   * Defines the upcast converter for the <nci-definition> element.
   *
   * This goes from our markup to the model. See:
   * @see https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/conversion/upcast.html
   * @param {*} conversion
   */
  _defineUpcastConverter(conversion) {
    conversion
      .for("upcast")
      .elementToElement({
        view: {
          name: 'nci-definition',
          attributes: [
            'data-gloss-id',
            'data-gloss-dictionary',
            'data-gloss-audience',
            'data-gloss-lang',
          ],
        },
        model: (viewElement, { writer }) => {
          return writer.createElement('nciDefinition', {
            glossId: viewElement.getAttribute('data-gloss-id'),
            glossDictionary: viewElement.getAttribute('data-gloss-dictionary'),
            glossAudience: viewElement.getAttribute('data-gloss-audience'),
            glossLang: viewElement.getAttribute('data-gloss-lang'),
          });
        },
      });
  }

  /**
   * Defines the downcast converter for the editing view.
   *
   * Downcast to move from custom element to HTML for the editing view.
   * The editing view is what you see when you open the editor.
   * @see https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/conversion/downcast.html#downcast-pipelines
   * @param {*} conversion
   * @param {*} config
   */
  _defineEditingDowncast(conversion, config) {

    conversion.for("editingDowncast").elementToElement({
      model: 'nciDefinition',
      view: (modelElement, { writer }) => {
        const glossId = modelElement.getAttribute('glossId');
        const glossDictionary = modelElement.getAttribute('glossDictionary');
        const glossAudience = modelElement.getAttribute('glossAudience');
        const glossLang = modelElement.getAttribute('glossLang');

        const matchingFormatter = config['nci_glossary_dictionary_urls']?.find((entry) =>
          entry['dictionary']?.toLowerCase() === glossDictionary?.toLowerCase() &&
          entry['audience']?.toLowerCase() === glossAudience?.toLowerCase() &&
          entry['langcode']?.toLowerCase() === glossLang?.toLowerCase()
        )?.formatter;

        // TODO: In the future we should make it so clicking the link presents a
        // balloon dialog to remove the dictionary link.
        // TODO: In the future Fix formatter to not be so PHP.
        const href = matchingFormatter ?
          matchingFormatter.replace('%s', glossId) :
          `#UNKNOWN_FORMATTER`;

        return writer.createContainerElement('a', {
          ...(config['definition_classes'] ?
            { class: config['definition_classes'] } :
            { }
          ),
          href,
          'data-gloss-id': glossId,
          'data-gloss-dictionary': glossDictionary,
          'data-gloss-audience': glossAudience,
          'data-gloss-lang': glossLang,
        })
      },
    });
  }

  /**
   * Defines the downcast converter for the data pipeline.
   *
   * Downcast to move from custom element to HTML for the data pipeline.
   * Used when generating the editor output. This process is controlled by the data pipeline.
   * @see https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/conversion/downcast.html#downcast-pipelines
   * @param {*} conversion
   */
  _defineDataDowncast(conversion) {
    conversion
      .for("dataDowncast")
      .elementToElement({
        model: 'nciDefinition',
        view: (modelElement, { writer }) => {
          return writer.createContainerElement('nci-definition', {
            'data-gloss-id': modelElement.getAttribute('glossId'),
            'data-gloss-dictionary': modelElement.getAttribute('glossDictionary'),
            'data-gloss-audience': modelElement.getAttribute('glossAudience'),
            'data-gloss-lang': modelElement.getAttribute('glossLang'),
          });
        },
      });
  }

  /**
   * Upcast converter for legacy definition links.
   *
   * This should be removed once all legacy links are converted to the
   * <nci-definition> format.
   * @param {*} conversion
   */
  _defineLegacyUpcastConverter(conversion) {
    /**
     * Helper to extract the glossary ID from legacy definition links.
     *
     * @param {Element} viewElement the view element to extract the ID from.
     * @returns {number|null} the glossary ID or null if it cannot be extracted.
     */
    const getLegacyGlossaryId = (viewElement) => {
      // Handle newer nci definitions where the ID is nicely separated
      // from the href.
      if (viewElement.hasAttribute('data-glossary-id')) {
        // Try to get ID from data-glossary-id attribute first
        const dataGlossaryId = parseInt(
          viewElement.getAttribute('data-glossary-id').replace(/^CDR0*/, '')
        );

        // We are not messing around. If there is a data-glossary-id and it
        // is malformed, then we will not convert this link.
        if (!isNaN(dataGlossaryId)) {
          return dataGlossaryId;
        } else {
          return null;
        }
      }

      // Fallback to processing the href to get the ID.
      const href = viewElement.getAttribute('href');
      // At this point we are pretty much good to go and all we need to do
      // is to extract the properties from the href.
      const parsedUrl = new URL(href, 'https://example.org');
      const hrefId = parseInt(parsedUrl.searchParams.get('id')?.replace(/\D+/, ''));

      // Only return the ID if it is a valid number.
      if (!isNaN(hrefId)) {
        return hrefId;
      }

      return null;
    };

    // Legacy definition link upcast conversion
    conversion
      .for("upcast")
      .add((dispatcher) => {
        dispatcher.on('element:a', (evt, data, conversionApi) => {
          const viewElement = data.viewItem;

          // Only process if it has the 'definition' class
          if (!viewElement.hasClass('definition')) {
            return;
          }

          // Let's test the URLs to make sure they are known formats.
          const oldGlossifierPattern = /^(http[s]*:\/\/[^\/]*|)\/Common\/PopUps\/popDefinition\.aspx\?id=([^&]*)&version=(patient|healthprofessional)&language=(English|Spanish|en|es)$/i;
          const pdqPattern = /^\/Common\/PopUps\/popDefinition\.aspx\?id=([^&]*)&version=(patient|healthprofessional)&language=(English|Spanish|en|es)&dictionary=([^&]*)$/i;
          const href = viewElement.getAttribute('href');

          if (
            !oldGlossifierPattern.test(href) &&
            !pdqPattern.test(href)
          ) {
            return;
          }

          // At this point we are pretty much good to go and all we need to do
          // is to extract the properties from the href.
          const parsedUrl = new URL(href, 'https://example.org');

          // Extract data from legacy link attributes
          const glossId = getLegacyGlossaryId(viewElement);

          // Gonna bail if we don't have a valid ID because we can't just
          // fall back to some default.
          if (!glossId) {
            console.warn(
              'Glossifier: Unable to extract glossary ID from link.'
            );
            return;
          }

          // This is a cheat because we know the default dictionary for all old
          // links.
          const glossDictionary = 'Cancer.gov';
          // Default to patient unless the version is HP.
          const glossAudience = parsedUrl.searchParams.get('version')?.toLowerCase() === 'healthprofessional' ?
            'HealthProfessional' : 'Patient';
          const tmpLang = parsedUrl.searchParams.get('language')?.toLowerCase();
          // Default to english.
          const glossLang = (tmpLang === 'spanish' || tmpLang === 'es') ? 'es' : 'en';

          // Now we get into the CKEditor conversion specific things.
          const { writer, consumable, safeInsert, convertChildren } = conversionApi;

          // Consume the element and all its attributes to prevent default conversion
          if (!consumable.consume(viewElement, { name: true })) {
            return;
          }

          // Consume all attributes to prevent them from being processed
          for (const attributeName of viewElement.getAttributeKeys()) {
            consumable.consume(viewElement, { attributes: attributeName });
          }

          // Create the nci-definition element
          const nciDefinition = writer.createElement('nciDefinition', {
            glossId,
            glossDictionary,
            glossAudience,
            glossLang,
          });

          // Use CKEditor's built-in convertChildren to handle child elements
          convertChildren(viewElement, nciDefinition);

          // Insert the element
          if (!safeInsert(nciDefinition, data.modelCursor)) {
            return;
          }

          // Update the conversion result
          conversionApi.updateConversionResult(nciDefinition, data);

        }, { priority: 'high' });
      });
  }

  /**
   * Disables the link command when the selection is inside an nciDefinition element.
   */
  _disableLinkCommandInDefinitions() {
    const editor = this.editor;
    const linkCommand = editor.commands.get('link');

    if (linkCommand) {
      // Override the link command's refresh method to disable it in nciDefinition
      const originalRefresh = linkCommand.refresh.bind(linkCommand);

      linkCommand.refresh = () => {
        originalRefresh();

        const selection = editor.model.document.selection;
        const selectedElement = selection.getSelectedElement();

        // Check if selection is inside nciDefinition
        if (selectedElement && selectedElement.is('element', 'nciDefinition')) {
          linkCommand.isEnabled = false;
          return;
        }

        // Check if any ancestor is nciDefinition
        const position = selection.getFirstPosition();
        if (position) {
          const ancestors = position.getAncestors();
          const hasNciDefinitionAncestor = ancestors.some(ancestor =>
            ancestor.is('element', 'nciDefinition')
          );

          if (hasNciDefinitionAncestor) {
            linkCommand.isEnabled = false;
          }
        }
      };

      // Force initial refresh
      linkCommand.refresh();
    }
  }

  /**
   * Prevents links from being upcasted inside nci-definition elements.
   * This handles cases where users manually add links via source view.
   */
  _preventLinksInDefinitions(conversion) {
    conversion.for('upcast').add(dispatcher => {
      dispatcher.on('element:a', (evt, data, conversionApi) => {
        const viewElement = data.viewItem;

        // Check if this link is inside an nci-definition element
        let parent = viewElement.parent;
        while (parent) {
          if (parent.is('element', 'nci-definition')) {
            // This link is inside an nci-definition, so we'll unwrap it but keep its content
            const { consumable, convertChildren } = conversionApi;

            // Consume the link element to prevent default processing
            if (consumable.consume(viewElement, { name: true })) {
              // Convert the children of the link without creating the link wrapper
              // This effectively unwraps the <a> tag but preserves all inner content and formatting
              convertChildren(viewElement, data.modelCursor);

              // Stop the event to prevent the link from being created
              evt.stop();
            }
            return;
          }
          parent = parent.parent;
        }
      }, { priority: 'high' });
    });
  }

}
