// This example has just text and no pre-existing definition elements.

// NOTE: This interesting formatting is so it can match up to the payload I copied from
// the existing UI.
const inputHtml =
  `<p>Just as cancer affects your physical health, it can bring up a wide range of feelings you’re not used to dealing with. It can also make&nbsp;existing&nbsp;feelings seem more intense. They may change daily, hourly, or even minute to minute. This is true whether you’re currently in treatment, done with treatment, or a friend or family member. These feelings are all normal.</p>` +
  `<p>Often the values you grew up with affect how you think about and&nbsp;cope with cancer. For example some people:</p>` +
  `<ul>` +
  `<li>Feel they have to be strong and protect their friends and families</li>` +
  `<li>Seek support and turn to loved ones or other cancer survivors</li>` +
  `<li>Ask for help from counselors or other professionals</li>` +
  `<li>Turn to their faith to help them cope</li>` +
  `</ul>` +
  `<p>Whatever you decide, it's important to do what's right for you and not to compare yourself with others. Your friends and family members may share some of the same feelings. If you feel comfortable, share this information with them.</p>`;

const apiPayload = {
  "fragment":"<p>Just as cancer affects your physical health, it can bring up a wide range of feelings you’re not used to dealing with. It can also make&nbsp;existing&nbsp;feelings seem more intense. They may change daily, hourly, or even minute to minute. This is true whether you’re currently in treatment, done with treatment, or a friend or family member. These feelings are all normal.</p><p>Often the values you grew up with affect how you think about and&nbsp;cope with cancer. For example some people:</p><ul><li>Feel they have to be strong and protect their friends and families</li><li>Seek support and turn to loved ones or other cancer survivors</li><li>Ask for help from counselors or other professionals</li><li>Turn to their faith to help them cope</li></ul><p>Whatever you decide, it's important to do what's right for you and not to compare yourself with others. Your friends and family members may share some of the same feelings. If you feel comfortable, share this information with them.</p>",
  "languages":["en"],
  "dictionaries":["Cancer.gov"]
};

const apiResponse = [
  {
      "start": 11,
      "length": 6,
      "doc_id": "CDR0000045333",
      "language": "en",
      "first_occurrence": true,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 365,
      "length": 3,
      "doc_id": "CDR0000044362",
      "language": "en",
      "first_occurrence": true,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 453,
      "length": 4,
      "doc_id": "CDR0000454700",
      "language": "en",
      "first_occurrence": true,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 463,
      "length": 6,
      "doc_id": "CDR0000045333",
      "language": "en",
      "first_occurrence": false,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 627,
      "length": 6,
      "doc_id": "CDR0000045333",
      "language": "en",
      "first_occurrence": false,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 634,
      "length": 9,
      "doc_id": "CDR0000450125",
      "language": "en",
      "first_occurrence": true,
      "dictionary": "Cancer.gov"
  },
  {
      "start": 745,
      "length": 4,
      "doc_id": "CDR0000454700",
      "language": "en",
      "first_occurrence": false,
      "dictionary": "Cancer.gov"
  }
];

const suggestedHTML = `<div><p>Just as <label data-term-id="CDR0000045333" data-language="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">cancer<input type="checkbox"></label> affects your physical health, it can bring up a wide range of feelings you’re not used to dealing with. It can also make&nbsp;existing&nbsp;feelings seem more intense. They may change daily, hourly, or even minute to minute. This is true whether you’re currently in treatment, done with treatment, or a friend or family member. These feelings are <label data-term-id="CDR0000044362" data-language="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">all<input type="checkbox"></label> normal.</p><p>Often the values you grew up with affect how you think about and&nbsp;<label data-term-id="CDR0000454700" data-language="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">cope<input type="checkbox"></label> with <label data-term-id="CDR0000045333" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">cancer<input type="checkbox"></label>. For example some people:</p><ul><li>Feel they have to be strong and protect their friends and families</li><li>Seek support and turn to loved ones or other <label data-term-id="CDR0000045333" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">cancer<input type="checkbox"></label> <label data-term-id="CDR0000450125" data-language="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">survivors<input type="checkbox"></label></li><li>Ask for help from counselors or other professionals</li><li>Turn to their faith to help them <label data-term-id="CDR0000454700" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">cope<input type="checkbox"></label></li></ul><p>Whatever you decide, it's important to do what's right for you and not to compare yourself with others. Your friends and family members may share some of the same feelings. If you feel comfortable, share this information with them.</p></div>`;

export default {
  inputHtml,
  apiPayload,
  apiResponse,
  suggestedHTML,
};
