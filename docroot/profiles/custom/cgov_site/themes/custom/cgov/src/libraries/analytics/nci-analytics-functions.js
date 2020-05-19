// global
const oga_pattern = /grants\-training\/grants/gi;
const cct_pattern = /grants\-training\/training/gi;
const pdq_pattern = /pdq/gi;
const pageName = 'D=pageName';

var NCIAnalytics = {

    displayAlerts: false,
    debug: false,
    stringDelimiter: '|',
    fieldDelimiter: '~',

    /**
     * Determines site section based on page path; Returns empty string if no match is found; Used as c66 prefix
     * @author Evolytics <nci@evolytics.com>
     * @since 2016-08-08
     * @param {string=} pagePathOverride - Optional override to use in place of document.location.pathname
     * @returns {string}
     */
    siteSection: (function(pagePathOverride) {
        var path = pagePathOverride || document.location.pathname;

        if(oga_pattern.test(path)) { return('oga'); }
        if(cct_pattern.test(path)) { return('cct'); }
        if(pdq_pattern.test(path)) { return('pdq'); }
        return('');

    })(),

    SelectedOptionList: function(listId, delimiter) {
        // get all selected options under the given id
        var selected = document.getElementById(listId).selectedOptions;

        if (selected.length > 0) {
            var selArray = [].slice.call(selected);
            return (
                selArray.map(function(option) {
                    return option.textContent;  // return the text of each option
                })
                .join(delimiter));  // join array with delimiter
        }
        return '';
    },

    ClickParams: function(sender, reportSuites, linkType, linkName) {
        /*
         The facility for defining report suites by the parameter reportSuites
         has been discontinued - now report suites are defined in the s_account variable
         set in the Omniture s_code.js file.  The supporting code for the parameter method
         has been retained in case the requirements change.
         */
        this.ReportSuites = (s_account) ? s_account : 'ncidevelopment'; // Formerly the reportSuites argument

        // For debugging only
        if (NCIAnalytics.debug) {
            console.log('Debug NCIAnalytics.ClickParams():');
            console.log(s.account);
        };
        this.sender = sender;
        this.LinkType = linkType;
        this.LinkName = linkName;
        this.Props = {};
        this.Evars = {};
        this.Events = {};
        this.EventsWithIncrementors = {};

        this.LogToOmniture = function() {

            // Only fire off click events if the s_gi() function is found
            var local_s;
            if (typeof(s_gi) === 'function' && this.ReportSuites) {
                local_s = s_gi(this.ReportSuites);
            } else {
                return;
            }
            local_s.linkTrackVars = '';

            // add language prop8 - Warning: adding prop8 to individual onclick functions will cause duplication
            local_s['prop8'] = document.querySelector('[lang="es"]') ? 'spanish' : 'english';
            local_s.linkTrackVars += 'channel,';
            local_s.linkTrackVars += 'prop8';

            for (var i in this.Props) {
                local_s['prop' + i] = this.Props[i];

                if (local_s.linkTrackVars.length > 0)
                    local_s.linkTrackVars += ',';

                local_s.linkTrackVars += 'prop' + i;
            }

            // add link page prop (prop67) to all link tracking calls when not already present; existing values are given preference
            if(!this.Props[67]) {

                local_s['prop67'] = pageName;

                if (local_s.linkTrackVars.length > 0)
                  local_s.linkTrackVars += ',';

                local_s.linkTrackVars += 'prop67';
            }

            // add engagement score (event92) to all link tracking calls
            if(local_s.mainCGovIndex >= 0) {
                try {
                    var engagementScore = '';
                    var engagementObject = 'NCIEngagement';

                    // depends on engagement plugin
                    engagementScore = window[engagementObject].getAndResetEngagementCookie() || 0;

                    if (engagementScore && parseInt(engagementScore) > 0) {
                        // add the engagement event, but check to see if EventsWithIncrementors is an array before doing so
                        if (this.EventsWithIncrementors && this.EventsWithIncrementors.hasOwnProperty('push')) {
                            this.EventsWithIncrementors.push('92=' + engagementScore); // add to existing events
                        } else {
                            this.EventsWithIncrementors = ['92=' + engagementScore]; // it's the only event
                        }
                    }
                } catch (err) {
                    /** console.log(err); */
                }
            }

            // add link.href value (prop4) to all link tracking calls when not already present; existing values are given preference
            if(!this.Props[4]) {
                local_s['prop4'] = 'D=pev1';

                if (local_s.linkTrackVars.length > 0)
                  local_s.linkTrackVars += ',';

                local_s.linkTrackVars += 'prop4';
            }

            // add language eVar2 - Warning: adding eVar2 to individual onclick functions will cause duplication
            local_s['eVar2'] = local_s['prop8'];
            if (local_s.linkTrackVars.length > 0)
                local_s.linkTrackVars += ',';
            local_s.linkTrackVars += 'eVar2';

            for (var i in this.Evars) {
                local_s['eVar' + i] = this.Evars[i];

                if (local_s.linkTrackVars.length > 0)
                    local_s.linkTrackVars += ',';

                local_s.linkTrackVars += 'eVar' + i;
            }

            if (this.Events.length > 0) {
                var eventsString = '';
                if (local_s.linkTrackVars.length > 0)
                    local_s.linkTrackVars += ',';
                local_s.linkTrackVars += 'events';

                for (var i = 0; i < this.Events.length; i++) {
                    if (eventsString.length > 0)
                        eventsString += ',';

                    eventsString += 'event' + this.Events[i];
                }
                local_s.linkTrackEvents = eventsString;
                local_s.events = eventsString;
            }

            // provide support for events including values (event999=4) or serial ids (event999:abc123)
            if (this.EventsWithIncrementors.length > 0) {
                var eventNum = '',
                    eventsString = '',
                    cleanEventsString = '';
                if (local_s.linkTrackVars.length > 0 && local_s.linkTrackVars.indexOf('events') < 0)
                    local_s.linkTrackVars += ',';
                local_s.linkTrackVars += 'events';

                for (var i = 0; i < this.EventsWithIncrementors.length; i++) {
                    if (eventsString.length > 0)
                        eventsString += ',';

                    eventNum = 'event' + this.EventsWithIncrementors[i];
                    eventsString += eventNum;

                    cleanEventsString = eventNum.split(':');
                    cleanEventsString = cleanEventsString[0].split('=');
                    cleanEventsString = cleanEventsString[0];

                }
                local_s.linkTrackEvents = (local_s.linkTrackEvents) ? local_s.linkTrackEvents + ',' + cleanEventsString : cleanEventsString;
                local_s.events = (local_s.events) ? local_s.events + ',' + eventsString : eventsString;;
            }

            local_s.tl(sender, this.LinkType, this.LinkName);

            //Clear events and all props and eVars set in this click event image request
            local_s.events = '';
            for (var i in this.Props) {
                local_s['prop' + i] = '';
            }
            for (var i in this.Evars) {
                local_s['eVar' + i] = '';
            }

            if (NCIAnalytics.displayAlerts) {
                var alertString =
                    'ScriptBuilder:\n' +
                    'local_s.linkTrackVars=' + local_s.linkTrackVars;
                if (local_s.linkTrackEvents != 'None')
                    alertString += '\nlocal_s.linkTrackEvents=' + local_s.linkTrackEvents;

                if (local_s.linkTrackVars.length > 0) {
                    var linkTrackVarArray = local_s.linkTrackVars.split(',');
                    for (var i = 0; i < linkTrackVarArray.length; i++) {
                        if (linkTrackVarArray[i] != 'events') {
                            alertString += '\nlocal_s.' + linkTrackVarArray[i];
                            alertString += '=' + local_s[linkTrackVarArray[i]];
                        }
                    }
                }
                alertString += '\nReport Suites=' + this.ReportSuites;
                alertString += '\nLink Type=' + this.LinkType;
                alertString += '\nLink Name=' + this.LinkName;
                alert(alertString);
            }
        }
    },

    //*********************** onclick functions ************************************************************
    SiteWideSearch: function(sender) {
        var searchType = 'sitewide';
        var keyword = ' ';
        if (document.getElementById('swKeyword') && document.getElementById('swKeyword').value)
        {
            keyword = document.getElementById('swKeyword').value;
        }
        if (document.getElementById('swKeywordQuery') && document.getElementById('swKeywordQuery').value)
        {
            keyword = document.getElementById('swKeywordQuery').value;
        }
        // if (s.prop8.toLowerCase() == 'spanish')
            // searchType += '_spanish';

        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'SiteWideSearch');
        clickParams.Props = {
            11: searchType,
            14: keyword
        };
        clickParams.Evars = {
            11: searchType,
            13: '+1',
            14: keyword
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    PageNotFound: function(sender){
        var language = sender.dataset.language;
        var searchType = 'pagenotfoundsearch';
        var keyword = document.getElementById('nfKeyword').value;

        if (language === 'es'){
            searchType += '_spanish';
        }

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'PageNotFound');
        clickParams.Props = {
            11: searchType,
            14: keyword
        };
        clickParams.Evars = {
            11: searchType,
            13: '+1',
            14: keyword
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    SiteWideSearchResultsSearch: function(sender, keyWordTextBoxID, searchRadioButtonsID) {
        var keyword = document.getElementById(keyWordTextBoxID).value;
        var e = document.getElementsByName(searchRadioButtonsID);

        for (var i = 0; i < e.length; i++) {
            if (e[i].checked) {
                if (e[i].value == 2) {
                    var searchType = 'sitewide_bottom_withinresults';
                    break;
                }
                else {
                    var searchType = 'sitewide_bottom_new';
                    break;
                }
            }
        }

        // if (s.prop8.toLowerCase() == 'spanish')
        //     searchType += '_spanish';

        // the Omniture s_code file generates 'class does not support Automation' errors on the
        // dataSrc, dataFld, and dataFormatAs properties the 'SEARCH' Image button = therefore reference to
        // the control is being set to null instead of sender
        var clickParams = new NCIAnalytics.ClickParams(this,
            'nciglobal', 'o', 'SiteWideSearchResultsSearch');
        clickParams.Props = {
            11: searchType,
            14: keyword
        };
        clickParams.Evars = {
            11: searchType,
            13: '+1',
            14: keyword
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    SiteWideSearchResults: function(sender, isBestBet, resultIndex) {
        var searchModule = (isBestBet) ? 'best_bets' : 'generic';

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'SiteWideSearchResults');
        clickParams.Props = {
            12: searchModule,
            13: resultIndex
        };
        clickParams.Evars = {
            12: searchModule
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    TermsDictionarySearch: function(sender, isSpanish) {
        var prop24Contents = (document.getElementById('radioStarts').checked) ? 'starts with' : 'contains';

        NCIAnalytics.TermsDictionarySearchCore(sender,
            document.getElementById('AutoComplete1').value,
            prop24Contents,
            'TermsDictionarySearch',
            isSpanish);
    },

    //******************************************************************************************************
    GeneticsDictionarySearch: function(sender, searchString, isStartsWith) {
        var prop24Contents = (isStartsWith) ? 'starts with' : 'contains';

        var clickParams = new NCIAnalytics.ClickParams(sender,
            '', 'o', 'GeneticsDictionarySearch');
        clickParams.Props = {
            11: 'dictionary_genetics',
            22: searchString,
            24: prop24Contents
        };
        clickParams.Evars = {
            11: 'dictionary_genetics',
            13: '+1',
            26: prop24Contents
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //Created this function to be consistent with the Term Dictionary search.
    //Since, we are not sure if the doc sites are using this function; Dion recommend I leave
    //the original function GeneticsDictionarySearch alone.
    //******************************************************************************************************
    GeneticsDictionarySearchNew: function(sender) {
        var prop24Contents = (document.getElementById('radioStarts').checked) ? 'starts with' : 'contains';

        var clickParams = new NCIAnalytics.ClickParams(sender,
            '', 'o', 'GeneticsDictionarySearch');
        clickParams.Props = {
            11: 'dictionary_genetics',
            22: document.getElementById('AutoComplete1').value,
            24: prop24Contents
        };
        clickParams.Evars = {
            11: 'dictionary_genetics',
            13: '+1',
            26: prop24Contents
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();

    },

    //******************************************************************************************************
    GeneticsDictionarySearchAlphaList: function(sender, value) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            '', 'o', 'GeneticsDictionarySearchAlphaList');
        clickParams.Props = {
            11: 'dictionary_genetics',
            22: value,
            24: 'starts with'
        };
        clickParams.Evars = {
            11: 'dictionary_genetics',
            13: '+1',
            26: 'starts with'
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    GeneticsDictionaryResults: function(sender, resultIndex) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            '', 'o', 'GeneticsDictionaryResults');
        clickParams.Props = {
            13: resultIndex
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    TermsDictionarySearchAlphaList: function(sender, value) {

        NCIAnalytics.TermsDictionarySearchCore(sender,
            value,
            'starts with',
            'TermsDictionarySearchAlphaList',
            false);
    },

    //******************************************************************************************************
    TermsDictionarySearchAlphaListSpanish: function(sender, value) {

        NCIAnalytics.TermsDictionarySearchCore(sender,
            value,
            'starts with',
            'TermsDictionarySearchAlphaList',
            true);
    },

    //******************************************************************************************************
    TermsDictionarySearchCore: function(sender, value, prop24Contents, linkName, isSpanish) {

        if (isSpanish)
            var searchType = 'diccionario';
        else
            var searchType = 'dictionary_terms';

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', linkName);
        clickParams.Props = {
            11: searchType,
            22: value,
            24: prop24Contents
        };
        clickParams.Evars = {
            11: searchType,
            13: '+1',
            26: prop24Contents
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    TermsDictionaryResults: function(sender, resultIndex) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'TermsDictionaryResults');
        clickParams.Props = {
            13: resultIndex
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    DrugDictionarySearch: function(sender) {
        var prop24Contents = (document.getElementById('radioStarts').checked) ? 'starts with' : 'contains';

        NCIAnalytics.DrugDictionarySearchCore(sender,
            document.getElementById('AutoComplete1').value,
            prop24Contents,
            'DrugDictionarySearch');
    },

    //******************************************************************************************************
    DrugDictionarySearchAlphaList: function(sender, value) {

        NCIAnalytics.DrugDictionarySearchCore(sender,
            value,
            'starts with',
            'DrugDictionarySearchAlphaList');
    },

    //******************************************************************************************************
    DrugDictionarySearchCore: function(sender, value, prop24Contents, linkName) {
        var searchType = 'dictionary_drugs';

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal,ncidrugdictionary', 'o', linkName);
        clickParams.Props = {
            11: searchType,
            22: value,
            24: prop24Contents
        };
        clickParams.Evars = {
            11: searchType,
            13: '+1',
            26: prop24Contents
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    DrugDictionaryResults: function(sender, resultIndex) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal,ncidrugdictionary', 'o', 'DrugDictionaryResults');
        clickParams.Props = {
            13: resultIndex
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    FeaturedClinicalTrialSearch: function(sender) {
        var searchType = 'clinicaltrials_featured';
        var keyword = document.getElementById('keyword').value;

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'FeaturedClinicalTrialSearch');
        clickParams.Props = {
            11: searchType,
            22: keyword
        };
        clickParams.Evars = {
            11: searchType,
            13: '+1'
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    NewsSearch: function(sender, searchType) {
        var keyword = document.getElementById('keyword').value;
        var startDate = document.getElementById('startMonth').options[document.getElementById('startMonth').selectedIndex].text.replace(/^\s+|\s+$/g, '') + ' '
            + document.getElementById('startYear').value;
        var endDate = document.getElementById('endMonth').options[document.getElementById('endMonth').selectedIndex].text + ' '
            + document.getElementById('endYear').value;

        NCIAnalytics.KeywordDateRangeSearch(sender, searchType, keyword, startDate, endDate);
    },

    //******************************************************************************************************
    GeneticServicesDirectorySearch: function(sender) {
        var searchType = 'genetics';
        var typeOfCancer = '';
        var familyCancerSyndrome = '';
        var city = document.getElementById(ids.txtCity).value;
        var state = '';
        var country = '';
        var lastName = document.getElementById(ids.txtLastName).value;
        var searchCriteria = '';
        var specialty = '';
        var selected = '';
        var list;

        //get Type(s) of Cancer
        typeOfCancer = NCIAnalytics.SelectedOptionList(ids.selCancerType,
            NCIAnalytics.stringDelimiter);

        // get Family Cancer Syndrome
        familyCancerSyndrome = NCIAnalytics.SelectedOptionList(ids.selCancerFamily,
            NCIAnalytics.stringDelimiter);

        //get State(s)
        state = NCIAnalytics.SelectedOptionList(ids.selState,
            NCIAnalytics.stringDelimiter);

        //get Country(ies)
        country = NCIAnalytics.SelectedOptionList(ids.selCountry,
            NCIAnalytics.stringDelimiter);

        searchCriteria =
            [typeOfCancer, familyCancerSyndrome, city, state, country, lastName]
                .join(NCIAnalytics.fieldDelimiter);
        specialty = [typeOfCancer, familyCancerSyndrome].join(NCIAnalytics.fieldDelimiter);

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'GeneticServicesDirectorySearch');
        clickParams.Props = {
            11: searchType,
            22: searchCriteria,
            23: specialty
        };
        clickParams.Evars = {
            11: searchType,
            13: '+1',
            25: specialty
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    KeywordDateRangeSearch: function(sender, searchType, keyword, startDate, endDate) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'KeywordDateRangeSearch');
        clickParams.Props = {
            11: searchType,
            22: keyword
        };
        clickParams.Evars = {
            11: searchType,
            23: startDate,
            24: endDate,
            13: '+1'
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    KeywordSearch: function(sender, searchType) {
        var keyword = document.getElementById('keyword').value;

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'KeywordSearch');
        clickParams.Props = {
            11: searchType,
            22: keyword
        };
        clickParams.Evars = {
            11: searchType,
            13: '+1'
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    SearchResults: function(sender, resultIndex) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'SearchResults');
        clickParams.Props = {
            13: resultIndex
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    PDFLink: function(sender) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'd', 'PDFLink');
        clickParams.Evars = {
            30: '+1'
        };
        clickParams.Events = [6];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************

    DownloadKindleClick: function(sender) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'd', 'DownloadKindleClick');
        clickParams.Evars = {
            30: '+1'
        };
        clickParams.Events = [22];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************

    DownloadOtherEReaderClick: function(sender) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'd', 'DownloadOtherEReaderClick');
        clickParams.Evars = {
            30: '+1'
        };
        clickParams.Events = [23];
        clickParams.LogToOmniture();
    },


    //******************************************************************************************************
    eMailLink: function(sender) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'eMailLink');

        clickParams.Props = {
            43: 'Email',
            66: ((NCIAnalytics.siteSection) ? NCIAnalytics.siteSection + '_' : '') + 'email'
        };

        clickParams.Events = [17];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    HelpLink: function(sender) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'HelpLink');
        clickParams.Events = [5];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    PrintLink: function(sender) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'PrintLink');

        clickParams.Props = {
            43: 'Print',
            66: ((NCIAnalytics.siteSection) ? NCIAnalytics.siteSection + '_' : '') + 'print'
        };

        clickParams.Events = [17];
        clickParams.LogToOmniture();
    },
    //******************************************************************************************************
    SendToPrinterLink: function(sender) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'SendToPrinterLink');
        clickParams.Events = [14];
        clickParams.LogToOmniture();
    },
    //******************************************************************************************************
    HeaderLink: function(sender, headerName) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'HeaderLink-' + headerName);
        clickParams.Props = {
            36: headerName
        };
        clickParams.Evars = {
            36: headerName
        };
        clickParams.Events = [16];
        clickParams.LogToOmniture();
    },
    //******************************************************************************************************
    FooterLink: function(sender, footerName) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'FooterLink-' + footerName);
        clickParams.Props = {
            36: footerName
        };
        clickParams.Evars = {
            36: footerName
        };
        clickParams.Events = [16];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    RightNavLink: function(sender, label) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'RightNavLink-');

        clickParams.Props = {
            27: sender.innerHTML, // Right Navigation Section Clicked c27
            66: ((NCIAnalytics.siteSection) ? NCIAnalytics.siteSection + '_' : '') + sender.innerHTML.toLowerCase()
        };
        clickParams.Evars = {
            49: sender.innerHTML // Right Navigation Section Clicked v49 | visit | recent
        };

        clickParams.Events = [8];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    GenericLinkTrack: function(sender, label, linkName='GenericLinkTrack') {
        let clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', linkName);
        clickParams.Props = {
            4: sender.href,
            5: pageName,
            28: label
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    /** @deprecated */
    LinkTracking: function(toLink, fromLink, label) {
        NCIAnalytics.GenericLinkTrack(fromLink, label, 'LinkTracking');
    },

    //******************************************************************************************************
    CustomLink: function(sender, linkData) {
        if (linkData == null || typeof(linkData) === 'undefined') {
            linkData = '';
        }
        let data = linkData.split('|');
        let linkName = data[0] || 'CustomLink';
        let label = data[1] || '';
        NCIAnalytics.GenericLinkTrack(sender, label, linkName);
    },

    /* ********************************************************************** */
    GovDelivery: function(sender, label) {
        let clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'GovDelivery');
        clickParams.Props = {
            4: label,
            5: pageName
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    /**
     * Generic / global link tracking method
     * @param {object} payload
     * @param {object=} [payload.sender=true] - html element clicked, defaults to Boolean true
     * @param {string} payload.label - text of link clicked
     * @param {string} payload.eventList - used to specify adobe success events
     * @param {string} payload.timeToClickLink - time (in seconds) elapsed from page load to first link clicked
     * @example NCIAnalytics.GlobalLinkTrack({sender:this, label:this.textContent, siteSection: 'oga', eventList: 'ogapreaward'});
     */
    GlobalLinkTrack: function(payload) {
      var events = '', eventsWithIncrementors = '', // placeholder for success events, if needed
        sender = payload.sender || true, // default to Boolean true if no object passed
        label = payload.label || '',
        section = this.siteSection || '',
        hash = document.location.hash,
        isTrackable = true;

      if(payload.eventList) {
        switch(payload.eventList.toLowerCase()) {
          case 'ogapreaward':   events = [101]; break;
          case 'ogareceiving':  events = [102]; break;
          case 'ogacloseout':   events = [103]; break;
          case 'cctappdownload':events = [104]; break;
          case 'ccthowtoapply': events = [105]; break;
          case 'timetoclick':   eventsWithIncrementors = (payload.timeToClickLink) ? ['106=' + payload.timeToClickLink] : ''; break;
        }
      }

      var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'GlobalLinkTrack');
      var pageDetail = NCIAnalytics.buildPageDetail() || '';

      clickParams.Props = {
          28: pageName + pageDetail,
          48: payload.previousPageMaxVerticalTrackingString || '',
      };
      if(!clickParams.Props[48]) { clickParams.Props[66] = (((section) ? section + '_' : '') + label.toLowerCase()); }

      clickParams.Events = events;
      clickParams.EventsWithIncrementors = eventsWithIncrementors;
      clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    BookmarkShareClick: function(sender) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'BookmarkShareClick');

        var linkText = (sender.title) ? sender.title : sender[0].title;

        clickParams.Props = {
            43: sender.title,
            66: ((NCIAnalytics.siteSection) ? NCIAnalytics.siteSection + '_' : '') + 'social-share_' + linkText.toLowerCase()
        };

        clickParams.Events = [17];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    CustomTweetClick: function(sender, eventCode){
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', eventCode);
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    MegaMenuClick: function(sender, tree) {
        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'MegaMenuClick');

        var pageName = sender.ownerDocument.location.hostname + sender.ownerDocument.location.pathname; // this is the URL
        if (typeof pageNameOverride !== 'undefined')
            localPageName = pageNameOverride;

        /*
         * tree.length == 1 : section/tab level
         * tree.length == 2 : subsection level
         * tree.length == 3 : link level
         */

        if (typeof tree[1] === 'undefined') {
            clickParams.Props = {
                53: tree[0].text,
                54: tree[0].text,
                55: tree[0].text,
                56: pageName
            };
            clickParams.Evars = {
                53: tree[0].text
            };
        }

        if (typeof tree[1] !== 'undefined') {
            // click was sub-section or link-level
            clickParams.Props = {
                53: tree[1].text,
                54: tree[0].text,
                55: tree[0].text,
                56: pageName
            };
            clickParams.Evars = {
                53: tree[1].text
            };
        }

        if (typeof tree[2] !== 'undefined') {
            // click was link-level
            clickParams.Props = {
                53: tree[2].text,
                54: tree[1].text,
                55: tree[0].text,
                56: pageName
            };
            clickParams.Evars = {
                53: tree[2].text
            };
        }

        clickParams.Events = [26];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    MegaMenuDesktopReveal: function(sender, menuText) {
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'MegaMenuDesktopReveal');

        clickParams.Events = [28];
        clickParams.Evars = {
            52: menuText,
            43: "Mega Menu"
        };
        clickParams.Props = {
            52: menuText
        };
        clickParams.LogToOmniture();
    },


    //******************************************************************************************************
    MegaMenuMobileReveal: function(sender) {
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'MegaMenuMobileReveal');

        clickParams.Events = [28];
        clickParams.Evars = {
            43: "Hamburger Menu"
        };
        clickParams.LogToOmniture();
    },


    //******************************************************************************************************
    MegaMenuMobileAccordionClick: function(sender, isExpanded, tree) {
        var state = isExpanded?"Expand":"Collapse";

        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'MegaMenuMobileAccordionClick');

        clickParams.Events = isExpanded?[34]:[35];
        clickParams.Props = {
            73: state + "|" + tree
        };
        clickParams.LogToOmniture();
    },


    //******************************************************************************************************
    MegaMenuMobileLinkClick: function(sender, url, linkText, linkUrl, heading, subHeading) {
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'MegaMenuMobileLinkClick');

        clickParams.Events = [26];
        clickParams.Evars = {
            53: heading
        };
        clickParams.Props = {
            53: heading,
            54: subHeading,
            55: linkText,
            56: url
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    LogoClick: function(sender) {
        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'Logolick');

        var pageName = sender.ownerDocument.location.hostname + sender.ownerDocument.location.pathname; // this is the URL
        if (typeof pageNameOverride !== 'undefined')
            localPageName = pageNameOverride;

        clickParams.Props = {
            53: 'NCI Logo',
            56: pageName
        };

        clickParams.Evars = {
            53: 'NCI Logo'
        };

        clickParams.Events = [26];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    UtilityBarClick: function(sender, linkText) {
        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'UtilityBarDictionaryClick');

        var pageName = sender.ownerDocument.location.hostname + sender.ownerDocument.location.pathname; // this is the URL
        if (typeof pageNameOverride !== 'undefined')
            localPageName = pageNameOverride;

        clickParams.Props = {
            36: linkText,
            53: linkText,
            56: pageName
        };

        clickParams.Evars = {
            36: linkText,
            53: linkText
        };

        clickParams.Events = [16];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    IndexedItemClick: function(sender, title, text, container, index, linkName) {
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', linkName);
        clickParams.Props = {
            57: title,
            58: text,
            59: container + ':' + index,
            60: 'D=pageName'
        };

        switch(linkName) {
            case 'CardClick':
                clickParams.Events = [27];
                break;
            case 'SearchResults':
                clickParams.Props[13] = index;
                break;
            default:
                break;
        }

        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    CardClick: function(sender, cardTitle, linkText, container, containerIndex) {
        NCIAnalytics.IndexedItemClick(sender, cardTitle, linkText, container, containerIndex, 'CardClick');
    },

    //******************************************************************************************************
    CustomIndexedItemClick: function(sender, title, text, linkName, index) {
        NCIAnalytics.IndexedItemClick(sender, title, text, linkName, index, linkName);
    },

    //******************************************************************************************************
    DynamicListItemClick: function(sender, title, index) {
        let linkName = 'SearchResults';
        NCIAnalytics.IndexedItemClick(sender, title, linkName, title, index, linkName);
    },

    //******************************************************************************************************
    TimelyContentZoneTab: function(sender, tabTitle) {
        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'TimelyContentZoneTab');
        clickParams.Props = {
            37: tabTitle
        };
        clickParams.Evars = {
            37: tabTitle
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    TimelyContentZoneLink: function(e, panelTitle) {
        var targ;
        if (!e) var e = window.event;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug
            targ = targ.parentNode;

        if (targ.nodeName == 'IMG')
            targ = targ.parentNode;

        if (targ.nodeName == 'EM')
            targ = targ.parentNode;

        if (targ.nodeName == 'A') {
            var linkText = "";
            var isTag = false;

            var clickParams = new NCIAnalytics.ClickParams(this,
                'nciglobal', 'o', 'TimelyContentZoneLink');

            for (i = 0; i < targ.innerHTML.length; i++) {
                if (targ.innerHTML.charAt(i) == "<")
                    isTag = true;

                if (!isTag)
                    linkText = linkText + targ.innerHTML.charAt(i);

                if (targ.innerHTML.charAt(i) == ">")
                    isTag = false;

            }

            var prefixCheck = targ.innerHTML.toLowerCase();
            if (prefixCheck.search("video_icon.jpg") > -1)
                linkText = "Video: " + linkText;
            else if (prefixCheck.search("audio_icon.jpg") > -1)
                linkText = "Audio: " + linkText;

            clickParams.Props = {
                38: linkText,
                39: targ.href,
                40: panelTitle
            };
            clickParams.Evars = {
                38: linkText,
                39: targ.href,
                40: panelTitle
            };
            clickParams.LogToOmniture();
        }
    },

    //******************************************************************************************************
    QuestionsAboutCancerFooter: function(sender) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'QuestionsAboutCancerFooter');
        clickParams.Events = [5];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    QuestionsAboutCancerHeader: function(sender) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'QuestionsAboutCancerHeader');
        clickParams.Events = [18];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    FindCancerTypeBox: function(sender) {

        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'FindCancerTypeBox');
        clickParams.Events = [19];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    TileCarousel: function(sender, tileTitle, tileURL) {
        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'TileCarousel');
        clickParams.Props = {
            41: tileTitle,
            42: tileURL
        };
        clickParams.Evars = {
            41: tileTitle,
            42: tileURL
        };
        clickParams.Events = [20];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    VideoCarouselClickSwipe: function(sender, value) {
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'VideoCarouselClickSwipe');

        clickParams.Props = {
            66: value,
            67: pageName
        };

        clickParams.Events = [63];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    VideoCarouselComplete: function(sender, value) {
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'VideoCarouselComplete');

        clickParams.Props = {
            66: value,
            67: pageName
        };

        clickParams.Events = [64];
        clickParams.LogToOmniture();
    },

    /* ********************************************************************** */
    ImageCarouselClickSwipe: function(sender, title, type, direction, imgNum, pageName) {
        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'ImageCarouselClick');

        clickParams.Props = {
            66: "imgcar_" + title + "_" + type + "_" + direction + "_" + imgNum,
            67: pageName
        };

        clickParams.Events = [62];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    Resize: function(sender, viewPort) {
        var width = 'ResizedTo' + viewPort;
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', width);
        clickParams.Evars = {
            5: viewPort
        };
        clickParams.Events = [7];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    OnThisPageClick: function(sender, linkText, pageName) {
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'OnThisPageClick');
        linkText = "OnThisPage_" + linkText;
        var href = sender.getAttribute ? sender.getAttribute('href') : sender[0].getAttribute('href');
        clickParams.Props = {
            4: href,
            66: linkText,
            67: pageName
        };
        clickParams.Events = [29];

        // account for cct 'how to apply' success event
        if(linkText.search(/^OnThisPage_how\sto\sapply/gi) > -1) {
            clickParams.Events.push(105);
        }

        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    InThisSectionClick: function(sender, linkText, pageName) {
        var clickParams = new NCIAnalytics.ClickParams (sender, 'nciglobal', 'o', 'InThisSectionClick');

        clickParams.Props = {
            66: "InThisSection_" + linkText,
            67: pageName
        };
        clickParams.Events = [69];

        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    PDQMobileClick: function(sender, linkText, isExpanded, pageName) {
        var state = isExpanded?"AccordionSectionExpand_":"AccordionSectionCollapse_";
        var clickParams = new NCIAnalytics.ClickParams (sender, 'nciglobal', 'o', 'PDQMobileClick');

        clickParams.Events = isExpanded?[31]:[32];

        clickParams.Props = {
            66: state + linkText,
            67: pageName
        };

        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    BackToTopReveal: function(sender, reveal) {
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'BackToTopReveal');

        clickParams.Events = [20];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    BackToTopClick: function(sender, isUtilityBarVisible) {
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'BackToTopClick');

        clickParams.Events = [21];
        clickParams.Props = {
            50: isUtilityBarVisible?"UtilityBarShowing":"UtilityBarHidden"
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    SectionMenuButtonClick: function(sender, heading) {
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'SectionMenuButtonClick');

        clickParams.Events = [30];
        clickParams.Evars = {
            43: "Section Menu",
            45: heading
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    SectionAccordionClick: function(sender, url, isExpanded, heading, parent) {
        var state = isExpanded?"Expand":"Collapse";
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'SectionAccordionClick');

        clickParams.Events = isExpanded?[31]:[32];
        clickParams.Evars = {
            43: "Section Menu",
            45: heading
        };
        clickParams.Props = {
            68: state + "|" + parent,
            66: ((NCIAnalytics.siteSection) ? NCIAnalytics.siteSection + '_' : '') + state.toLowerCase() + "|" + parent.toLowerCase()
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    SectionLinkClick: function(sender, url, heading, linkText, depth) {
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'SectionLinkClick');

        clickParams.Events = [33];

        // account for cct 'how to apply' success event
        if(linkText.search(/^how\sto\sapply/gi) > -1) {
            clickParams.Events.push(105);
        }

        clickParams.Evars = {
            43: "Section Menu",
            45: heading
        };
        clickParams.Props = {
            66: ((NCIAnalytics.siteSection) ? NCIAnalytics.siteSection + '_' : '') + linkText.toLowerCase(),
            69: heading,
            70: linkText,
            71: depth,
            72: url
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    fontResizer: function(sender, fontSize, onload) {
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'fontResizer');

        if(!onload){
            clickParams.Events = [36];
        }
        clickParams.Props = {
            42: fontSize,
            66: ((NCIAnalytics.siteSection) ? NCIAnalytics.siteSection + '_' : '') + 'font-resize_' + ((fontSize) ? fontSize.toLowerCase() : '')
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    CalloutBoxLinkTrack: function(sender, label, linkName) {
        let callOut = 'CallOut';
        let link = linkName + callOut;
        let value = [linkName, callOut, label].join('_');
        let clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', link);

        clickParams.Props = {
            66: value
        };
        clickParams.LogToOmniture();
    },

    /******************************************************************************************************
    * General accordion click tracking
    * sender - the element responsible for this event.
    * accordionId - identifier for the whole accordion
	* sectionId - identifier for the clicked accordion section
	* name - readable accordion section name
	* action - expand or collapse
	*/
    AccordionClick: function(sender, accordionId, sectionId, name, action) {
        var clickParams = new NCIAnalytics.ClickParams(this, 'nciglobal', 'o', 'LinkTracking');

        var accordionInfo = accordionId;
        if(sectionId) accordionInfo += ('|' + sectionId);
        if(name) accordionInfo += ('|' + name);
        if(action) accordionInfo += ('|' + action);
        clickParams.Props = {
            41: accordionInfo
        };
        clickParams.LogToOmniture();
    },

    // Home Page Delighter Click
    // sender - the element responsible for this event.
    // type - the delighter type.
    // value - pageName
    HomePageDelighterClick: function(sender, type, value) {
        if( type === 'hp_find'){
            var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'HomePageFindDelighter');
            clickParams.Props = {
                5 : 'hp_find ct delighter|' + value,
				66 : 'delighter_findclinicaltrials'
            };
            clickParams.LogToOmniture();
        }
    },

	// Record that an item in the delighter rail was clicked.
	// sender - the element responsible for this event.
	// type - the delighter type.
	RecordDelighterRailClick: function(sender, type) {
		if( type === 'livehelp'){
			var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'DelighterLiveChat');
			clickParams.Props = {
				5 : 'rrail_chat with us|' + pageName
			};
			clickParams.LogToOmniture();
		}
	},

	// Record that the proactive chat prompt was displayed.
	// sender - the element responsible for this event.
	RecordProactiveChatPromptDisplay: function(sender){
		var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'ProactiveChat');
		clickParams.Props = {
			5 : 'livehelp_proactive chat - display|' + pageName
		};
		clickParams.Events = [45];
		clickParams.LogToOmniture();
	},

	// Record that the proactive "Chat Now" button was clicked.
	// sender - the element responsible for this event.
	RecordProactiveChatPromptClick: function(sender){
		var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'ProactiveChat');
		clickParams.Props = {
			5 : 'livehelp_proactive chat - launch|' + pageName
		};
		clickParams.Events = [44];
		clickParams.LogToOmniture();
	},

	// Record that the proactive chat prompt was dismissed.
	// sender - the element responsible for this event.
	RecordProactiveChatPromptDismissal: function(sender){
		var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'ProactiveChat');
		clickParams.Props = {
			5 : 'livehelp_proactive chat - dismiss|' + pageName
		};
		clickParams.Events = [43];
		clickParams.LogToOmniture();
	},

	/******************************************************************************************************
	* Track clicks on CTS feedback form
	* sender - the element responsible for this event.
	*/
	FeedbackFormClick: function(sender, value){
		var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'FeedbackForm');
		clickParams.Props = {
			5 : value + '|' + pageName
		};
		clickParams.LogToOmniture();
	},

    /******************************************************************************************************
	* Track link clicks on CTS pages
	* sender - the element responsible for this event.
	* type - info about which component is being tracked
	* value - pagename
	*/
	SimpleCTSLink: function(sender, type, value) {
		var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'CTSLink');
		clickParams.Props = {
			5: type + '|' + value
		};
		clickParams.LogToOmniture();
	},

    //******************************************************************************************************
    SPLF_Lang: function() {
        //alert('Lang');
    },
    //******************************************************************************************************
    VideoSplashImageClick: function(sender, video, pageName) {
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'OnThisPageClick');

        clickParams.Props = {
            66: "VideoStart_" + video,
            67: pageName
        };
        clickParams.Events = [51];
        clickParams.LogToOmniture();
    },
    //******************************************************************************************************
    BRPiconClick: function(sender, file, pageName) {
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'OnThisPageClick');

        clickParams.Props = {
            66: "FileDownload_" + file,
            67: pageName
        };
        clickParams.Events = [52];
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    BlogArchiveLinkClick: function(sender, pageName){
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'BlogArchiveDateClick');
        var year = NCIAnalytics.getQueryString('year', sender.href);
        var month = NCIAnalytics.getQueryString('month', sender.href);

        clickParams.Props = {
            66: NCIAnalytics.concatCustomLink('Archive'),
            67: pageName,
            50: year + (month ? (":" + month) : "")
        };
        clickParams.Events = [55];
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    BlogSubscribeClick: function(sender, pageName){
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'BlogSubscribeClick');

        clickParams.Props = {
            66: NCIAnalytics.concatCustomLink('Subscribe'),
            67: pageName
        };

        clickParams.Events = [58];
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    BlogArchiveAccordionClick: function(sender, pageName, collapse){
        let clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'BlogAccordionAction');
        let action = 'Archive';
        if (collapse) {
            action = 'Collapse:' + action;
        } else {
            action = 'Expand:' + action;
        }

        clickParams.Props = {
            66: NCIAnalytics.concatCustomLink(action),
            67: pageName
        };
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    BlogBodyLinkClick: function(sender, linkText, pageName){
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'BlogBodyLinkClick');
        clickParams.Props = {
            50: linkText,
            66: NCIAnalytics.concatCustomLink('BodyLink'),
            67: pageName
        };

        clickParams.Events = [56];
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    glossifiedTerm: function(sender, linkText, blogLink){
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'glossifiedTerm');

        clickParams.Props = {
            45: "Glossified Term",
            50: linkText,
            67: pageName
        };

        if(blogLink) {
            clickParams.Props[66] = NCIAnalytics.concatCustomLink('BodyGlossifiedTerm');
        }

        clickParams.Events = [56];
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    RelatedResourceClick: function(sender, linkText, index){
        let clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'RelatedLinkClick');

        clickParams.Props = {
            67: pageName,
            50: linkText
        };

        // Add location if exists.
        if (NCIAnalytics.blogLocation()) {
            clickParams.Events = [57];
            clickParams.Props[66] = NCIAnalytics.concatCustomLink('BlogRelatedResource:' + index);
        } else {
            clickParams.Events = [59];
            clickParams.Props[66] = NCIAnalytics.concatCustomLink('RelatedResource:' + index);
        }

        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    BlogCardClick: function(sender, linkText, containerIndex, pageName) {
        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'BlogFeatureCardClick');

        clickParams.Props = {
            66: NCIAnalytics.concatCustomLink('BlogCard:' + containerIndex),
            67: pageName,
            50: linkText
        };

        clickParams.Events = [54];
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    FeaturedPostsClick: function(sender, linkText, containerIndex, pageName) {
        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'FeaturedPostsClick');

        clickParams.Props = {
            66: NCIAnalytics.concatCustomLink('FeaturedPosts:' + containerIndex),
            67: pageName,
            50: linkText
        };

        clickParams.Events = [54];
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    CategoryClick: function(sender, linkText, containerIndex, pageName) {
        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'CategoryClick');

        clickParams.Props = {
            66: NCIAnalytics.concatCustomLink('Category:' + containerIndex),
            67: pageName,
            50: linkText
        };

        clickParams.Events = [55];
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    OlderNewerClick: function(sender, olderNewer, pageName) {
        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'OlderNewerClick');

        clickParams.Props = {
            66: NCIAnalytics.concatCustomLink(olderNewer),
            67: pageName
        };

        if (NCIAnalytics.blogLocation() == 'Post') {
            clickParams.Events = [55];
        }

        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    TableSortHeaderClick: function(sender) {
        let clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'SortTableHeaderClick');
        clickParams.Props = {
            5: 'table_sort'
        };
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    ProfilePanelLinkClick: function(sender, linkText, token) {
        var clickParams = new NCIAnalytics.ClickParams (sender,
            'nciglobal', 'o', 'ProfilePanelLinkClick');

        clickParams.Props = {
            66: "InstitutionCard_" + token + "_" + linkText,
            67: pageName
        };
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    InfographicClick: function(sender, linkData, pageName) {
        var clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'InfographicClick');

        clickParams.Events = [71];
        clickParams.Props = {
            66:  linkData,
            67: pageName
        };
        clickParams.LogToOmniture();
    }
};

/* End the giant NCIAnalytics object functions */
/* ********************************************************************** */
/* ********************************************************************** */
/* ********************************************************************** */
/* ********************************************************************** */
/* ********************************************************************** */

/**
 * Build the concatenated value for blog custom links (usually prop66).
 *
 * @param {string} value - custom value or indexed item.
 */
NCIAnalytics.concatCustomLink = function(value) {
    let linkArr = [NCIAnalytics.contentGroup()];

    // Add blog values if set.
    if (NCIAnalytics.blogLocation()) {
        linkArr.unshift('Blog');
        linkArr.push(NCIAnalytics.blogLocation());
    }

    // Add custom value if set.
    if (value) {
        linkArr.push(value);
    }

    return linkArr.join('_').trim();
}

/**
 * Get the Blog page location (post, series, or topic)
 */
NCIAnalytics.blogLocation = function() {
    if (NCIAnalytics.getQueryString('topic')) {
        return 'Category';
    } else if (document.querySelector('[content="cgvBlogSeries"], #cgvBody.cgvblogseries')) {
        return 'Series';
    } else if (document.querySelector('[content="cgvBlogPost"], #cgvBody.cgvblogpost')) {
        return 'Post';
    } else return '';
}

/**
 * Get the content group (currently used for prop44, prop66) fron the
 * 'isPartOf' metatag.
 */
NCIAnalytics.contentGroup = function() {
    let metaTag = document.head.querySelector('[name="dcterms.isPartOf"]');
    let metaVal = '';
    if (metaTag) {
        metaVal = metaTag.content || '';
    }
    return metaVal;
}

/**
 * defines page detail value, primary focus is pdq page sections as of initial logic
 * this logic should be part of the initial page load call (s.prop28)
 * @author Evolytics <nci@evolytics.com>
 * @since 2016-08-12
 */
NCIAnalytics.buildPageDetail = function() {
    var hash = document.location.hash,
        return_val = '';

    // find name of current pdq section
    hash = hash.replace(/#?(section|link)\//g, '');
    hash = hash.replace(/#/g, '');
    if (hash) {
        selector = document.querySelector('#' + hash + ' h2');
        if(selector) {
            return_val = selector.textContent.toLowerCase();
        }
	}

    // add '/' as prefix, if return_val exists and '/' not already present
    if (return_val && return_val.indexOf('/') != 0) {
        return_val = '/' + return_val;
    }
    return (return_val);
};

/**
 * Start page load timer for use with custom link tracking
 */
NCIAnalytics.startPageLoadTimer = function () {
    window.pageLoadedAtTime = new Date().getTime();
}

/**
 * Start the pageLoadTimer if the DOM is loaded or document.readyState == complete
 */
if (document.readyState === "complete" ||
   (document.readyState !== "loading" && !document.documentElement.doScroll)) {
    NCIAnalytics.startPageLoadTimer();
} else {
    document.addEventListener('DOMContentLoaded', NCIAnalytics.startPageLoadTimer);
}

/**
 * dynamic link tracking for http://www.cancer.gov/grants-training
 * tracks clicks on all links to an oga or cct page, including time from page load to link click
 * @author Evolytics <nci@evolytics.com>
 * @since 2016-08-12
 */
NCIAnalytics.dynamicGrantsTraining = function () {
    let grantsTrainingLinks = document.querySelectorAll("#content a[href*='grants-training']");
    let linksArray = [].slice.call(grantsTrainingLinks);

    // Add the 'click' event listener to each link containting 'grants-training'
    linksArray.forEach(function(element) {
        element.addEventListener('click', setTimeToClick)
    });

    // Set the "timetoclick" event (106) for specified grants-training links
    function setTimeToClick(e) {
        let href = e.target.href;
        let destinationSiteSection = '';

        // identify destination site section; used to determine whether or not to send a call
        if (oga_pattern.test(href)) {
            destinationSiteSection = 'oga';
        } else if (cct_pattern.test(href)) {
            destinationSiteSection = 'cct'
        }

        if (destinationSiteSection && window.pageLoadedAtTime) {
            let linkText = e.target.textContent.toLowerCase().substring(0, 89).trim();
            let linkClickedAtTime = new Date().getTime();

            NCIAnalytics.GlobalLinkTrack({
                sender: this,
                label: (destinationSiteSection) ? destinationSiteSection + '_' + linkText : linkText,
                timeToClickLink: Math.round((linkClickedAtTime - window.pageLoadedAtTime) / 1000), // calculate time to click
                eventList: 'timetoclick' // specify success event (event106)
            });
        }
    };

}

/***********************************************************************************************************
/**
 * Creates or updates specified cookie
 * @param {string} pv_cookieName - name of cookie to create/update
 * @param {string} pv_cookieValue - value to store in cookie
 * @param {string=} pv_expireDays - optional number of days to store cookie (defaults to session expiration)
 * @example this.cookieWrite('my_cookie', 'example', '10');
 */
NCIAnalytics.cookieWrite = function(pv_cookieName, pv_cookieValue, pv_expireDays) {
    var exdate = (pv_expireDays) ? new Date() : '';
    if (exdate) {
        exdate.setDate(exdate.getDate() + pv_expireDays || 0);
        exdate = exdate.toUTCString();
    }

    var h = window.location.hostname;
    h = h.split('.');
    h = h.splice(h.length - 2, 2); //grab lst 2 positions of hostname (ie//"example.com")
    h = h.join('.');

    var aryCookieCrumbs = [];
    aryCookieCrumbs.push(pv_cookieName + '=' + encodeURI(pv_cookieValue));
    aryCookieCrumbs.push('path=/');
    aryCookieCrumbs.push('domain=' + h);
    if (exdate) {
        aryCookieCrumbs.push('expires=' + exdate);
    }
    document.cookie = aryCookieCrumbs.join(';');
}

/**
 * Retrieve cookie value
 * @param {string} c_name - name of cookie to retrieve
 * @return {string} cookie value
 * @example this.getCookie('cookie_name'); => {string} cookie value
 */
NCIAnalytics.cookieRead = function(c_name) {
    if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            var c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return decodeURI(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}

/**
 * calculate visible page percentages on page load and max percent of previous page viewed based on scroll depth
 * @author Evolytics <nci@evolytics.com>
 * @since 2016-09-30
 * @returns {object}
 * @param {object} payload
 * @param {Boolean} payload.updateOnly - Restricts functionality when updating data; Typically only used with onscroll
 * @param {Boolean} payload.reset - Simulates a true page load/broswer referesh on SPA pages
 * @param {string} payload.source - Identifies location where call to getScrollDetails occurred
 * @param {string} payload.pageOverride - Override value for last element of TrackingString properties
 * @requires s
 */
NCIAnalytics.getScrollDetails = function(payload) {
    var previousPageScroll = NCIAnalytics.previousPageMaxVerticalTrackingString || '',
        pageSection = '';

    var page = pageName + ((pageSection) ? '/' + pageSection : '');

    if (payload) {
        // only grab the previousPageScroll value from cookie if NOT a scroll update
        if (payload.updateOnly != true) {
            previousPageScroll = NCIAnalytics.cookieRead('nci_scroll');
            NCIAnalytics.cookieWrite('nci_scroll', ''); // assume we only want to use the value once
        }

        // manual reset for pages that update length without a page load/refresh (simulate a new page load)
        if (payload.reset === true) {
            NCIAnalytics.maxVerticalScroll = 0;
            NCIAnalytics.maxPageHeight = 0;
            NCIAnalytics.scrollDetails_orig = "";
        }

        // allows for special handling based on where the getScrollDetails() call originates
        if (payload.source) {
            // console.info('source: ' + payload.source);
        }

        // allow for override of page property
        if (payload.pageOverride) {
            page = payload.pageOverride;
        }
    }

    page = page.replace(/www\.cancer\.gov/i, '').replace(/\s/gi, '-').toLowerCase();

    var maxVerticalScroll = NCIAnalytics.maxVerticalScroll || 0,
        maxPageHeight = NCIAnalytics.maxPageHeight || 0,
        viewportHeight = window.innerHeight,
        verticalScrollDistance = window.pageYOffset,
        fullPageHeight = (function() {
            var body = document.body,
                html = document.documentElement;

            var height = Math.max(body.scrollHeight, body.offsetHeight,
                html.clientHeight, html.scrollHeight, html.offsetHeight
            );
            return (height);
        })();

    // calculate max scroll distance, always choosing larger of current scroll distance and max distance already recorded
    NCIAnalytics.maxVerticalScroll = (verticalScrollDistance > maxVerticalScroll) ? verticalScrollDistance : maxVerticalScroll;
    NCIAnalytics.maxPageHeight = (fullPageHeight > maxPageHeight) ? fullPageHeight : maxPageHeight;

    // calculate percentages and total pixels viewed
    var totalPageViewed = NCIAnalytics.maxVerticalScroll + viewportHeight;
    var percentAboveFoldAtLoad = Math.round(100 * (viewportHeight / fullPageHeight));
    var percentOfTotalPageViewed = Math.round(100 * (totalPageViewed / NCIAnalytics.maxPageHeight));

    // create object for packaging up the data
    function updateScrollDetails(pv_scrollObject) {
        var retVal = pv_scrollObject || {};

        // measurements
        retVal.viewportHeight = viewportHeight; // px
        retVal.fullPageHeight = fullPageHeight; // px
        retVal.verticalScrollDistance = verticalScrollDistance; // px
        retVal.maxVerticalScroll = NCIAnalytics.maxVerticalScroll; // px
        retVal.maxPageHeight = NCIAnalytics.maxPageHeight; // px
        retVal.totalPageViewed = totalPageViewed; // px

        // capture percentAboveFoldAtLoad and generate tracking string
        retVal.percentAboveFoldAtLoad = (percentAboveFoldAtLoad === Infinity) ? 100 : percentAboveFoldAtLoad;
        // retVal.percentAboveFoldAtLoadTrackingString = retVal.percentAboveFoldAtLoad + 'pct|' +
        //     NCIAnalytics.maxPageHeight + 'px|' + page;

        retVal.percentOfTotalPageViewed = (percentOfTotalPageViewed === Infinity) ? 100 : percentOfTotalPageViewed;
        retVal.previousPageMaxVerticalTrackingString = previousPageScroll;

        return (retVal);
    }

    NCIAnalytics.scrollDetails = updateScrollDetails();

    // set cookie for capture on next page (or next non-updateOnly call to this function)
    NCIAnalytics.cookieWrite('nci_scroll',
        NCIAnalytics.scrollDetails.percentOfTotalPageViewed + 'pct|' +
        NCIAnalytics.scrollDetails.percentAboveFoldAtLoad + 'pct|' +
        NCIAnalytics.maxPageHeight + 'px|' +
        page
    );

    // preserve values captured first time function is called (on page load)
    if (!NCIAnalytics.scrollDetails_orig || NCIAnalytics.scrollDetails_orig == "") {
        NCIAnalytics.scrollDetails_orig = updateScrollDetails();
    }

    // send analytics call
    if(payload && payload.sendCall === true) {
        var hash = document.location.hash || '';
        // If this is a PDQ page, track scroll pct as a click event
        if(hash.match(/^(#link|#section)/) != null) {
            NCIAnalytics.GlobalLinkTrack({
                // percentAboveFoldAtLoadTrackingString: NCIAnalytics.scrollDetails.percentAboveFoldAtLoadTrackingString,
                previousPageMaxVerticalTrackingString: NCIAnalytics.scrollDetails.previousPageMaxVerticalTrackingString
            })
        }
    }

    // console.table(NCIAnalytics.scrollDetails);
    return (NCIAnalytics.scrollDetails);
};

/**
 * builds page detail-like string, including pageName and hash value
 * for pdq content, checks for section name in html based on provided hash/section id
 * @param {object} payload
 * @param {string} payload.hash
 * @param {string} payload.page
 * @returns {string}
 */
function buildPageOverride(payload) {
    var retVal = '',
        section = '',
        hash = payload.hash,
        page = payload.page;

    retVal = page || '';

    // clean up the hash, if needed
    hash = hash.replace(/^\#?section\//i, '');

    // get the page detail (section name) string
    section = NCIAnalytics.buildPageDetail();
    section = (section) ? section : hash; // default to hash value if nothing returns from buildPageDetail()
    section = section.replace(/^\//, '');

    // stitch it all together
    retVal += (section) ? '/' + section : '';

    return(retVal);
}

/**
 * watches for any change in value for specified variables
 * @param {object} payload
 * @param {string} payload.name - name of variable being monitored; stored in window scope as window[payload.name]
 * @param payload.value
 * @param {function} payload.callback - action to complete if variable value changes
 */
function changeMonitor(payload) {
  var variableName = payload.name,
      variableValue = payload.value;

  if(window[variableName] != variableValue) {
    // console.info('window["' + variableName + '"] has changed from ' + window[variableName] + ' to "' + variableValue + '"');
    var fireCallback = true;

    if(variableName === 'hash' && variableValue.indexOf('#link/') > -1) { fireCallback = false; }

    if(fireCallback) {
        if(payload.callback) {
          payload.callback();
        }
    }
    window[variableName] = variableValue;
  }
}

/**
 * cross-browser eventListener logic
 * @author Evolytics <nci@evolytics.com>
 */
export function attachEvents(payload) {
    var element = payload.element,
        event = payload.event,
        action = payload.action;

    if (element['addEventListener']) {
        element['addEventListener'](event, action);
    } else if (element['attachEvent']) {
        element['attachEvent']('on' + event, action);
    }
}

// trigger initial NCIAnalytics.getScrollDetails() call on window.load, but can be called inline, prior
// to calling adobe's s.t() method
attachEvents({
    element: window,
    event: 'load',
    action: function() {
        NCIAnalytics.getScrollDetails({
            source: 'window.load',
            //sendCall: true,
            pageOverride: buildPageOverride({page: pageName, hash: document.location.hash})
        });
    }
});

// on scroll, start timer. once scroll stops, run specified function...
var timer;
attachEvents({
    element: window,
    event: 'scroll',
    action: function() {
        clearTimeout(timer);
        timer = setTimeout(function() {
            NCIAnalytics.getScrollDetails({
                updateOnly: true,
                source: 'window.scroll',
                pageOverride: buildPageOverride({page: pageName, hash: document.location.hash})
            })
        }, 150);
    }
});

/**
 * monitor for changes in document.location.hash
 */
attachEvents({
    element: window,
    event: 'hashchange',
    action: function() {
        changeMonitor({
            name: 'hash',
            value: document.location.hash,
            callback: function() {
                setTimeout(function() {
                    NCIAnalytics.getScrollDetails({
                        source: 'hashMonitor', // optional; identifies where getScrollInfo call origniated
                        reset: true, // clears history, treating the dynamic content as a brand new page load
                        sendCall: true, // sends link tracking call with scroll data
                        pageOverride: buildPageOverride({
                            page: pageName,
                            hash: document.location.hash
                        })
                    });
                }, 100); // wait 100ms after change; allows for page resizing and content updates to complete
            }
        });
    }
});


/**
 * determine if variable is null, undefined or blank ("")
 * @param variable {string}
 * @author Evolytics <nci@evolytics.com>
 * @since 2017-04-28
 * @returns {Boolean}
 */
NCIAnalytics.isVarEmpty = function(variable) {
    if ((variable === null) || (typeof(variable) === "undefined" || (variable === ""))) {
        return true;
    } else {
        return false;
    }
}

/**
 * get any value from the query string
 * @param pv_queryParam {string} - accepts multiple comma-delimited param names; will return value of first param found
 * @param pv_url {string=} - if NOT provided, defaults to current page url/address;
 */
NCIAnalytics.getQueryString = function(pv_queryParam, pv_url) {
    var returnVal = '',
        fullSubString,
        splitSubString;

    fullSubString = (pv_url) ? pv_url.slice(pv_url.indexOf("?") + 1) : window.location.search.substring(1);

    var subStringArray = fullSubString.split("&");
    var queryParamArray = pv_queryParam.split(",");

    if(subStringArray.length > 0) {
        for (var i = 0, maxi = subStringArray.length; i < maxi; i++) { // loop through params in query string
            var paramValue = subStringArray[i].split("=");
            for (var ii = 0, maxii = queryParamArray.length; ii < maxii; ii++) { //loop through params in pv_queryParam
                if (paramValue[0].toLowerCase() == queryParamArray[ii].toLowerCase()) {
                    returnVal = (paramValue[1]) ? unescape(paramValue[1]) : "";
                    returnVal = returnVal.replace(/\+/g, " "); //replace "+" with " "
                    returnVal = returnVal.replace(/^\s+|\s+$/g, ""); //trim trailing and leading spaces from string
                    return returnVal;
                }
            }
        }
    }
    return(returnVal);
}

/**
 * build channel stack cookie for cross-visit participation
 * @param payload {object}
 * @param payload.cookieName {string} - cookie name
 * @param payload.cookieValue {string} - value to add to cookie
 * @param payload.returnLength {number} - number of items to stack
 * @param payload.delimiter {string} - delimiter for stacked values
 * @param payload.expire {number} - number of days until cookie expires
 */
NCIAnalytics.crossVisitParticipation = function(payload) {
    var cookieValue = (payload.cookieValue) ? payload.cookieValue.replace("'", "") : "",
        cookieArray = (NCIAnalytics.cookieRead(payload.cookieName)) ? NCIAnalytics.cookieRead(payload.cookieName).split(",") : "",
        expireDate = payload.expire, //new Date(),
        returnValue;

    if (cookieValue) {
        if ((cookieArray == "none") || (NCIAnalytics.isVarEmpty(cookieArray))) { //does the cookie exist, with data?
            var newCookieArray = [cookieValue]; //build the new array with payload.cookieValue
            NCIAnalytics.cookieWrite(payload.cookieName, newCookieArray, expireDate); //create the new cookie
            return (cookieValue); //return new string
        } else {
            var mostRecent = cookieArray[0];
            if (mostRecent != cookieValue) { //is the current payload.cookieValue same as last?
                cookieArray.unshift(cookieValue); //if not, add it
                if (cookieArray.length >= payload.returnLength) {
                    cookieArray.length = payload.returnLength
                }; //make sure array length matches payload.returnLength
                NCIAnalytics.cookieWrite(payload.cookieName, cookieArray, expireDate); //update the cookie with new values
            }
        }
    }
    returnValue = (cookieArray) ? cookieArray.reverse().join(payload.delimiter) : ''; //build the return string using payload.delimiter
    return (returnValue);
}


NCIAnalytics.urs = {
    config: {
        campaignPrefixDelimiter: '_',

        // referring url categories
        internalDomains: ['cancer.gov', 'nci.nih.gov', 'smokefree.gov'],
        searchEngines: [
            'alibaba.com', 'aol.', 'ask.com', 'baidu.com', 'bing.com', 'duckduckgo.com',
            'google.', 'msn.com', 'search.yahoo.', 'yandex.'
        ],
        socialNetworks: [
            'facebook.com', 'flickr.com', 'instagram.com', 'linkedin.com', 'pinterest.com', 'plus.google.com',
            'reddit.com', 't.co', 'tumblr.com', 'twitter.com', 'yelp.com', 'youtube.com'
        ],
        govDomains: ['.gov'], // specific gov domains; change to '.gov' to include all gov domains
        eduDomains: ['.edu'], // specific edu domains; change to '.edu' to include all edu domains

        // cid/tracking code patterns for channel recogniation
        pattEmail: /^(e(b|m)_)|((eblast|email)\|)/i,
        pattPaidSocial: /^psoc_/i,
        pattSocial: /^((soc|tw|fb)_|(twitter|facebook)\||sf\d{8}$)/i,
        pattSem: /^(sem|ppc)_/i,
        pattAffiliate: /^aff_/i,
        pattPartner: /^ptnr_/i,
        pattDisplay: /^bn_/i,
        pattDr: /^dr_/i, // direct response
        pattInternal: /^int_/i,

        // channel stacking (cross visit participation)
        channelStackDepth: 5,
        channelStackDelimiter: '>',
        channelStackExpire: 180, // cookie expiration days
        channelStackCookie: 'nci_urs_stack' // name of channel stack cookie
    },

    /**
     * @description retieves list of # most recent marketing channel sources for visitor
     * @param payload {object}
     * @param payload.channel {string}
     * @param payload.ursCookie {string}
     * @author Evolytics <nci@evolytics.com>
     * @since 2017-04-28
     * @returns {object}
     */
    getStacked: function(payload) {
        var ursCookie = payload.ursCookie,
            channel = payload.channel,
            returnValue = '';

        if (channel) {
            returnValue = NCIAnalytics.crossVisitParticipation({
                cookieName: ursCookie,
                cookieValue: channel,
                returnLength: this.config.channelStackDepth,
                delimiter: this.config.channelStackDelimiter,
                expire: this.config.channelStackExpire
            });
        }

        return (returnValue);
    },

    /**
     * returns the tracking code (channel) prefix for use with channel stacking
     * @author Evolytics <nci@evolytics.com>
     * @since 2017-04-28
     * @param campaign {string=} - tracking code (cid, utm_, etc.)
     * @param delimiter {string=} - character separating tracking code prefix from rest of string
     * @returns {string}
     */
    getPrefix: function(campaign, delimiter) {
        var returnValue = '';
        delimiter = delimiter || '_';
        if (campaign) {
            returnValue = campaign.split(delimiter)[0];
        }
        return (returnValue);
    },

    /**
     * @param refDomain {string} - referring domain (hostname)
     * @param referrer {string} - full referring url
     * @param searchEngines {array} - array of known search engines
     */
    getSeoStatus: function(refDomain, searchEngines, referrer) {
        var refDomain = refDomain,
            isSeo = false,
            isGoogle = (referrer.indexOf('.google.') > -1) ? true : false,
            isYahoo = (referrer.indexOf('search.yahoo.com') > -1) ? true : false,
            isYandex = (referrer.indexOf('.yandex.') > -1) ? true : false;

        if (isGoogle || isYahoo || isYandex) {
            isSeo = true;
        } else if (referrer && searchEngines.indexOf(refDomain) > -1) {
            isSeo = true;
        }

        return (isSeo);
    },

    /**
     * urs logic
     * @param payload {object}
     * @param payload.campaign {string=} - tracking code
     * @param payload.referrer {string=} - referring url
     * @author Evolytics <nci@evolytics.com>
     * @since 2017-04-28
     * @returns {object}
     * @example NCIAnalytics.urs.get({ campaign: 'ppc_sample_tracking_code', 'https://www.google.com/' });
     */
    get: function(payload) {
        var trafficType = '',
            ursValue = '',
            ursPrefix = '',
            ppcKeyword = '',
            seoKeyword = '',
            refDomain = '',
            refSubDomain = '',
            isInternalDomain = false,
            campaign = (payload.campaign) ? payload.campaign : '',
            referrer = (payload.referrer) ? payload.referrer : ((document.referrer) ? document.referrer : '');


        // extract referring domain from referrer; exclude subdomain/cname
        var refInfo = (function(referrer) {
            var info = {
                domain: '',
                subDomain: '',
                tld: ''
            };
            if (referrer) {
                info.domain = referrer.split('/')[2].split('.'); // get hostname from referring url
                info.subDomain = info.domain.join('.'); // full domain, including subdomain/cname
                info.domain = (info.domain.length > 2) ? info.domain.slice(1, info.domain.length) : info.domain;
                info.tld = info.domain[info.domain.length - 1];
                info.domain = info.domain.join('.'); // strip subdomain/cname from hostname
            }
            return (info);
        })(referrer);

        var tld = refInfo.tld,
            refDomain = refInfo.domain,
            refSubDomain = refInfo.subDomain;

        // determine marketing channel based on business rules and regex patterns set in this.urs.config
        if (!campaign && !referrer && !refDomain) {
            trafficType = 'direct-dnt';
            ursValue = campaign;
        } else if (campaign.search(this.config.pattDisplay) > -1) {
            trafficType = 'display';
            ursValue = campaign;
        } else if (campaign.search(this.config.pattAffiliate) > -1) {
            trafficType = 'affiliate';
            ursValue = campaign;
        } else if (campaign.search(this.config.pattPartner) > -1) {
            trafficType = 'partner';
            ursValue = campaign;
        } else if (campaign.search(this.config.pattDr) > -1) {
            trafficType = 'dr';
            ursValue = campaign;
        } else if (campaign.search(this.config.pattEmail) > -1) {
            trafficType = 'email';
            ursValue = campaign;

            // account for non-compliant tracking code schema
            if (/^eblast\|/i.test(campaign)) {
                this.config.campaignPrefixDelimiter = '|';
            }
        } else if (campaign.search(this.config.pattSocial) > -1) {
            trafficType = 'social';
            ursValue = campaign;
        } else if (campaign.search(this.config.pattPaidSocial) > -1) {
            trafficType = 'paid_social';
            ursValue = campaign;
        } else if (campaign.search(this.config.pattSem) > -1) {
            trafficType = 'paid_search';
            ursValue = campaign;

            // look for paid search keyword
            if (referrer) {
                ppcKeyword = NCIAnalytics.getQueryString('q,query,search', referrer);
            }
            ppcKeyword = (ppcKeyword) ? ppcKeyword : ('not provided|' + ((refDomain) ? refDomain : trafficType));

            // internal tracking code
        } else if (campaign.search(this.config.pattInternal) > -1) {
            trafficType = 'internal';
            ursValue = campaign;

            // unknown/unrecognized tracking code prefix
        } else if (campaign) { // catch campaigns with unexpected or unknown prefix
            trafficType = 'unknown';
            ursValue = campaign;

            // internal domains (do not track as referrer/channel)
        } else if (referrer && (this.config.internalDomains.indexOf(refDomain) > -1 || this.config.internalDomains.indexOf(refSubDomain) > -1)) {
            trafficType = 'internal-dnt';
            ursValue = '';

            // known social -- include before [seo] because of 'plus.google.com'
        } else if ((referrer && this.config.socialNetworks.indexOf(refDomain) > -1) || refSubDomain === 'plus.google.com') {
            trafficType = 'social';
            ursValue = '[soc]_' + refDomain;

            // known seo
        } else if (this.getSeoStatus(refDomain, this.config.searchEngines, referrer)) {
            trafficType = 'organic_search';
            ursValue = '[seo]_' + refDomain;

            // look for seo keyword
            seoKeyword = NCIAnalytics.getQueryString('q,query,search,text', referrer);
            seoKeyword = (seoKeyword) ? seoKeyword : ('not provided|' + ((refDomain) ? refDomain : trafficType));

            // known government domains
        } else if (referrer && tld === 'gov' && this.config.internalDomains.indexOf(refDomain) < 0) {
            trafficType = 'government_domains';
            ursValue = '[gov]_' + refDomain;

            // known education domains
        } else if (referrer && tld === 'edu') {
            trafficType = 'education_domains';
            ursValue = '[edu]_' + refDomain;

            // unknown referring domains
        } else if (referrer && this.config.govDomains.indexOf(refDomain) < 0) {
            trafficType = 'referring_domains';
            ursValue = '[ref]_' + refDomain;
        }

        ursPrefix = this.getPrefix(ursValue, this.config.campaignPrefixDelimiter);

        // if campaign has an unknown prefix (identified above), set trafficType to match ursPrefix
        if (trafficType === 'unknown') {
            trafficType = ursPrefix;
        }

        if (ursValue != '' && trafficType != 'organic_search') {
            seoKeyword = 'not organic search';
        }

        if (ursValue != '' && trafficType != 'paid_search') {
            ppcKeyword = 'not paid search';
        }

        // return urs information for use in analytics calls
        return ({
            campaign: campaign,
            referrer: referrer,
            refDomain: refDomain,
            value: ursValue,
            prefix: ursPrefix,
            stacked: this.getStacked({
                channel: ursPrefix,
                ursCookie: this.config.channelStackCookie
            }),
            trafficType: trafficType,
            seoKeyword: seoKeyword,
            ppcKeyword: ppcKeyword
        });
    }
}

// Export our NCIAnalytics object.
export { NCIAnalytics };
