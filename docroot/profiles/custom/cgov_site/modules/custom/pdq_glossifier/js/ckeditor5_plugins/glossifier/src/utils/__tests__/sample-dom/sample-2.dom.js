// This example has just text and no pre-existing definition elements.
const inputHtml = `<p>Psychological <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000450122&amp;version=Patient&amp;language=English" onclick="javascript:popWindow(&apos;defbyid&apos;,&apos;CDR0000450122&amp;version=Patient&amp;language=English&apos;); return false;">stress</a> describes what people feel when they are under mental, physical, or emotional pressure. Although it is normal to experience some psychological stress from time to time, people who experience high levels of psychological stress or who experience it repeatedly over a long period of time may develop health problems (mental and/or physical).</p>` +
  `<p>Stress can be caused both by daily responsibilities and routine events, as well as by more unusual events, such as a trauma or illness in oneself or a close family member. When people feel that they are unable to manage or control changes caused by cancer or normal life activities, they are in <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000454701&amp;version=Patient&amp;language=English" onclick="javascript:popWindow(&apos;defbyid&apos;,&apos;CDR0000454701&amp;version=Patient&amp;language=English&apos;); return false;">distress</a>. Distress has become increasingly recognized as a factor that can reduce the quality of life of cancer patients. There is even some evidence that extreme distress is associated with poorer clinical outcomes. Clinical guidelines are available to help doctors and nurses assess levels of distress and help patients manage it.</p>` +
  `<p>This fact sheet provides a general introduction to the stress that people may experience as they cope with cancer.&nbsp;More detailed information about specific psychological conditions related to stress can be found in the Related Resources and Selected References at the end of this fact sheet.</p>`;

  const apiPayload = {"fragment":"<p>Psychological <span rel=\"glossified\" data-id=\"CDR0000450122\"&#x000a;      data-language=\"English\"&#x000a;      data-preexisting=\"true\"&#x000a;      data-html=\"\"&#x000a;      data-term=\"stress\"></span> describes what people feel when they are under mental, physical, or emotional pressure. Although it is normal to experience some psychological stress from time to time, people who experience high levels of psychological stress or who experience it repeatedly over a long period of time may develop health problems (mental and/or physical).</p><p>Stress can be caused both by daily responsibilities and routine events, as well as by more unusual events, such as a trauma or illness in oneself or a close family member. When people feel that they are unable to manage or control changes caused by cancer or normal life activities, they are in <span rel=\"glossified\" data-id=\"CDR0000454701\"&#x000a;      data-language=\"English\"&#x000a;      data-preexisting=\"true\"&#x000a;      data-html=\"\"&#x000a;      data-term=\"distress\"></span>. Distress has become increasingly recognized as a factor that can reduce the quality of life of cancer patients. There is even some evidence that extreme distress is associated with poorer clinical outcomes. Clinical guidelines are available to help doctors and nurses assess levels of distress and help patients manage it.</p><p>This fact sheet provides a general introduction to the stress that people may experience as they cope with cancer.&nbsp;More detailed information about specific psychological conditions related to stress can be found in the Related Resources and Selected References at the end of this fact sheet.</p>","languages":["en"],"dictionaries":["Cancer.gov"]};

const apiResponse = [
  {
      "start": 3,
      "length": 13,
      "doc_id": "CDR0000454766",
      "language": "en",
      "first_occurrence": true,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 333,
      "length": 13,
      "doc_id": "CDR0000454766",
      "language": "en",
      "first_occurrence": false,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 347,
      "length": 6,
      "doc_id": "CDR0000450122",
      "language": "en",
      "first_occurrence": true,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 380,
      "length": 3,
      "doc_id": "CDR0000559085",
      "language": "en",
      "first_occurrence": true,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 410,
      "length": 13,
      "doc_id": "CDR0000454766",
      "language": "en",
      "first_occurrence": false,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 424,
      "length": 6,
      "doc_id": "CDR0000450122",
      "language": "en",
      "first_occurrence": false,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 434,
      "length": 3,
      "doc_id": "CDR0000559085",
      "language": "en",
      "first_occurrence": false,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 550,
      "length": 6,
      "doc_id": "CDR0000450122",
      "language": "en",
      "first_occurrence": false,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 667,
      "length": 6,
      "doc_id": "CDR0000454807",
      "language": "en",
      "first_occurrence": true,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 799,
      "length": 6,
      "doc_id": "CDR0000045333",
      "language": "en",
      "first_occurrence": true,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 1035,
      "length": 8,
      "doc_id": "CDR0000454701",
      "language": "en",
      "first_occurrence": true,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 1111,
      "length": 15,
      "doc_id": "CDR0000045417",
      "language": "en",
      "first_occurrence": true,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 1130,
      "length": 6,
      "doc_id": "CDR0000045333",
      "language": "en",
      "first_occurrence": false,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 1188,
      "length": 8,
      "doc_id": "CDR0000454701",
      "language": "en",
      "first_occurrence": false,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 1223,
      "length": 8,
      "doc_id": "CDR0000044168",
      "language": "en",
      "first_occurrence": true,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 1242,
      "length": 8,
      "doc_id": "CDR0000044168",
      "language": "en",
      "first_occurrence": false,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 1296,
      "length": 6,
      "doc_id": "CDR0000269445",
      "language": "en",
      "first_occurrence": true,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 1320,
      "length": 8,
      "doc_id": "CDR0000454701",
      "language": "en",
      "first_occurrence": false,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 1419,
      "length": 6,
      "doc_id": "CDR0000450122",
      "language": "en",
      "first_occurrence": false,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 1461,
      "length": 4,
      "doc_id": "CDR0000454700",
      "language": "en",
      "first_occurrence": true,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 1471,
      "length": 6,
      "doc_id": "CDR0000045333",
      "language": "en",
      "first_occurrence": false,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 1525,
      "length": 13,
      "doc_id": "CDR0000454766",
      "language": "en",
      "first_occurrence": false,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 1539,
      "length": 10,
      "doc_id": "CDR0000651193",
      "language": "en",
      "first_occurrence": true,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 1561,
      "length": 6,
      "doc_id": "CDR0000450122",
      "language": "en",
      "first_occurrence": false,
      "dictionary": "Cancer.gov"
  }
];

