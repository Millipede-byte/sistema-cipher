const TOP_ROW = "QWERTYUIOP";
const HOME_ROW = "ASDFGHJKL";
const BOTTOM_ROW = "ZXCVBNM";

const ROWS = [TOP_ROW, HOME_ROW, BOTTOM_ROW];

const NUMBERS = {
    "0": ")",
    "1": "!",
    "2": "@",
    "3": "#",
    "4": "$",
    "5": "%",
    "6": "^",
    "7": "&",
    "8": "*",
    "9": "("
};

function shiftLetter(letter, amount){

    let upper = letter.toUpperCase();

    for(let row of ROWS){

        let pos = row.indexOf(upper);

        if(pos !== -1){

            let newPos =
                (pos + amount + row.length)
                % row.length;

            let result = row[newPos];

            if(letter === letter.toLowerCase())
                return result.toLowerCase();

            return result;
        }
    }

    return letter;
}

function encodeNumber(number){

    let text = String(number);

    let result = "";

    for(let ch of text){

        if(NUMBERS[ch])
            result += NUMBERS[ch];
        else
            result += ch;
    }

    return result;
}

function runCipher(text, decrypt=false){

    let words =
        text.trim().split(/\s+/)
        .filter(w => w.length);

    if(words.length === 0)
        return {
            result:text,
            words:0,
            letters:0,
            shift:0,
            dir:"<"
        };

    let count = words.length;

    let letters =
        [...text]
        .filter(c => /[a-z]/i.test(c))
        .length;

    let firstLetters =
        [...words[0]]
        .filter(c => /[a-z]/i.test(c))
        .length;

    let left =
        firstLetters % 2 === 1;

    let shift =
        left ? -count : count;

    if(decrypt)
        shift = -shift;

    let result = "";

    for(let ch of text)
        result += shiftLetter(ch, shift);

    return {
        result,
        words:count,
        letters:letters,
        shift,
        dir:left ? "<" : ">"
    };
}

function updateDiagnostics(info){

    const shiftDisplay =
        adminMode
            ? info.shift
            : "########";

    const directionDisplay =
        adminMode
            ? info.dir
            : "#";

    document.getElementById(
        "diagnostics"
    ).textContent =
        "WORDS       " +
        info.words
        + "\n" +
        "LETTERS     " +
        info.letters
        + "\n" +
        "SHIFT       " +
        shiftDisplay
        + "\n" +
        "DIRECTION   " +
        directionDisplay;
}

function updateIntelligence(
    operation,
    info,
    elapsed
){

    const input =
        document.getElementById(
            "input"
        ).value;

    const output =
        document.getElementById(
            "output"
        ).value;

    updateCipherDiagnostics(
        operation,
        info,
        elapsed,
        input.length,
        output.length
    );
}


function encryptMessage(){

    startProcessingAnimation();

    let input =
        document.getElementById(
            "input"
        ).value;


    setSystemStatus(
        "processing"
    );


    let start =
        performance.now();


    try {

        let info =
            runCipher(
                input,
                false
            );


        let end =
            performance.now();


        document.getElementById(
            "output"
        ).value =
            info.result;


        updateDiagnostics(
            info
        );

        updateIntelligence(
            "ENCRYPT",
            info,
            end - start
        );

        window.lastCipherInfo = info;
        window.lastCipherElapsed = end - start;

	addActivityLog(
  	  "ENCRYPT",
 	   info
	);

        document.getElementById(
            "timer"
        ).textContent =
            `Computed in ${(end-start).toFixed(3)} ms`;


        stopProcessingAnimation();

        setSystemStatus(
            "online"
        );

    }

    catch (error) {

        console.error(
            error
        );

        stopProcessingAnimation();

        setSystemStatus(
            "error"
        );

        document.getElementById(
            "timer"
        ).textContent =
            "Encryption error.";
    }
}
function decryptMessage(){

    startProcessingAnimation();

    let input =
        document.getElementById(
            "input"
        ).value;


    setSystemStatus(
        "processing"
    );


    let start =
        performance.now();


    try {

        let info =
            runCipher(
                input,
                true
            );


        let end =
            performance.now();


        document.getElementById(
            "output"
        ).value =
            info.result;


        updateDiagnostics(
            info
        );

        updateIntelligence(
            "DECRYPT",
            info,
            end - start
        );

        window.lastCipherInfo = info;
        window.lastCipherElapsed = end - start;

        addActivityLog(
            "DECRYPT",
            info
        );


        document.getElementById(
            "timer"
        ).textContent =
            `Computed in ${(end-start).toFixed(3)} ms`;


        stopProcessingAnimation();

        setSystemStatus(
            "online"
        );

    }

    catch (error) {

        console.error(
            error
        );

        stopProcessingAnimation();

        setSystemStatus(
            "error"
        );


        document.getElementById(
            "timer"
        ).textContent =
            "Decryption error.";

    }
}
function copyResult(){

    navigator.clipboard.writeText(
        document.getElementById(
            "output"
        ).value
    );
}

