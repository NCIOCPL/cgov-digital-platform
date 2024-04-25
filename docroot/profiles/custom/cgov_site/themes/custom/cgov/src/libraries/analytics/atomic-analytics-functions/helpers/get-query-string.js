/**
 * get any value from the query string
 * @param pv_queryParam {string} - accepts multiple comma-delimited param names; will return value of first param found
 * @param pv_url {string=} - if NOT provided, defaults to current page url/address;
 */
export default function (pv_queryParam, pv_url) {
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
};
