function requestGlossification() {
  fetch('http://api.open-notify.org/iss-now.json')
    .then(res => res.json())
    .then(res => {
      const { latitude, longitude } = res.iss_position;
      const htmlBody = `
        <h2>ISS Current Position</h2>
        <p>Latitude: ${ latitude }</p>
        <p>Longitude: ${ longitude }</p>
      `;
      const htmlArea = this.getElement().getDocument().getById('dialog_container');
      htmlArea.setHtml(htmlBody);
    })
  }

function saveGlossificationChoices() {
  const htmlArea = this.getElement().getDocument().getById('dialog_container').getHtml();
  this._.editor.insertHtml(htmlArea);
}

CKEDITOR.dialog.add('glossifyDialog', function(editor) {
  return {
    title: 'Glossify Page',
    buttons: [ CKEDITOR.dialog.cancelButton, CKEDITOR.dialog.okButton ],
    onLoad: requestGlossification,
    onOk: saveGlossificationChoices,
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
            html: '<div id="dialog_container"><div id="spinner">Loading...</div></div>'
          }
        ],
      }
    ]
  };
})