function clearAll(){

    document.getElementById(
        "input"
    ).value = "";

    document.getElementById(
        "output"
    ).value = "";

    document.getElementById(
        "diagnostics"
    ).textContent = "";

    const resetFields = {
        "intel-operation": "—",
        "intel-words": "—",
        "intel-letters": "—",
        "intel-input-chars": "—",
        "intel-output-chars": "—",
        "intel-shift": adminMode ? "—" : "########",
        "intel-direction": adminMode ? "—" : "#",
        "intel-time": "—",
        "intel-status": "READY"
    };

    Object.keys(resetFields).forEach(id => {

        document.getElementById(id).textContent =
            resetFields[id];

    });

    document.getElementById(
        "intel-operation"
    ).textContent = "—";

    document.getElementById(
        "intel-words"
    ).textContent = "—";

    document.getElementById(
        "intel-letters"
    ).textContent = "—";

    document.getElementById(
        "intel-shift"
    ).textContent = adminMode
        ? "—"
        : "########";

    document.getElementById(
        "intel-direction"
    ).textContent = adminMode
        ? "—"
        : "#";

    document.getElementById(
        "intel-time"
    ).textContent = "—";

    document.getElementById(
        "timer"
    ).textContent = "Ready.";
}
// ============================================================
// SYSTEM STATUS CONTROLLER
// ============================================================

const statusIndicator =
    document.getElementById("status-indicator");

const statusText =
    document.getElementById("status-text");

const statusDots =
    document.getElementById("status-dots");


function setSystemStatus(state) {

    // Remove old states
    document.getElementById(
        "system-status"
    ).classList.remove(
        "status-online",
        "status-processing",
        "status-error"
    );


    if (state === "online") {

        statusIndicator.textContent = "●";
        statusText.textContent = "System Online";

        document.getElementById(
            "system-status"
        ).classList.add(
            "status-online"
        );

        statusDots.style.display =
            "inline-block";

    }


    else if (state === "processing") {

        statusIndicator.textContent = "●";
        statusText.textContent = "Processing";

        document.getElementById(
            "system-status"
        ).classList.add(
            "status-processing"
        );

        statusDots.style.display =
            "inline-block";

    }


    else if (state === "error") {

        statusIndicator.textContent = "●";
        statusText.textContent = "System Error";

        statusDots.textContent = "";

        statusDots.style.display =
            "none";

        document.getElementById(
            "system-status"
        ).classList.add(
            "status-error"
        );
    }
}
// ============================================================
// СИСТЕМА CIFER LOGO ANIMATION
// ============================================================

const REAL_LOGO = "СИСТЕМА CIFER";

const SCRAMBLE_CHARS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    "abcdefghijklmnopqrstuvwxyz" +
    "0123456789" +
    "!@#$%^&*()-_=+[]{}<>?/\\|" +
    "~`" +
    "§±÷×µΩΣΔΛЖФЦЧШЩЭЮЯ" +
    "¤¥€£¢" +
    "#)%$^&*@!" +
    "><{}[]";

function randomCharacter() {

    return SCRAMBLE_CHARS[
        Math.floor(
            Math.random() * SCRAMBLE_CHARS.length
        )
    ];
}


