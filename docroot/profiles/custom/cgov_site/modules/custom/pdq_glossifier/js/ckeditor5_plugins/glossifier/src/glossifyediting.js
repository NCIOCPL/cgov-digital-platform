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
        'hreflang',
      ],
    });

    this.editor.editing.view.domConverter.blockElements.push('drupal-entity');
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
            'hreflang',
          ],
        },
        model: (viewElement, { writer }) => {
          return writer.createElement('nciDefinition', {
            glossId: viewElement.getAttribute('data-gloss-id'),
            glossDictionary: viewElement.getAttribute('data-gloss-dictionary'),
            glossAudience: viewElement.getAttribute('data-gloss-audience'),
            hreflang: viewElement.getAttribute('hreflang'),
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
        const hreflang = modelElement.getAttribute('hreflang');

        // TODO: get real url from map.
        const href = `/foo`;

        return writer.createContainerElement('a', {
          class: 'definition', // todo: fix this
          href,
          'data-gloss-id': glossId,
          'data-gloss-dictionary': glossDictionary,
          'data-gloss-audience': glossAudience,
          hreflang,
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
            'hreflang': modelElement.getAttribute('hreflang'),
          });
        },
      });
  }

}
