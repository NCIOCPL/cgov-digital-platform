import { Plugin } from 'ckeditor5/src/core';
import GlossifyActionCommand from './glossifyactioncommand';

export default class GlossifyEditing extends Plugin {

  init() {
    this._defineSchema();
    this._defineConverters();

    this.editor.commands.add(
      'glossifyAction',
      new GlossifyActionCommand(this.editor),
    );
  }

  /**
   * Defines the shape (element name, attributes, etc) of the widget.
   */
  _defineSchema() {
    const schema = this.editor.model.schema;

    // This defines the Model's schema, which is not the same as what is
    // in the HTML.
    // See https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_schema-SchemaItemDefinition.html
    schema.register("nciDefinition", {
      allowWhere: '$text',
      allowContentOf: '$block',
      isInline: true,
      isObject: true,
      disallowChildren: [ 'a', 'nciDefinition', 'htmlAudio', 'htmlVideo' ],
      // The definition should have the following attribute:
      allowAttributes: [
        'glossId',
        'glossDictionary',
        'glossAudience',
        'glossLang',
      ],
    });
  }

  /**
   * Defines how to move from editing the widget and previewing the widget.
   */
  _defineConverters() {
    const config = this.editor.config.get('nci_definition');
    const conversion = this.editor.conversion;

    // This goes from our markup to the model. See:
    // https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/conversion/upcast.html
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

    // Downcast to move from custom element to HTML for the editing view.
    // The editing view is what you see when you open the editor.
    // https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/conversion/downcast.html#downcast-pipelines
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

    // Downcast to move from custom element to HTML for the data pipeline.
    // Used when generating the editor output. This process is controlled by the data pipeline.
    // https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/conversion/downcast.html#downcast-pipelines
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

}
