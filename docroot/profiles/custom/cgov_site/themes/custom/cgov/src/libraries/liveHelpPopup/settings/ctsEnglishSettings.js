const ctsEnglishSettings = {
    urls: [
        "/about-cancer/treatment/clinical-trials/search",
        "/about-cancer/treatment/clinical-trials/basic",
        "/about-cancer/treatment/clinical-trials/search/a",
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
            <form onsubmit="return false;">
                <input id="chat-button" type="button" name="rn_nciChatLaunchButton_4_Button" class="chat-button" value="Chat Now">
            </form>
            <div class="live-help"></div>    
        </div>
    `,
    optOutDurationDays: 30,
    timerIntervalSeconds: 5,
    interactionDelaySeconds: 10,	// Minimum number of seconds to wait after a user interaction before displaying the prompt.
    startDate: new Date(0), // default start data is 1/1/1970
    endDate: null
}

export default ctsEnglishSettings;