const suggestedHTML =
`<div><p><label data-term-id="CDR0000454766" data-language="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">Psychological<input type="checkbox"></label> <label data-term-id="CDR0000450122" data-language="English" class="glossify-dialog__term " data-preexisting="true" data-html="" data-glossify-label="">stress<input type="checkbox"></label> describes what people feel when they are under mental, physical, or emotional pressure. Although it is normal to experience some <label data-term-id="CDR0000454766" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">psychological<input type="checkbox"></label> <label data-term-id="CDR0000450122" data-language="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">stress<input type="checkbox"></label> from time to time, people <label data-term-id="CDR0000559085" data-language="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">who<input type="checkbox"></label> experience high levels of <label data-term-id="CDR0000454766" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">psychological<input type="checkbox"></label> <label data-term-id="CDR0000450122" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">stress<input type="checkbox"></label> or <label data-term-id="CDR0000559085" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">who<input type="checkbox"></label> experience it repeatedly over a long period of time may develop health problems (mental and/or physical).</p>` +
`<p><label data-term-id="CDR0000450122" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">Stress<input type="checkbox"></label> can be caused both by daily responsibilities and routine events, as well as by more unusual events, such as a <label data-term-id="CDR0000454807" data-language="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">trauma<input type="checkbox"></label> or illness in oneself or a close family member. When people feel that they are unable to manage or control changes caused by <label data-term-id="CDR0000045333" data-language="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">cancer<input type="checkbox"></label> or normal life activities, they are in <label data-term-id="CDR0000454701" data-language="English" class="glossify-dialog__term " data-preexisting="true" data-html="" data-glossify-label="">distress<input type="checkbox"></label>. <label data-term-id="CDR0000454701" data-language="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">Distress<input type="checkbox"></label> has become increasingly recognized as a factor that can reduce the <label data-term-id="CDR0000045417" data-language="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">quality of life<input type="checkbox"></label> of <label data-term-id="CDR0000045333" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">cancer<input type="checkbox"></label> patients. There is even some evidence that extreme <label data-term-id="CDR0000454701" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">distress<input type="checkbox"></label> is associated with poorer <label data-term-id="CDR0000044168" data-language="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">clinical<input type="checkbox"></label> outcomes. <label data-term-id="CDR0000044168" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">Clinical<input type="checkbox"></label> guidelines are available to help doctors and <label data-term-id="CDR0000269445" data-language="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">nurses<input type="checkbox"></label> assess levels of <label data-term-id="CDR0000454701" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">distress<input type="checkbox"></label> and help patients manage it.</p>` +
`<p>This fact sheet provides a general introduction to the <label data-term-id="CDR0000450122" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">stress<input type="checkbox"></label> that people may experience as they <label data-term-id="CDR0000454700" data-language="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">cope<input type="checkbox"></label> with <label data-term-id="CDR0000045333" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">cancer<input type="checkbox"></label>.&nbsp;More detailed information about specific <label data-term-id="CDR0000454766" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">psychological<input type="checkbox"></label> <label data-term-id="CDR0000651193" data-language="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">conditions<input type="checkbox"></label> related to <label data-term-id="CDR0000450122" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">stress<input type="checkbox"></label> can be found in the Related Resources and Selected References at the end of this fact sheet.</p></div>`;

export default {
  inputHtml,
  apiPayload,
  apiResponse,
  suggestedHTML,
};
