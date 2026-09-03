// =========================
// AUTH DATA
// =========================

const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");


// =========================
// CHECK LOGIN
// =========================

if (!token || !userData) {
    window.location.href = "login.html";
}


// =========================
// DOM ELEMENTS
// =========================

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");

const nameValue = document.getElementById("nameValue");
const emailValue = document.getElementById("emailValue");

const profileAvatar = document.getElementById("profileAvatar");

const backBtn = document.getElementById("backBtn");
const logoutBtn = document.getElementById("logoutBtn");

const reminderToggle = document.getElementById("reminderToggle");
const reminderTime = document.getElementById("reminderTime");
const reminderStatus = document.getElementById("reminderStatus");
const reminderTimeSection = document.getElementById("reminderTimeSection");

const notification = document.getElementById("notification");
const notificationText = document.getElementById("notificationText");
const notificationClose = document.getElementById("notificationClose");


// =========================
// LOAD USER
// =========================

function loadUser() {

    if (!userData) {
        return;
    }

    try {

        const user = JSON.parse(userData);

        const name = user.name || "User";
        const email = user.email || "Not available";

        profileName.textContent = name;
        profileEmail.textContent = email;

        nameValue.textContent = name;
        emailValue.textContent = email;

        // First letter of name
        profileAvatar.textContent =
            name.charAt(0).toUpperCase();

    } catch (error) {

        console.error("User data error:", error);

        profileName.textContent = "User";
        profileEmail.textContent = "Not available";

        nameValue.textContent = "Not available";
        emailValue.textContent = "Not available";

        profileAvatar.textContent = "U";
    }
}


// =========================
// NOTIFICATION
// =========================

let notificationTimer = null;

function showNotification(message) {

    notificationText.textContent = message;

    notification.classList.add("show");

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(function () {
        notification.classList.remove("show");
    }, 3000);
}


notificationClose.addEventListener("click", function () {

    notification.classList.remove("show");

});


// =========================
// BACK BUTTON
// =========================

backBtn.addEventListener("click", function () {

    window.location.href = "dashboard.html";

});


// =========================
// DAILY REMINDER STORAGE
// =========================

const REMINDER_ENABLED_KEY = "noteNestReminderEnabled";
const REMINDER_TIME_KEY = "noteNestReminderTime";


// =========================
// LOAD REMINDER SETTINGS
// =========================

function loadReminderSettings() {

    const savedEnabled =
        localStorage.getItem(REMINDER_ENABLED_KEY);

    const savedTime =
        localStorage.getItem(REMINDER_TIME_KEY);

    if (savedEnabled === null) {

        reminderToggle.checked = false;

    } else {

        reminderToggle.checked =
            savedEnabled === "true";
    }


    if (savedTime) {

        reminderTime.value = savedTime;

    } else {

        reminderTime.value = "20:00";
    }


    updateReminderUI();
}


// =========================
// UPDATE REMINDER UI
// =========================

function updateReminderUI() {

    if (reminderToggle.checked) {

        reminderStatus.textContent =
            "Daily reminder is enabled.";

        reminderTimeSection.classList.remove("disabled");

        reminderTime.disabled = false;

    } else {

        reminderStatus.textContent =
            "Get reminded to write a note every day.";

        reminderTimeSection.classList.add("disabled");

        reminderTime.disabled = true;
    }
}


// =========================
// REMINDER TOGGLE
// =========================

reminderToggle.addEventListener("change", function () {

    localStorage.setItem(
        REMINDER_ENABLED_KEY,
        reminderToggle.checked
    );

    updateReminderUI();

    if (reminderToggle.checked) {

        showNotification(
            "Daily reminder enabled successfully."
        );

        requestNotificationPermission();

    } else {

        showNotification(
            "Daily reminder disabled."
        );
    }

});


// =========================
// REMINDER TIME CHANGE
// =========================

reminderTime.addEventListener("change", function () {

    localStorage.setItem(
        REMINDER_TIME_KEY,
        reminderTime.value
    );

    if (reminderToggle.checked) {

        showNotification(
            "Reminder time updated successfully."
        );
    }

});


// =========================
// BROWSER NOTIFICATION
// =========================

function requestNotificationPermission() {

    if (!("Notification" in window)) {
        return;
    }

    if (Notification.permission === "default") {

        Notification.requestPermission()
            .then(function (permission) {

                if (permission === "granted") {

                    showNotification(
                        "Browser notifications are enabled."
                    );

                }

            })
            .catch(function () {
                console.log(
                    "Notification permission was not granted."
                );
            });
    }
}


// =========================
// DAILY REMINDER CHECK
// =========================

function checkDailyReminder() {

    const enabled =
        localStorage.getItem(REMINDER_ENABLED_KEY);

    const savedTime =
        localStorage.getItem(REMINDER_TIME_KEY);

    if (enabled !== "true" || !savedTime) {
        return;
    }


    const now = new Date();

    const currentHour =
        String(now.getHours()).padStart(2, "0");

    const currentMinute =
        String(now.getMinutes()).padStart(2, "0");

    const currentTime =
        `${currentHour}:${currentMinute}`;


    const today =
        now.toISOString().split("T")[0];

    const lastReminder =
        localStorage.getItem("noteNestLastReminder");


    if (
        currentTime === savedTime &&
        lastReminder !== today
    ) {

        localStorage.setItem(
            "noteNestLastReminder",
            today
        );


        showNotification(
            "It's time to write a note in NoteNest."
        );


        if (
            "Notification" in window &&
            Notification.permission === "granted"
        ) {

            new Notification("NoteNest Reminder", {
                body: "It's time to write a note today."
            });

        }
    }
}


// =========================
// LOGOUT
// =========================

logoutBtn.addEventListener("click", function () {

    const shouldLogout =
        window.confirm(
            "Are you sure you want to logout?"
        );

    if (!shouldLogout) {
        return;
    }


    localStorage.removeItem("token");
    localStorage.removeItem("user");


    showNotification(
        "Logging out..."
    );


    setTimeout(function () {

        window.location.href = "login.html";

    }, 700);

});


// =========================
// INITIALIZE
// =========================

loadUser();

loadReminderSettings();

checkDailyReminder();


// Check reminder every minute
setInterval(function () {

    checkDailyReminder();

}, 60000);