function scrambleLogo() {

    const logo =
        document.getElementById(
            "cifer-logo"
        );

    logo.classList.add(
        "logo-glitch"
    );

    let progress = 0;

    const scrambleInterval =
        setInterval(() => {

            let display = "";

            for (
                let i = 0;
                i < REAL_LOGO.length;
                i++
            ) {

                // Spaces remain spaces
                if (REAL_LOGO[i] === " ") {

                    display += " ";

                    continue;
                }

                // Characters progressively resolve
                if (i < progress) {

                    display += REAL_LOGO[i];

                } else {

                    display += randomCharacter();
                }
            }

            logo.textContent = display;

            progress += 0.45;

            if (
                progress >=
                REAL_LOGO.length
            ) {

                clearInterval(
                    scrambleInterval
                );

                logo.textContent =
                    REAL_LOGO;

                logo.classList.remove(
                    "logo-glitch"
                );

                // Wait 5 seconds before
                // starting the sequence again

                setTimeout(
                    scrambleLogo,
                    5000
                );
            }

        }, 65);
}


// Start animation
scrambleLogo();
// ============================================================
// SYSTEM ONLINE ANIMATION
// ============================================================


let dotCount = 0;

function animateStatus() {

    dotCount++;

    if (dotCount > 3) {
        dotCount = 0;
    }

    statusDots.textContent =
        ".".repeat(dotCount);
}


// Change every 500 milliseconds
setInterval(
    animateStatus,
    500
);
// ============================================================
// PHASE 6: SYSTEM DIAGNOSTICS
// ============================================================

function detectBrowser(){

    const ua = navigator.userAgent;

    if(ua.includes("Edg/"))
        return "Microsoft Edge";

    if(ua.includes("Chrome/"))
        return "Google Chrome";

    if(ua.includes("Firefox/"))
        return "Mozilla Firefox";

    if(ua.includes("Safari/"))
        return "Safari";

    return "Unknown";
}


function detectPlatform(){

    const platform =
        navigator.platform ||
        navigator.userAgentData?.platform ||
        "Unknown";

    if(platform.includes("Win"))
        return "Windows";

    if(platform.includes("Mac"))
        return "macOS";

    if(platform.includes("Linux"))
        return "Linux";

    return platform;
}


function detectBrowserVersion(){

    const ua =
        navigator.userAgent;

    const match =
        ua.match(
            /(?:Chrome|Firefox|Edg|Version)\/([\d.]+)/
        );

    return match
        ? match[1]
        : "Unknown";
}


function updateSystemDiagnostics(){

    document.getElementById(
        "sys-platform"
    ).textContent =
        detectPlatform();

    document.getElementById(
        "sys-browser"
    ).textContent =
        detectBrowser()
        + " "
        + detectBrowserVersion();

    document.getElementById(
        "sys-screen"
    ).textContent =
        `${window.screen.width} × ${window.screen.height}`;

    document.getElementById(
        "sys-language"
    ).textContent =
        navigator.language ||
        "Unknown";

    document.getElementById(
        "sys-timezone"
    ).textContent =
        Intl.DateTimeFormat()
            .resolvedOptions()
            .timeZone ||
        "Unknown";

    let storageStatus =
        "UNAVAILABLE";

    try {

        localStorage.setItem(
            "__cifer_test__",
            "1"
        );

        localStorage.removeItem(
            "__cifer_test__"
        );

        storageStatus =
            "AVAILABLE";

    } catch(error) {

        storageStatus =
            "UNAVAILABLE";

    }

    document.getElementById(
        "sys-storage"
    ).textContent =
        storageStatus;

    document.getElementById(
        "sys-online"
    ).textContent =
        navigator.onLine
            ? "YES"
            : "NO";
}


function updateCipherDiagnostics(
    operation,
    info,
    elapsed,
    inputLength,
    outputLength
){

    document.getElementById(
        "intel-operation"
    ).textContent =
        operation;

    document.getElementById(
        "intel-words"
    ).textContent =
        info.words;

    document.getElementById(
        "intel-letters"
    ).textContent =
        info.letters;

    document.getElementById(
        "intel-input-chars"
    ).textContent =
        inputLength;

    document.getElementById(
        "intel-output-chars"
    ).textContent =
        outputLength;

    document.getElementById(
        "intel-shift"
    ).textContent =
        adminMode
            ? info.shift
            : "########";

    document.getElementById(
        "intel-direction"
    ).textContent =
        adminMode
            ? info.dir
            : "#";

    document.getElementById(
        "intel-time"
    ).textContent =
        elapsed.toFixed(3)
        + " ms";

    document.getElementById(
        "intel-status"
    ).textContent =
        "COMPLETE";

    window.lastCipherInputLength =
        inputLength;

    window.lastCipherOutputLength =
        outputLength;
}

// ============================================================
// ADMIN / USER ACCESS
// ============================================================

