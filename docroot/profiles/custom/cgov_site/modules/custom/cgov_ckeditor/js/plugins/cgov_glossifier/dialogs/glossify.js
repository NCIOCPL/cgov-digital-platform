function requestGlossification(e) {
  const rawBody = this.getParentEditor().getData();
  console.log(rawBody)
  const preparedBody = cGovPrepareStr(rawBody);
  console.log(preparedBody);
  fetch('http://api.open-notify.org/iss-now.json')
    .then(res => res.json())
    .then(res => {
      const { latitude, longitude } = res.iss_position;
      const htmlBody = `
        <h2>ISS Current Position</h2>
        <p>Latitude: ${ latitude }</p>
        <p>Longitude: ${ longitude }</p>
        <br>
        <h2>Test Zone</h2>
        <p>Text without highlights</p>
        <p>Text with unselected <span class="cgov-gloss-unselected">highlights</span></p>
        <p>Text with selected <span class="cgov-gloss-selected">highlights</span></p>
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



// OLD CODE - Not refactored
var cGovCRConst = "&#x000d;";	//carriage return substitute
var cGovLFConst = "&#x000a;";	//line feed substitute

/**
* Prepare the data for sending to web service. Replace cr and lf with code, mark old web service
* provided URLs with __oldterm
*/
function cGovPrepareStr(data) {
	//alert("In cGovPrepareStr, data= " + data);
	var tempData = data;
	var result="";
	// These expressions look for two specific styles of links and then change them from
	//	<a whatever> to <a __oldterm>
	//	<a href="/dictionary/db_alpha.aspx?expand=s#symptom" onclick="javascript:popWindow('definition','symptom'); return false;">symptoms</a>
	//	<a class="definition" href="/Common/PopUps/popDefinition.aspx?term=bone marrow&amp;version=Patient&amp;language=English" onclick="javascript:popWindow('definition','bone marrow&amp;version=Patient&amp;language=English');  return(false);">bone marrow</a>
	// The most complete patterns (from the old Admin Tool code) don't work here:
	//	<a\s+(href=\"/dictionary/db_alpha.aspx\?expand=.+?>.+?</a>)
	//	<a\\s+(class=\"definition\".+?>.+?</a>)
	// The following two expressions expect the links to be in a particular order. The second set expect
	// a different order. No matter what order they are in in the editor, they always seem to come back the
	// second way. If this turns out to not be the case, we'll have to run the first two expressions as well
	// as the second.
	// var rxDict1 = new RegExp("<a\\s+(href=.+dictionary/db_alpha.aspx.+</a>)","i");
	var rxDef1 = new RegExp("<a\\s+(class=\"definition\".+?>.+?</a>)");
	var rxDict2 = new RegExp("<a\\s+(onclick=\"javascript:popWindow.+?href=.+?dictionary/db_alpha.aspx.+?</a>)","i");
	var rxDef2 = new RegExp("<a\\s+(onclick=\"javascript:popWindow.+?href=.+?popDefinition.aspx.+?</a>)");
	var rxDef3 = new RegExp("<a\\s+(href=\"/Common/PopUps/popDefinition.aspx.+?</a>)");
	tempData = cGovDoRegExp1(rxDict2, tempData);
	tempData = cGovDoRegExp1(rxDef2, tempData);
	tempData = cGovDoRegExp1(rxDef1, tempData);
	tempData = cGovDoRegExp1(rxDef3, tempData);
	for (var i=0;i<tempData.length;i++) {
		var c = tempData.charAt(i);
		if (c == "\n") {
			result += cGovLFConst;
		}
		else if (c == "\r") {
			result += cGovCRConst;
		}
		else if (c == "”") {	//right doulbe quote
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
	//alert("result = " + result);
	return result;
}

/**
* Called for each regex, does the actual work of finding and editing the target link
*/
function cGovDoRegExp1(theRegExp, result) {
	var done = false;
	var offset = 0;
	while (!done) {
		var temp = result.substr(offset);
		if (temp == null) {
			done = true;
		}
		else {
			var target = theRegExp.exec(temp);
			//alert("target = " + target);
			if (target == null) {
				done = true;
			}
			else {
				offset += target.index;
				var iDed = cGovAddUniqueID(target[1]);
				result = result.replace(target[0],iDed);
				//alert("result = " + result);
				offset += iDed.length;
			}
		}
	}
	return result;
}

/**
* Add the __oldterm= to the old links
*/
function cGovAddUniqueID(data) {
	cGovUniqueId++;
	var uniqueID = "<a __oldterm=\"" + cGovUniqueId + "\" " + data;
	return uniqueID;
}

// TEMP MOCKS

const mockRequest = {
  "fragment": "<div class=\"rxbodyfield\">&#x000a;<p>With so many new and promising cancer treatments being developed, the need for clinical trials to efficiently and effectively test them has never been greater.</p>&#x000a;<p>Maximizing the number of patients who are eligible for clinical trials, while still maintaining an appropriate level of safety, is a top priority for NCI leadership, given the challenges of enrolling enough patients in clinical trials. Eligibility criteria&mdash;the requirements that must be met before a person can enroll in a trial&mdash;have not kept pace with the modernization of clinical trials. Restrictive criteria have not only been a significant hurdle for many patients who have wanted to participate in trials, but they have also limited the generalizability of study findings.</p>&#x000a;<p>Over the past several years, NCI has made efforts to address the issue of trial eligibility by working to broaden the criteria for some NCI-funded trials. For example, researchers are encouraged to relax the use of upper age limits in adult trials and <a href=\"https://percussion.cancer.gov:443/Rhythmyx/assembler/render?sys_revision=3&amp;sys_context=0&amp;sys_authtype=0&amp;sys_siteid=305&amp;sys_variantid=2056&amp;sys_contentid=1100977\" sys_contentid=\"1100977\" inlinetype=\"rxhyperlink\" sys_variantid=\"2056\" sys_dependentvariantid=\"2056\" sys_dependentid=\"1100977\" rxinlineslot=\"103\" sys_siteid=\"305\" sys_folderid=\"\" sys_relationshipid=\"7270303\">allow people with cancer who are HIV+ to enroll in trials</a>, as appropriate.</p>&#x000a;<p>Beginning in 2016, the American Society of Clinical Oncology (ASCO) and the advocacy organization, Friends of Cancer Research (Friends), launched an effort to further expand eligibility criteria for cancer clinical trials in the hope that more patients will be able to join trials, leading to more rapid advances in cancer treatment.</p>&#x000a;<p>NCI and Food and Drug Administration (FDA) staff have been key contributors to the ongoing effort. The project has led to new and expanded eligibility recommendations, which NCI translated into language that can be used more easily in clinical trial protocols. This new language is now being used by the NCI-sponsored <a href=\"https://percussion.cancer.gov:443/Rhythmyx/assembler/render?sys_revision=85&amp;sys_context=0&amp;sys_authtype=0&amp;sys_siteid=305&amp;sys_variantid=2297&amp;sys_contentid=770089\" sys_contentid=\"770089\" inlinetype=\"rxhyperlink\" sys_variantid=\"2297\" sys_dependentvariantid=\"2297\" sys_dependentid=\"770089\" rxinlineslot=\"103\" sys_siteid=\"305\" sys_folderid=\"\" sys_relationshipid=\"7270304\">National Clinical Trials Network (NCTN)</a> and <a href=\"https://ctep.cancer.gov/initiativesprograms/etctn.htm\">Experimental Therapeutics Clinical Trials Network (ETCTN)</a>.</p>&#x000a;<h2><strong>Why Are Eligibility Criteria Necessary?</strong></h2>&#x000a;<p>Eligibility criteria are an important part of clinical trials. They help ensure that participants in a trial are alike&nbsp;in terms of specific factors, such as type and stage of cancer, general health, and previous treatment received. When all participants meet the same eligibility criteria, it is more likely that the trial&rsquo;s outcomes are the result of the intervention being tested than of other factors, such as health conditions or chance. Eligibility requirements are also important for patient safety. They decrease the chances that patients who might experience dangerous side effects from a study drug are enrolled in the trial.</p>&#x000a;<p>In 2016, ASCO&ndash;Friends assembled four working groups to develop new recommendations for expanding eligibility criteria. Each group focused on one of four variables that most often exclude a patient&rsquo;s participation in a trial: brain metastases, HIV/AIDS, organ dysfunction and prior and concurrent cancers, and minimum age for enrollment.</p>&#x000a;<p>Working group members, which included scientists, regulators, patient advocates, and industry representatives, used an extensive review process that&nbsp;included an&nbsp;examination of the scientific literature and available clinical results. They analyzed variables such as the number of potential patients who were excluded from enrolling in trials and whether trials that had less restrictive eligibility criteria had higher rates of serious adverse events.</p>&#x000a;<p>Members developed recommendations for new eligibility criteria that would be appropriate for both early- and late-phase trials. However, some differences in the criteria for trials of different phases were unavoidable. For example, in early-phase trials, because less is known about the drugs being tested, stricter eligibility criteria are necessary to help ensure that patients are not put at undue risk.</p>&#x000a;<p>Once the ASCO&ndash;Friends working groups&rsquo; recommendations were agreed upon, NCI compiled them into a final document that outlined new <a href=\"https://ctep.cancer.gov/protocolDevelopment/docs/NCI_ASCO_Friends_Eligibility_Criteria.pdf\">inclusion/exclusion criteria required for NCI-sponsored NCTN and ETCTN clinical trials</a>. These criteria were implemented in November 2018.</p>&#x000a;<p>In developing the final document, NCI also broadened the focus. For instance, the NCI language addresses eligibility of not only patients with HIV but also patients with other viral infections, including hepatitis B and C. All ETCTN and NCTN trials must follow the new eligibility criteria unless researchers provide strong scientific rationale not to do so.</p>&#x000a;<p>Patients in clinical trials that are now following the new inclusion criteria will be more representative of the real-world patient population, thus translating into trial results that are more applicable and meaningful to patients treated in everyday practice.</p>&#x000a;<h2><strong>Other Barriers to Clinical Trial Enrollment</strong></h2>&#x000a;<p>Although restrictive eligibility criteria can exclude patients from participating in clinical trials, there are many other barriers to participation.</p>&#x000a;<p>Health care providers may not&nbsp;offer their patients the opportunity to participate in a trial for many reasons. For example, patients may have comorbidities&mdash;other medical conditions&mdash;that may make it difficult for them to tolerate aggressive therapy.</p>&#x000a;<p>And some clinicians may not offer a clinical trial to a patient based on assumptions about the patient. For instance, a provider may assume that a patient lives too far away from the trial location and would have trouble making it&nbsp;to the clinic for trial visits. Or a provider might assume that a patient does not have the social support to adhere to the treatment regimen or would have trouble understanding a very complex trial protocol and be unable to decide whether to participate.</p>&#x000a;<p>NCI encourages health care providers to question these assumptions. We believe that clinicians should present the option to participate in clinical trials to their patients so that they can make informed decisions about trial participation together. Clinicians should not make this decision for their patients.</p>&#x000a;<p>Educating and raising clinicians&rsquo; awareness are essential to promoting clinical trial enrollment. To this end,&nbsp;NCI and many other organizations provide educational opportunities to enhance clinicians&rsquo; understanding of clinical trials and patient enrollment. It is important that health care providers be aware of available clinical trials and talk to their patients when a clinical trial might be an appropriate option for them. Patients themselves can <a href=\"https://percussion.cancer.gov:443/Rhythmyx/assembler/render?sys_revision=102&amp;sys_context=0&amp;sys_authtype=0&amp;sys_siteid=305&amp;sys_variantid=2317&amp;sys_contentid=63867\" sys_contentid=\"63867\" inlinetype=\"rxhyperlink\" sys_variantid=\"2317\" sys_dependentvariantid=\"2317\" sys_dependentid=\"63867\" rxinlineslot=\"103\" sys_siteid=\"305\" sys_folderid=\"\" sys_relationshipid=\"7270305\">learn more about clinical trials</a> and how to ask their providers about participation.</p>&#x000a;<h2><strong>Expanding Criteria while Ensuring Patient Safety: Finding the Right Balance</strong></h2>&#x000a;<p>Because the new NCI eligibility criteria were just implemented, it will take some time before we can evaluate the impact of these specific changes. And other changes to the inclusion criteria may be on the way, given that ASCO&ndash;Friends are convening additional meetings to address eligibility criteria that were not the focus of the initial effort. These include how much treatment patients may have had before entering a trial and what medications a patient might be using to treat other health conditions.</p>&#x000a;<p>Clinical trial enrollment is a complex issue and ongoing critical assessment of clinical trial eligibility criteria is essential to achieve the right balance between expanding criteria while ensuring patient safety. With less restrictive criteria translating into study conclusions that are more relevant to the broader patient population, we can make faster progress in the discovery of new targeted cancer treatments and immunotherapies that will benefit more people.</p>&#x000a;</div>",
  "dictionaries": [
    "Cancer.gov"
  ],
  "languages": [
    "en"
  ]
}

const mockResponse = [
  {
    "start": "67",
    "length": "6",
    "doc_id": "CDR0000045333",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "115",
    "length": "15",
    "doc_id": "CDR0000045961",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "244",
    "length": "3",
    "doc_id": "CDR0000559085",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "265",
    "length": "15",
    "doc_id": "CDR0000045961",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "360",
    "length": "3",
    "doc_id": "CDR0000044267",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "429",
    "length": "15",
    "doc_id": "CDR0000045961",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "446",
    "length": "20",
    "doc_id": "CDR0000346518",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "596",
    "length": "15",
    "doc_id": "CDR0000045961",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "655",
    "length": "11",
    "doc_id": "CDR0000390271",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "692",
    "length": "3",
    "doc_id": "CDR0000559085",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "844",
    "length": "3",
    "doc_id": "CDR0000044267",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "951",
    "length": "3",
    "doc_id": "CDR0000044267",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "1600",
    "length": "8",
    "doc_id": "CDR0000044168",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "1609",
    "length": "8",
    "doc_id": "CDR0000045434",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "1667",
    "length": "6",
    "doc_id": "CDR0000045333",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "1731",
    "length": "20",
    "doc_id": "CDR0000346518",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "1756",
    "length": "6",
    "doc_id": "CDR0000045333",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "1763",
    "length": "15",
    "doc_id": "CDR0000045961",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "1810",
    "length": "4",
    "doc_id": "CDR0000478788",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "1873",
    "length": "6",
    "doc_id": "CDR0000045333",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "1905",
    "length": "3",
    "doc_id": "CDR0000044267",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "1913",
    "length": "28",
    "doc_id": "CDR0000454785",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "1943",
    "length": "3",
    "doc_id": "CDR0000454786",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "2079",
    "length": "3",
    "doc_id": "CDR0000044267",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "2140",
    "length": "14",
    "doc_id": "CDR0000045961",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "2209",
    "length": "3",
    "doc_id": "CDR0000044267",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "2824",
    "length": "20",
    "doc_id": "CDR0000346518",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "2880",
    "length": "20",
    "doc_id": "CDR0000346518",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "2926",
    "length": "15",
    "doc_id": "CDR0000045961",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "2953",
    "length": "6",
    "doc_id": "CDR0000658776",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "3051",
    "length": "5",
    "doc_id": "CDR0000045885",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "3060",
    "length": "6",
    "doc_id": "CDR0000045333",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "3122",
    "length": "3",
    "doc_id": "CDR0000044362",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "3153",
    "length": "20",
    "doc_id": "CDR0000346518",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "3247",
    "length": "12",
    "doc_id": "CDR0000454757",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "3311",
    "length": "10",
    "doc_id": "CDR0000651193",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "3437",
    "length": "3",
    "doc_id": "CDR0000559085",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "3468",
    "length": "12",
    "doc_id": "CDR0000046580",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "3494",
    "length": "4",
    "doc_id": "CDR0000348921",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "3643",
    "length": "20",
    "doc_id": "CDR0000346518",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "3777",
    "length": "16",
    "doc_id": "CDR0000045314",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "3795",
    "length": "3",
    "doc_id": "CDR0000044985",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "3799",
    "length": "4",
    "doc_id": "CDR0000045950",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "3805",
    "length": "5",
    "doc_id": "CDR0000257523",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "3811",
    "length": "11",
    "doc_id": "CDR0000390268",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "3848",
    "length": "7",
    "doc_id": "CDR0000045333",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "3941",
    "length": "10",
    "doc_id": "CDR0000044724",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "4093",
    "length": "10",
    "doc_id": "CDR0000044724",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "4129",
    "length": "8",
    "doc_id": "CDR0000044168",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "4212",
    "length": "3",
    "doc_id": "CDR0000559085",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "4300",
    "length": "20",
    "doc_id": "CDR0000346518",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "4421",
    "length": "20",
    "doc_id": "CDR0000346518",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "4666",
    "length": "5",
    "doc_id": "CDR0000348921",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "4695",
    "length": "20",
    "doc_id": "CDR0000346518",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "4738",
    "length": "6",
    "doc_id": "CDR0000658776",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "4884",
    "length": "3",
    "doc_id": "CDR0000044267",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "5233",
    "length": "3",
    "doc_id": "CDR0000044267",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "5281",
    "length": "3",
    "doc_id": "CDR0000044267",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "5342",
    "length": "3",
    "doc_id": "CDR0000044985",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "5375",
    "length": "5",
    "doc_id": "CDR0000044629",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "5381",
    "length": "10",
    "doc_id": "CDR0000045364",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "5403",
    "length": "11",
    "doc_id": "CDR0000046146",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "5422",
    "length": "3",
    "doc_id": "CDR0000044362",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "5436",
    "length": "4",
    "doc_id": "CDR0000776356",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "5468",
    "length": "20",
    "doc_id": "CDR0000346518",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "5523",
    "length": "10",
    "doc_id": "CDR0000044724",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "5584",
    "length": "15",
    "doc_id": "CDR0000045961",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "5650",
    "length": "4",
    "doc_id": "CDR0000478788",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "5875",
    "length": "14",
    "doc_id": "CDR0000045961",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "5946",
    "length": "20",
    "doc_id": "CDR0000346518",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "6010",
    "length": "15",
    "doc_id": "CDR0000045961",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "6089",
    "length": "21",
    "doc_id": "CDR0000650566",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "6270",
    "length": "10",
    "doc_id": "CDR0000651193",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "6335",
    "length": "10",
    "doc_id": "CDR0000046053",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "6346",
    "length": "7",
    "doc_id": "CDR0000044737",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "6405",
    "length": "14",
    "doc_id": "CDR0000045961",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "6697",
    "length": "14",
    "doc_id": "CDR0000440116",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "6739",
    "length": "7",
    "doc_id": "CDR0000045864",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "6804",
    "length": "8",
    "doc_id": "CDR0000044714",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "6875",
    "length": "3",
    "doc_id": "CDR0000044267",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "6890",
    "length": "21",
    "doc_id": "CDR0000650566",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "7014",
    "length": "15",
    "doc_id": "CDR0000045961",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "7277",
    "length": "14",
    "doc_id": "CDR0000045961",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "7322",
    "length": "3",
    "doc_id": "CDR0000044267",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "7435",
    "length": "15",
    "doc_id": "CDR0000045961",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "7496",
    "length": "21",
    "doc_id": "CDR0000650566",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "7540",
    "length": "15",
    "doc_id": "CDR0000045961",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "7590",
    "length": "14",
    "doc_id": "CDR0000045961",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "8291",
    "length": "3",
    "doc_id": "CDR0000044267",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "8295",
    "length": "20",
    "doc_id": "CDR0000346518",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "8342",
    "length": "4",
    "doc_id": "CDR0000478788",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "8561",
    "length": "20",
    "doc_id": "CDR0000346518",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "8776",
    "length": "10",
    "doc_id": "CDR0000651193",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "8802",
    "length": "14",
    "doc_id": "CDR0000045961",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "8868",
    "length": "10",
    "doc_id": "CDR0000430407",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": true
  },
  {
    "start": "8882",
    "length": "14",
    "doc_id": "CDR0000045961",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "8897",
    "length": "20",
    "doc_id": "CDR0000346518",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "9203",
    "length": "6",
    "doc_id": "CDR0000045333",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  },
  {
    "start": "9246",
    "length": "4",
    "doc_id": "CDR0000478788",
    "dictionary": "Cancer.gov",
    "language": "en",
    "first_occurrence": false
  }
]
