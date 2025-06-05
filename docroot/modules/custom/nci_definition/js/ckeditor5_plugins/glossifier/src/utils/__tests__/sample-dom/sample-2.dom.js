// This example has just text and no pre-existing definition elements.
const inputHtml = `<p>Psychological&nbsp;` +
  `<nci-definition data-gloss-id="450122" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">stress</nci-definition>` +
  `&nbsp;describes what people feel when they are under mental, physical, or emotional pressure. Although it is normal to experience some psychological stress from time to time, people who experience high levels of psychological stress or who experience it repeatedly over a long period of time may develop health problems (mental and/or physical).</p>` +
  `<p>Stress can be caused both by daily responsibilities and routine events, as well as by more unusual events, such as a trauma or illness in oneself or a close family member. When people feel that they are unable to manage or control changes caused by cancer or normal life activities, they are in&nbsp;` +
  `<nci-definition data-gloss-id="454701" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">distress</nci-definition>` +
  `. Distress has become increasingly recognized as a factor that can reduce the quality of life of cancer patients. There is even some evidence that extreme distress is associated with poorer clinical outcomes. Clinical guidelines are available to help doctors and nurses assess levels of distress and help patients manage it.</p>` +
  `<p>This fact sheet provides a general introduction to the stress that people may experience as they cope with cancer.&nbsp;More detailed information about specific psychological conditions related to stress can be found in the Related Resources and Selected References at the end of this fact sheet.</p>`;

const apiPayload = {
    "fragment": `<p>Psychological&nbsp;` +
        `<span rel="glossified" data-preexisting="true" data-gloss-lang="en" data-gloss-id="450122" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-html="" data-term="stress"></span>` +
        `&nbsp;describes what people feel when they are under mental, physical, or emotional pressure. Although it is normal to experience some psychological stress from time to time, people who experience high levels of psychological stress or who experience it repeatedly over a long period of time may develop health problems (mental and/or physical).</p>` +
        `<p>Stress can be caused both by daily responsibilities and routine events, as well as by more unusual events, such as a trauma or illness in oneself or a close family member. When people feel that they are unable to manage or control changes caused by cancer or normal life activities, they are in&nbsp;` +
        `<span rel="glossified" data-preexisting="true" data-gloss-lang="en" data-gloss-id="454701" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-html="" data-term="distress"></span>` +
        `. Distress has become increasingly recognized as a factor that can reduce the quality of life of cancer patients. There is even some evidence that extreme distress is associated with poorer clinical outcomes. Clinical guidelines are available to help doctors and nurses assess levels of distress and help patients manage it.</p>` +
        `<p>This fact sheet provides a general introduction to the stress that people may experience as they cope with cancer.&nbsp;More detailed information about specific psychological conditions related to stress can be found in the Related Resources and Selected References at the end of this fact sheet.</p>`,
    "languages": ["en"],
    "dictionaries": ["Cancer.gov"]
};

const apiResponse = [
    {
        "start": 3,
        "length": 13,
        "doc_id": "CDR0000454766",
        "language": "en",
        "first_occurrence": true,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 352,
        "length": 13,
        "doc_id": "CDR0000454766",
        "language": "en",
        "first_occurrence": false,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 366,
        "length": 6,
        "doc_id": "CDR0000450122",
        "language": "en",
        "first_occurrence": true,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 399,
        "length": 3,
        "doc_id": "CDR0000559085",
        "language": "en",
        "first_occurrence": true,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 429,
        "length": 13,
        "doc_id": "CDR0000454766",
        "language": "en",
        "first_occurrence": false,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 443,
        "length": 6,
        "doc_id": "CDR0000450122",
        "language": "en",
        "first_occurrence": false,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 453,
        "length": 3,
        "doc_id": "CDR0000559085",
        "language": "en",
        "first_occurrence": false,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 569,
        "length": 6,
        "doc_id": "CDR0000450122",
        "language": "en",
        "first_occurrence": false,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 686,
        "length": 6,
        "doc_id": "CDR0000454807",
        "language": "en",
        "first_occurrence": true,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 818,
        "length": 6,
        "doc_id": "CDR0000045333",
        "language": "en",
        "first_occurrence": true,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 1068,
        "length": 8,
        "doc_id": "CDR0000454701",
        "language": "en",
        "first_occurrence": true,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 1144,
        "length": 15,
        "doc_id": "CDR0000045417",
        "language": "en",
        "first_occurrence": true,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 1163,
        "length": 6,
        "doc_id": "CDR0000045333",
        "language": "en",
        "first_occurrence": false,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 1221,
        "length": 8,
        "doc_id": "CDR0000454701",
        "language": "en",
        "first_occurrence": false,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 1256,
        "length": 8,
        "doc_id": "CDR0000044168",
        "language": "en",
        "first_occurrence": true,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 1275,
        "length": 8,
        "doc_id": "CDR0000044168",
        "language": "en",
        "first_occurrence": false,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 1329,
        "length": 6,
        "doc_id": "CDR0000269445",
        "language": "en",
        "first_occurrence": true,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 1353,
        "length": 8,
        "doc_id": "CDR0000454701",
        "language": "en",
        "first_occurrence": false,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 1452,
        "length": 6,
        "doc_id": "CDR0000450122",
        "language": "en",
        "first_occurrence": false,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 1494,
        "length": 4,
        "doc_id": "CDR0000454700",
        "language": "en",
        "first_occurrence": true,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 1504,
        "length": 6,
        "doc_id": "CDR0000045333",
        "language": "en",
        "first_occurrence": false,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 1558,
        "length": 13,
        "doc_id": "CDR0000454766",
        "language": "en",
        "first_occurrence": false,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 1572,
        "length": 10,
        "doc_id": "CDR0000651193",
        "language": "en",
        "first_occurrence": true,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    },
    {
        "start": 1594,
        "length": 6,
        "doc_id": "CDR0000450122",
        "language": "en",
        "first_occurrence": false,
        "dictionary": "Cancer.gov",
        "audience": "Patient"
    }
];

