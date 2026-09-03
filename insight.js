const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

/* =========================================
   DOM ELEMENTS
========================================= */

const totalNotes = document.getElementById("totalNotes");
const todayNotes = document.getElementById("todayNotes");
const mostUsedCategory = document.getElementById("mostUsedCategory");
const writingStreak = document.getElementById("writingStreak");

const insightText = document.getElementById("insightText");
const activityList = document.getElementById("activityList");
const categoryList = document.getElementById("categoryList");

const backBtn = document.getElementById("backBtn");

let notes = [];


/* =========================================
   PAGE LOAD
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadInsights();
});


/* =========================================
   LOAD NOTES FROM BACKEND
========================================= */

async function loadInsights() {
    try {
        const response = await fetch(`${API_URL}/notes`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401) {
            handleSessionExpired();
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load notes"
            );
        }

        /*
            Backend may return:

            [
                {...},
                {...}
            ]

            OR

            {
                notes: [...]
            }
        */

        if (Array.isArray(data)) {
            notes = data;
        } else if (Array.isArray(data.notes)) {
            notes = data.notes;
        } else {
            notes = [];
        }

        generateInsights();

    } catch (error) {
        console.error("Insight Error:", error);

        showError();
    }
}


/* =========================================
   GENERATE ALL INSIGHTS
========================================= */

function generateInsights() {
    updateOverview();
    updateWeeklyActivity();
    updateCategories();
    updateSmartInsight();
}


/* =========================================
   OVERVIEW
========================================= */

function updateOverview() {

    /* Total Notes */

    if (totalNotes) {
        totalNotes.textContent = notes.length;
    }


    /* Today's Notes */

    const todayCount = getTodayNotesCount();

    if (todayNotes) {
        todayNotes.textContent = todayCount;
    }


    /* Most Used Category */

    const categoryCounts = getCategoryCounts();

    let topCategory = "None";
    let highestCount = 0;

    Object.keys(categoryCounts).forEach(category => {

        if (categoryCounts[category] > highestCount) {
            highestCount = categoryCounts[category];
            topCategory = category;
        }

    });

    if (mostUsedCategory) {
        mostUsedCategory.textContent = topCategory;
    }


    /* Writing Streak */

    const streak = calculateWritingStreak();

    if (writingStreak) {
        writingStreak.textContent = streak;
    }
}


/* =========================================
   TODAY'S NOTES
========================================= */

function getTodayNotesCount() {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return notes.filter(note => {

        const noteDate = getNoteDate(note);

        if (!noteDate) {
            return false;
        }

        noteDate.setHours(0, 0, 0, 0);

        return noteDate.getTime() === today.getTime();

    }).length;
}


/* =========================================
   CATEGORY COUNTS
========================================= */

function getCategoryCounts() {

    const counts = {};

    notes.forEach(note => {

        const category =
            note.category &&
            String(note.category).trim()
                ? String(note.category).trim()
                : "Uncategorized";

        if (!counts[category]) {
            counts[category] = 0;
        }

        counts[category]++;
    });

    return counts;
}


/* =========================================
   CATEGORY BREAKDOWN
========================================= */

function updateCategories() {

    if (!categoryList) {
        return;
    }

    categoryList.innerHTML = "";

    if (notes.length === 0) {

        categoryList.innerHTML = `
            <div class="empty-state">
                No categories yet.
            </div>
        `;

        return;
    }

    const categoryCounts = getCategoryCounts();

    const categories = Object.keys(categoryCounts);

    categories.sort((a, b) => {
        return categoryCounts[b] - categoryCounts[a];
    });


    categories.forEach(category => {

        const row = document.createElement("div");

        row.className = "category-row";

        row.innerHTML = `
            <span class="category-name">
                ${escapeHTML(category)}
            </span>

            <span class="category-count">
                ${categoryCounts[category]}
            </span>
        `;

        categoryList.appendChild(row);

    });
}


/* =========================================
   WEEKLY ACTIVITY
========================================= */

