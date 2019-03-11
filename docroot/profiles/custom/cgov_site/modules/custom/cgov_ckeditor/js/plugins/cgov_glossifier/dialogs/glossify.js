CKEDITOR.dialog.add('glossifyDialog', function(editor) {
  return {
    title: 'Glossify Page',
    minWidth: 600,
    minHeight: 400,
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
            html: 'Jazz Hands!!!'
          }
        ],
      }
    ]
  };
})