const suggestedHTML =
`<div><p>` +
`<label data-gloss-id="454766" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">Psychological<input type="checkbox"></label>&nbsp;` +
`<label data-gloss-id="450122" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="true" data-html="" data-glossify-label="">stress<input type="checkbox"></label>` +
`&nbsp;describes what people feel when they are under mental, physical, or emotional pressure. Although it is normal to experience some ` +
`<label data-gloss-id="454766" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">psychological<input type="checkbox"></label> `+
`<label data-gloss-id="450122" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">stress<input type="checkbox"></label>` +
` from time to time, people ` +
`<label data-gloss-id="559085" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">who<input type="checkbox"></label>` +
` experience high levels of ` +
`<label data-gloss-id="454766" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">psychological<input type="checkbox"></label> ` +
`<label data-gloss-id="450122" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">stress<input type="checkbox"></label> or ` +
`<label data-gloss-id="559085" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">who<input type="checkbox"></label>` +
` experience it repeatedly over a long period of time may develop health problems (mental and/or physical).</p>` +
`<p>` +
`<label data-gloss-id="450122" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">Stress<input type="checkbox"></label>` +
` can be caused both by daily responsibilities and routine events, as well as by more unusual events, such as a ` +
`<label data-gloss-id="454807" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">trauma<input type="checkbox"></label>` +
` or illness in oneself or a close family member. When people feel that they are unable to manage or control changes caused by ` +
`<label data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">cancer<input type="checkbox"></label>` +
` or normal life activities, they are in&nbsp;` +
`<label data-gloss-id="454701" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="true" data-html="" data-glossify-label="">distress<input type="checkbox"></label>. ` +
`<label data-gloss-id="454701" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">Distress<input type="checkbox"></label>` +
` has become increasingly recognized as a factor that can reduce the ` +
`<label data-gloss-id="45417" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">quality of life<input type="checkbox"></label> of ` +
`<label data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">cancer<input type="checkbox"></label> patients. There is even some evidence that extreme ` +
`<label data-gloss-id="454701" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">distress<input type="checkbox"></label> is associated with poorer ` +
`<label data-gloss-id="44168" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">clinical<input type="checkbox"></label> outcomes. ` +
`<label data-gloss-id="44168" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">Clinical<input type="checkbox"></label> guidelines are available to help doctors and ` +
`<label data-gloss-id="269445" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">nurses<input type="checkbox"></label> assess levels of ` +
`<label data-gloss-id="454701" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">distress<input type="checkbox"></label> and help patients manage it.</p>` +
`<p>This fact sheet provides a general introduction to the ` +
`<label data-gloss-id="450122" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">stress<input type="checkbox"></label> that people may experience as they ` +
`<label data-gloss-id="454700" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">cope<input type="checkbox"></label> with ` +
`<label data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">cancer<input type="checkbox"></label>.&nbsp;More detailed information about specific ` +
`<label data-gloss-id="454766" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">psychological<input type="checkbox"></label> ` +
`<label data-gloss-id="651193" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">conditions<input type="checkbox"></label> related to ` +
`<label data-gloss-id="450122" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">stress<input type="checkbox"></label> can be found in the Related Resources and Selected References at the end of this fact sheet.</p></div>`;

export default {
  inputHtml,
  apiPayload,
  apiResponse,
  suggestedHTML,
};