const ADMIN_PASSWORD =
    "SafePassword";

let adminMode = false;


function openAdminLogin(){

    if(adminMode){

        adminMode = false;

        updateAccessStatus();

        updateDiagnosticsForCurrentState();

        renderActivityLog();

        return;
    }

    const modal =
        document.getElementById(
            "admin-modal"
        );

    modal.style.display =
        "flex";

    document.getElementById(
        "admin-password"
    ).value = "";

    document.getElementById(
        "admin-error"
    ).textContent = "";

    setTimeout(() => {

        document.getElementById(
            "admin-password"
        ).focus();

    }, 0);
}


function closeAdminLogin(){

    document.getElementById(
        "admin-modal"
    ).style.display =
        "none";
}


function handleAdminKey(event){

    if(event.key === "Enter"){

        authenticateAdmin();

    }

    if(event.key === "Escape"){

        closeAdminLogin();

    }
}


function authenticateAdmin(){

    const password =
        document.getElementById(
            "admin-password"
        ).value;

    if(password === ADMIN_PASSWORD){

        adminMode = true;

        closeAdminLogin();

        updateAccessStatus();

        updateDiagnosticsForCurrentState();

        renderActivityLog();

    } else {

        document.getElementById(
            "admin-error"
        ).textContent =
            "ACCESS DENIED.";

    }
}


function updateAccessStatus(){

    const button =
        document.getElementById(
            "access-status"
        );

    if(adminMode){

        button.textContent =
            "STATUS: ADMIN";

        button.classList.add(
            "admin-active"
        );

    } else {

        button.textContent =
            "STATUS: USER";

        button.classList.remove(
            "admin-active"
        );

    }
}


function updateDiagnosticsForCurrentState(){

    const operation =
        document.getElementById(
            "intel-operation"
        ).textContent;

    if(operation === "—")
        return;

    // Re-run the display formatting using
    // the latest operation's stored values.
    if(window.lastCipherInfo){

        updateDiagnostics(
            window.lastCipherInfo
        );

        updateCipherDiagnostics(
            operation,
            window.lastCipherInfo,
            window.lastCipherElapsed,
            window.lastCipherInputLength || 0,
            window.lastCipherOutputLength || 0
        );
    }
}

// ============================================================
// PHASE 4: PROCESSING ANIMATION CONTROLLER
// ============================================================

const processingContainer =
    document.getElementById(
        "processing-container"
    );

function startProcessingAnimation(){

    processingContainer.style.display =
        "block";
}

function stopProcessingAnimation(){

    processingContainer.style.display =
        "none";
}

// ============================================================
// ACTIVITY LOG
// ============================================================

let activityLog = [];


// Keyboard symbol sequence

const LOG_SYMBOLS =
    "!@#$%^&*()";


// Wrap a single symbol
// Example:
// ^ → %^&
// $ → #$%

function wrapLogSymbol(symbol) {

    const index =
        LOG_SYMBOLS.indexOf(symbol);

    if (index === -1) {
        return symbol;
    }

    const previous =
        LOG_SYMBOLS[
            (index - 1 + LOG_SYMBOLS.length)
            % LOG_SYMBOLS.length
        ];

    const next =
        LOG_SYMBOLS[
            (index + 1)
            % LOG_SYMBOLS.length
        ];

    return previous + symbol + next;
}


// Wrap every encoded character individually

function wrapLogValue(value) {

    let result = "";

    for (const character of value) {

        if (
            LOG_SYMBOLS.includes(character)
        ) {

            result +=
                wrapLogSymbol(character);

        } else {

            result += character;
        }
    }

    return result;
}
function addActivityLog(
    operation,
    info
){

    const now =
        new Date();

    const time =
        now.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

    if(adminMode){

        const entry =
            `[${time}] ${operation}\n` +
            `    WORDS       ${info.words}\n` +
            `    LETTERS     ${info.letters}\n` +
            `    SHIFT       ${info.shift}\n` +
            `    DIRECTION   ${info.dir}`;

        activityLog.unshift(
            entry
        );

    } else {

        const encodedWords =
            encodeNumber(
                info.words
            );

        const encodedShift =
            encodeNumber(
                info.shift
            );

        const wrappedWords =
            wrapLogValue(
                encodedWords
            );

        const wrappedShift =
            wrapLogValue(
                encodedShift
            );

        const entry =
            `[${time}] ${operation}\n` +
            `    #)%$#    ${wrappedWords}\n` +
            `    #&(%^    ${wrappedShift}\n` +
            `    $(%$$^()&    ${info.dir}`;

        activityLog.unshift(
            entry
        );
    }

    if(
        activityLog.length > 20
    ){

        activityLog.pop();

    }

    renderActivityLog();
}