function updateWeeklyActivity() {

    if (!activityList) {
        return;
    }

    activityList.innerHTML = "";

    const days = [];

    /*
        Get last 7 days
    */

    for (let i = 6; i >= 0; i--) {

        const date = new Date();

        date.setHours(0, 0, 0, 0);

        date.setDate(
            date.getDate() - i
        );

        days.push(date);
    }


    /*
        Count notes for each day
    */

    const counts = days.map(day => {

        return notes.filter(note => {

            const noteDate = getNoteDate(note);

            if (!noteDate) {
                return false;
            }

            return (
                noteDate.getFullYear() === day.getFullYear() &&
                noteDate.getMonth() === day.getMonth() &&
                noteDate.getDate() === day.getDate()
            );

        }).length;

    });


    const maximum = Math.max(
        ...counts,
        1
    );


    /*
        Create activity rows
    */

    days.forEach((day, index) => {

        const count = counts[index];

        const row = document.createElement("div");

        row.className = "activity-row";


        const dayName =
            day.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );


        const barWidth =
            count === 0
                ? 0
                : (count / maximum) * 100;


        row.innerHTML = `
            <span class="activity-day">
                ${dayName}
            </span>

            <div class="activity-bar-container">

                <div
                    class="activity-bar"
                    style="width: ${barWidth}%"
                ></div>

            </div>

            <span class="activity-count">
                ${count}
            </span>
        `;


        activityList.appendChild(row);

    });
}


/* =========================================
   SMART INSIGHT
========================================= */

function updateSmartInsight() {

    if (!insightText) {
        return;
    }


    /*
        No notes
    */

    if (notes.length === 0) {

        insightText.innerHTML = `
            <div class="insight-item">
                📝 You haven't created any notes yet.
            </div>

            <div class="insight-item">
                ✨ Create your first note and your personal insights will appear here.
            </div>
        `;

        return;
    }


    /* Category */

    const categoryCounts = getCategoryCounts();

    let topCategory = "Uncategorized";
    let topCategoryCount = 0;

    Object.keys(categoryCounts).forEach(category => {

        if (
            categoryCounts[category] >
            topCategoryCount
        ) {
            topCategory = category;
            topCategoryCount =
                categoryCounts[category];
        }

    });


    /* Today */

    const todayCount =
        getTodayNotesCount();


    /* Streak */

    const streak =
        calculateWritingStreak();


    /*
        Smart messages
    */

    insightText.innerHTML = `

        <div class="insight-item">
            📚 Your most active category is
            <strong>
                ${escapeHTML(topCategory)}
            </strong>
            with
            <strong>
                ${topCategoryCount}
            </strong>
            note${topCategoryCount !== 1 ? "s" : ""}.
        </div>


        <div class="insight-item">
            📝 You created
            <strong>
                ${todayCount}
            </strong>
            note${todayCount !== 1 ? "s" : ""}
            today.
        </div>


        <div class="insight-item">
            🔥 Your current writing streak is
            <strong>
                ${streak}
            </strong>
            day${streak !== 1 ? "s" : ""}.
        </div>

    `;
}


/* =========================================
   WRITING STREAK
========================================= */

function calculateWritingStreak() {

    if (notes.length === 0) {
        return 0;
    }


    const noteDates = new Set();


    notes.forEach(note => {

        const date =
            getNoteDate(note);

        if (!date) {
            return;
        }

        noteDates.add(
            formatDateKey(date)
        );

    });


    let streak = 0;

    const current = new Date();

    current.setHours(0, 0, 0, 0);


    /*
        Count consecutive days
        starting from today
    */

    while (
        noteDates.has(
            formatDateKey(current)
        )
    ) {

        streak++;

        current.setDate(
            current.getDate() - 1
        );

    }


    return streak;
}


/* =========================================
   GET NOTE DATE
========================================= */

function getNoteDate(note) {

    const value =
        note.createdAt ||
        note.created_at ||
        note.date ||
        note.updatedAt;


    if (!value) {
        return null;
    }


    const date = new Date(value);


    if (isNaN(date.getTime())) {
        return null;
    }


    return date;
}


/* =========================================
   FORMAT DATE KEY
========================================= */

function formatDateKey(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


/* =========================================
   BACK BUTTON
========================================= */

if (backBtn) {

    backBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "dashboard.html";

        }
    );

}


/* =========================================
   SESSION EXPIRED
========================================= */

function handleSessionExpired() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href =
        "login.html";
}


/* =========================================
   ERROR MESSAGE
========================================= */

function showError() {

    if (totalNotes) {
        totalNotes.textContent = "-";
    }

    if (todayNotes) {
        todayNotes.textContent = "-";
    }

    if (mostUsedCategory) {
        mostUsedCategory.textContent = "-";
    }

    if (writingStreak) {
        writingStreak.textContent = "-";
    }

    if (insightText) {

        insightText.innerHTML = `
            <div class="insight-item">
                Unable to load your insights right now.
            </div>

            <div class="insight-item">
                Please make sure the NoteNest server is running.
            </div>
        `;

    }

    if (activityList) {

        activityList.innerHTML = `
            <div class="empty-state">
                Activity could not be loaded.
            </div>
        `;

    }

    if (categoryList) {

        categoryList.innerHTML = `
            <div class="empty-state">
                Categories could not be loaded.
            </div>
        `;

    }
}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}