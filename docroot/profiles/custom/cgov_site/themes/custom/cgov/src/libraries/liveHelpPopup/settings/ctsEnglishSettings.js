
// Which chat server should be used? Test or production.
const HOST_SERVER_LIVE = "livehelp.cancer.gov";
const HOST_SERVER_TEST = "nci--tst.custhelp.com";

const currentHost = location.hostname.toLowerCase();
const server = (currentHost === "www.cancer.gov") ? HOST_SERVER_LIVE : HOST_SERVER_TEST;


const ctsEnglishSettings = {
    urls: [
        "/about-cancer/treatment/clinical-trials/search",
        "/about-cancer/treatment/clinical-trials/basic",
        "/about-cancer/treatment/clinical-trials/search/a",
        "/about-cancer/treatment/clinical-trials/search/advanced",
        "/about-cancer/treatment/clinical-trials/search/r",
        "/about-cancer/treatment/clinical-trials/search/v",
        "/about-cancer/treatment/clinical-trials/advanced-search",
        "/about-cancer/treatment/clinical-trials/search/results",
        "/about-cancer/treatment/clinical-trials/search/view",
        /^\/about-cancer\/treatment\/clinical-trials\/disease\/.*/,
        /^\/about-cancer\/treatment\/clinical-trials\/intervention\/.*/
    ],
    popupDelaySeconds: 30, // Number of seconds to delay before displaying the popup.

    popupID: 'ProactiveLiveHelpForCTSPrompt',
    popupBody: `
        <h2 class="title">Need Help Finding a Clinical Trial?</h2>
        <div class="content">
            <p>Information Specialists are available to help you search and answer your questions.</p>
            <div id="chat-button" class="proactive-chat-button">
                <a href="https://${server}" onclick="window.open('https://${server}','LiveHelp','scrollbars=yes,resizable=yes,menubar=yes,toolbar=yes,location=yes,width=650,height=600'); event.preventDefault();"
                   id="proactive-chat-link">Chat Now</a>
            </div>
            <div class="live-help"></div>
        </div>
    `,
    optOutDurationDays: 30,
    timerIntervalSeconds: 5,
    interactionDelaySeconds: 10,    // Minimum number of seconds to wait after a user interaction before displaying the prompt.
    startDate: new Date(0), // default start data is 1/1/1970
    endDate: null
}

export default ctsEnglishSettings;