function renderActivityLog() {

    const log =
        document.getElementById(
            "activity-log-content"
        );


    if (
        activityLog.length === 0
    ) {

        log.textContent =
            "No activity recorded.";

        return;
    }


    log.textContent =
        activityLog.join(
            "\n\n"
        );
}


function toggleActivityLog() {

    const panel =
        document.getElementById(
            "activity-log-panel"
        );


    if (
        panel.style.display === "block"
    ) {

        panel.style.display =
            "none";

    } else {

        panel.style.display =
            "block";

    }
}


function clearActivityLog() {

    activityLog = [];

    renderActivityLog();
}

// Initial Phase 6 system scan.
updateSystemDiagnostics();

window.addEventListener(
    "resize",
    updateSystemDiagnostics
);

window.addEventListener(
    "online",
    updateSystemDiagnostics
);

window.addEventListener(
    "offline",
    updateSystemDiagnostics
);


// ============================================================
// PHASE 7: CIFER INTELLIGENCE 2.0
// ============================================================

function analyzeMessage(text) {
    const words = text.toLowerCase().match(/[a-z]+(?:['-][a-z]+)*/g) || [];
    const wordCounts = {};

    words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    const repeated = Object.entries(wordCounts)
        .filter(([, count]) => count > 1)
        .sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    const letters = [...text.toUpperCase()].filter(c => /[A-Z]/.test(c));
    const letterCounts = {};

    letters.forEach(letter => {
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    });

    const common = Object.entries(letterCounts)
        .sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0,5);

    const unsupported = [...text].filter(
        c => !/[a-zA-Z0-9\s.,!?;:'"()\-]/.test(c)
    );

    const malformed = /#{2,}|[$%^&]{4,}/.test(text);

    const validation = [
        unsupported.length === 0
            ? "✓ Supported characters"
            : "⚠ Unsupported characters: " + [...new Set(unsupported)].join(" "),
        malformed
            ? "⚠ Possible malformed cipher data"
            : "✓ No malformed cipher data"
    ];

    if (!text.trim()) {
        validation.push("⚠ Empty message");
    } else if (!unsupported.length && !malformed) {
        validation.push("✓ Message ready");
    } else {
        validation.push("⚠ Review message before processing");
    }

    return {repeated, common, validation};
}

function updateIntelligenceAnalysis(text) {
    const a = analyzeMessage(text);

    document.getElementById("intel-repeated-tokens").textContent =
        a.repeated.length
            ? a.repeated.map(([w,c]) => `"${w}" × ${c}`).join("\n")
            : "None";

    document.getElementById("intel-common-characters").textContent =
        a.common.length
            ? a.common.map(([l,c]) => `${l} → ${c}`).join("\n")
            : "None";

    const validation = document.getElementById("intel-validation");
    validation.textContent = a.validation.join("\n");
    validation.className =
        a.validation.some(x => x.startsWith("⚠"))
            ? "validation-warning"
            : "";
}


// ============================================================
// PHASE 9: THEME SYSTEM
// ============================================================

const CIFER_THEME_KEY = "cifer-theme";

function changeTheme(theme) {
    const allowed = ["green", "amber", "blue", "crimson", "mono"];

    if (!allowed.includes(theme)) {
        theme = "green";
    }

    document.body.setAttribute("data-theme", theme);

    const select = document.getElementById("theme-select");
    if (select) {
        select.value = theme;
    }

    try {
        localStorage.setItem(CIFER_THEME_KEY, theme);
    } catch (error) {
        console.warn("Cifer could not save the selected theme.", error);
    }
}

function loadSavedTheme() {
    let theme = "green";

    try {
        theme = localStorage.getItem(CIFER_THEME_KEY) || "green";
    } catch (error) {
        theme = "green";
    }

    changeTheme(theme);
}

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("input");

    if (input) {
        input.addEventListener("input", () => {
            updateIntelligenceAnalysis(input.value);
        });

        updateIntelligenceAnalysis(input.value);
    }

    loadSavedTheme();
});
