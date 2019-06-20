import CookieManager from 'js-cookie';
import LiveChat from 'Core/libraries/liveChat/LiveChat';
import { NCIAnalytics } from 'Core/libraries/analytics/nci-analytics-functions';

export default class ProactiveLiveHelp {
    constructor(options) {
        this.options = options;
        // internal settings
        this.userActivity = {
            lastActivityTime : 0,	// Time of the last keypress.
            activeElement : null	// Last element being interacted with.
        };
        this.popupStatus = false;
        this.countdownIntervalID = "";
        this.initializeActivityCheck();
        this.initializeCountdownTimer();
    }

    // Display a message prompting the user to choose whether they
    // would like to do a chat with a Live Help Specialist.
    displayPrompt() {
        // Before displaying, check whether the user has recently interacted with the UI.
        // If this fires on page load (i.e. the timer has already expired), then the last
        // interaction time is 1/1/1970.
        const secondsSinceLastInteraction = getSecondsSinceLastInteraction(this.userActivity.lastActivityTime);
        if(secondsSinceLastInteraction < this.options.interactionDelaySeconds){
            window.setTimeout(this.displayPrompt.bind(this), 1000); // Retry in a second.
            return;
        }

        // Create the pop up.
        const popupMarkup = `
            <a class="close">X</a>
            ${this.options.popupBody}
        `;
        const popupElement = document.createElement('div');
        popupElement.id = this.options.popupID;
        popupElement.classList.add('ProactiveLiveHelpPrompt');
        popupElement.innerHTML = popupMarkup;
        document.querySelector('body').appendChild(popupElement);

        const popupLiveHelpHandler = () => {
            if(this.options.popupID === 'Spanish-CTSPrompt'){
                LiveChat.openSpanishChatWindow();
            } else {
                LiveChat.openChatWindow();
            }

            this.dismissPrompt();
        }
        document.getElementById('chat-button').addEventListener('click', popupLiveHelpHandler);

        // Center and display the pop up.
        this.makePromptVisible();

        // Set up event handlers for the various ways to close the pop up
        const popupCloseButton = document.querySelector('.ProactiveLiveHelpPrompt .close');
        const popupCloseButtonHandler = () => this.dismissPrompt();
        popupCloseButton.addEventListener('click', popupCloseButtonHandler);

        const liveHelpKeypressListener = (e) => {
            if(e.keyCode === 27 && this.popupStatus === true) {
                this.dismissPrompt();
                document.removeEventListener('keyup', liveHelpKeypressListener)
            }
        }
        document.addEventListener('keyup', liveHelpKeypressListener)

        // Hook up analytics for the dynamically created elements.
        activatePromptAnalytics();
    }


    //TODO: Fadein and fadeout require more substantial change and testing to mimic effect with CSS classes only
    makePromptVisible() {
        // Loads popup only if it is disabled.
        if (this.popupStatus === false) {
            $("#" + this.options.popupID).hide().fadeIn("slow");
            this.popupStatus = true;
        }
    }

    dismissPrompt() {
        if (this.popupStatus === true) {
            //$("#popup-message-background").fadeOut("slow");
            $("#" + this.options.popupID).fadeOut("slow");
            $('#popup-message-content').empty().remove();
            this.popupStatus = false;

            // In any event where the prompt is being dismissed, opt the user
            // out of seeing the pop-up again.
            this.setUserToOptedOut();

            // If possible, return focus to the last-known UI element.
            if (!!this.userActivity.activeElement)
                this.userActivity.activeElement.focus();
        }
    }

    setUserToOptedOut() {
        CookieManager.set(this.options.popupID + '-opt', 'true', {expires: this.options.optOutDurationDays});
    }


    initializeCountdownTimer() {

        // Set the time before checking whether to display the prompt to the less
        // of either the TIMER this.INTERVAL, or the existing time left on the timer.

        var timeleft = this.getCountdownTimeRemaining();
        //set a minimum tick equal to timerIntervalSeconds
        var tick = (( timeleft >= this.options.timerIntervalSeconds ) ? this.options.timerIntervalSeconds : timeleft) * 1000;

        this.countdownIntervalID = window.setInterval(this.decrementCountdownTimer.bind(this), tick);
    }

    decrementCountdownTimer() {
        var timeleft = this.getCountdownTimeRemaining();
        timeleft -= this.options.timerIntervalSeconds;
        CookieManager.set(this.options.popupID + '-timer', timeleft);

        // If the timer hasn't run out yet, keep ticking.
        if (timeleft <= 0) {
            // Otherwise, clear the interval timer and display the prompt.
            window.clearInterval(this.countdownIntervalID);
            this.displayPrompt();
        }
    }

    // Get the amount of time left on the countdown timer. If the
    // timer hasn't been set, return POPUP_DELAY_SECONDS. Guarantee a
    // minimum of zero seconds.
    getCountdownTimeRemaining() {
        var timeleft = CookieManager.get(this.options.popupID + '-timer');
        if (!timeleft) {
            timeleft = this.options.popupDelaySeconds;
                    }
        timeleft = Number(timeleft);
        if (timeleft < 0)
            timeleft = 0;
        return timeleft;
    }

    // Check for keyboard activity in order to avoid displaying the prompt while
    // the user is interacting with an existing UI element.
    initializeActivityCheck() {

        //TODO: CHECK HOW THESE CUSTOM JQUERY LISTENERS WORK TO MIMIC EFFECT
        $(document).on('keypress.PLH',this.recordUserInteraction.bind(this)); // keystroke.
        $(document).on('click.PLH',this.recordUserInteraction.bind(this)); // Mouse click
    }

    recordUserInteraction(event) {
        // Date.now() is not supported by IE before version 9.
        this.userActivity.lastActivityTime =  new Date().getTime();
        this.userActivity.activeElement = document.activeElement;
    }
}


// ############ HELPER FUNCTIONS ##############

const getSecondsSinceLastInteraction = lastActivityTime => {
    const now = new Date().getTime(); // Time in milliseconds
    const elapsed = now - lastActivityTime;
    return Math.floor(elapsed / 1000);
}

// TODO: Rewrite to remove jquery clickhandling
function activatePromptAnalytics () {
    //TODO: REPLACE this WITH window

    // Record prompt activation.
    if (NCIAnalytics && NCIAnalytics.RecordProactiveChatPromptDisplay)
        NCIAnalytics.RecordProactiveChatPromptDisplay($(".ProactiveLiveHelpPrompt"));


    // Set up analytics handler for "Chat Now" button.
    var button = $(".ProactiveLiveHelpPrompt .chat-button");
    if (!!button) {
        button.on('click.PLH',function () {
            if (NCIAnalytics && NCIAnalytics.RecordProactiveChatPromptClick)
                NCIAnalytics.RecordProactiveChatPromptClick(this);
        });
    }

    // Set up analytics for dismissal button.
    button = $(".ProactiveLiveHelpPrompt .close");
    if (!!button) {
        button.on('click.PLH',function () {
            if (NCIAnalytics && NCIAnalytics.RecordProactiveChatPromptDismissal)
                NCIAnalytics.RecordProactiveChatPromptDismissal(this);
        });
    }
}
