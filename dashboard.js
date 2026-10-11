// =====================================================
// NOTE NEST - DASHBOARD JS
// =====================================================


// =====================================================
// AUTHENTICATION
// =====================================================

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
    throw new Error("Authentication token not found.");
}


// =====================================================
// USER INFO
// =====================================================

let user = null;

try {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
        user = JSON.parse(savedUser);
    }
} catch (error) {
    console.error("User data error:", error);
}

const userNameElement = document.getElementById("userName");

if (userNameElement) {
    userNameElement.textContent =
        user?.name ||
        user?.username ||
        "User";
}


// =====================================================
// BACKEND API
// =====================================================

const API_URL = "https://notenest-s0gh.onrender.com";


// =====================================================
// ELEMENTS
// =====================================================

const notesContainer = document.getElementById("notesContainer");
const emptyMessage = document.getElementById("emptyMessage");
const searchInput = document.getElementById("searchInput");

const addNoteBtn = document.getElementById("addNoteBtn");

const profileNav = document.getElementById("profileNav");
const homeNav = document.getElementById("homeNav");
const notesNav = document.getElementById("notesNav");

const seeAllBtn = document.getElementById("seeAllBtn");

const categoryList = document.getElementById("categoryList");
const addCategoryBtn = document.getElementById("addCategoryBtn");


// =====================================================
// CATEGORY MODAL
// =====================================================

const categoryModal = document.getElementById("categoryModal");
const closeCategoryModal =
    document.getElementById("closeCategoryModal");
const cancelCategoryBtn =
    document.getElementById("cancelCategoryBtn");
const saveCategoryBtn =
    document.getElementById("saveCategoryBtn");
const categoryNameInput =
    document.getElementById("categoryNameInput");


// =====================================================
// NOTES
// =====================================================

let allNotes = [];


// =====================================================
// DEFAULT CATEGORIES
// =====================================================

const defaultCategories = [
    {
        name: "Study",
        icon: "📚"
    },
    {
        name: "Ideas",
        icon: "💡"
    },
    {
        name: "Personal",
        icon: "❤️"
    }
];


// =====================================================
// LOAD SAVED CATEGORIES
// =====================================================

let savedCategories = [];

try {
    const storedCategories =
        localStorage.getItem("noteNestCategories");

    savedCategories = storedCategories
        ? JSON.parse(storedCategories)
        : [];
} catch (error) {
    console.error("Category data error:", error);
    savedCategories = [];
}


// Make sure categories are valid

savedCategories = savedCategories.filter(function (category) {
    return (
        category &&
        typeof category.name === "string" &&
        category.name.trim() !== ""
    );
});


// Add missing default categories

defaultCategories.forEach(function (defaultCategory) {

    const exists = savedCategories.some(function (category) {

        return (
            category.name.toLowerCase() ===
            defaultCategory.name.toLowerCase()
        );

    });

    if (!exists) {
        savedCategories.push({
            name: defaultCategory.name,
            icon: defaultCategory.icon
        });
    }

});


// Save categories

localStorage.setItem(
    "noteNestCategories",
    JSON.stringify(savedCategories)
);


// =====================================================
// SESSION EXPIRED
// =====================================================

function handleSessionExpired() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.setItem(
        "authError",
        "Session expired. Please login again."
    );

    window.location.href = "login.html";
}


// =====================================================
// CUSTOM POPUP STYLES
// =====================================================

function addPopupStyles() {

    if (document.getElementById("noteNestPopupStyles")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "noteNestPopupStyles";

    style.textContent = `
        .nn-popup-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            z-index: 999999;
        }

        .nn-popup-box {
            width: min(420px, 100%);
            background: #ffffff;
            border: 1px solid #dbeafe;
            border-radius: 24px;
            padding: 30px 26px 25px;
            text-align: center;
            position: relative;
            box-shadow:
                0 20px 60px rgba(37, 99, 235, 0.15);
            animation: nnPopupShow 0.22s ease;
        }

        @keyframes nnPopupShow {
            from {
                opacity: 0;
                transform: translateY(15px) scale(0.96);
            }

            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .nn-popup-close {
            position: absolute;
            top: 12px;
            right: 15px;
            width: 32px;
            height: 32px;
            border: none;
            background: #eff6ff;
            color: #2563eb;
            border-radius: 50%;
            font-size: 22px;
            line-height: 1;
            cursor: pointer;
            transition: 0.2s;
        }

        .nn-popup-close:hover {
            background: #dbeafe;
            transform: rotate(90deg);
        }

        .nn-popup-icon {
            width: 58px;
            height: 58px;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: #eff6ff;
            color: #2563eb;
            font-size: 25px;
        }

        .nn-popup-box h3 {
            margin: 0 0 8px;
            color: #1e293b;
            font-size: 20px;
            font-weight: 700;
        }

        .nn-popup-box p {
            margin: 0 auto 20px;
            max-width: 330px;
            color: #64748b;
            font-size: 14px;
            line-height: 1.6;
        }

        .nn-popup-input-wrapper {
            margin-bottom: 20px;
        }

        .nn-popup-input-wrapper input {
            width: 100%;
            box-sizing: border-box;
            padding: 13px 15px;
            border: 1px solid #bfdbfe;
            border-radius: 12px;
            outline: none;
            background: #f8fbff;
            color: #1e293b;
            font-size: 14px;
            transition: 0.2s;
        }

        .nn-popup-input-wrapper input:focus {
            border-color: #2563eb;
            background: #ffffff;
            box-shadow:
                0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .nn-popup-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
        }

        .nn-popup-buttons button {
            flex: 1;
            min-height: 44px;
            border-radius: 12px;
            border: none;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
        }

        .nn-popup-cancel {
            background: #f1f5f9;
            color: #475569;
        }

        .nn-popup-cancel:hover {
            background: #e2e8f0;
        }

        .nn-popup-confirm {
            background: #2563eb;
            color: #ffffff;
            box-shadow:
                0 6px 16px rgba(37, 99, 235, 0.20);
        }

        .nn-popup-confirm:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
        }

        @media (max-width: 480px) {

            .nn-popup-box {
                padding: 27px 20px 22px;
                border-radius: 20px;
            }

            .nn-popup-box h3 {
                font-size: 18px;
            }

            .nn-popup-buttons button {
                min-height: 42px;
            }
        }
    `;

    document.head.appendChild(style);
}


// =====================================================
// CREATE POPUP
// =====================================================

function createCustomPopup() {

    const oldPopup =
        document.getElementById("noteNestCustomPopup");

    if (oldPopup) {
        oldPopup.remove();
    }

    addPopupStyles();

    const popup = document.createElement("div");

    popup.id = "noteNestCustomPopup";

    popup.innerHTML = `
        <div class="nn-popup-overlay">

            <div class="nn-popup-box">

                <button
                    type="button"
                    class="nn-popup-close"
                    id="nnPopupClose"
                >
                    &times;
                </button>

                <div class="nn-popup-icon">
                    <i class="fa-regular fa-note-sticky"></i>
                </div>

                <h3 id="nnPopupTitle">
                    Are you sure?
                </h3>

                <p id="nnPopupMessage">
                    Please confirm your action.
                </p>

                <div
                    class="nn-popup-input-wrapper"
                    id="nnPopupInputWrapper"
                >
                    <input
                        type="text"
                        id="nnPopupInput"
                        autocomplete="off"
                    >
                </div>

                <div class="nn-popup-buttons">

                    <button
                        type="button"
                        class="nn-popup-cancel"
                        id="nnPopupCancel"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        class="nn-popup-confirm"
                        id="nnPopupConfirm"
                    >
                        Confirm
                    </button>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(popup);

    return popup;
}


// =====================================================
// CONFIRM POPUP
// =====================================================

function showConfirmPopup(
    message,
    title = "Are you sure?"
) {

    return new Promise(function (resolve) {

        const popup = createCustomPopup();

        const titleElement =
            popup.querySelector("#nnPopupTitle");

        const messageElement =
            popup.querySelector("#nnPopupMessage");

        const inputWrapper =
            popup.querySelector("#nnPopupInputWrapper");

        const confirmButton =
            popup.querySelector("#nnPopupConfirm");

        const cancelButton =
            popup.querySelector("#nnPopupCancel");

        const closeButton =
            popup.querySelector("#nnPopupClose");

        titleElement.textContent = title;
        messageElement.textContent = message;

        inputWrapper.style.display = "none";

        confirmButton.textContent = "Delete";

        function closePopup(result) {

            if (popup.parentElement) {
                popup.remove();
            }

            resolve(result);
        }

        confirmButton.addEventListener(
            "click",
            function () {
                closePopup(true);
            }
        );

        cancelButton.addEventListener(
            "click",
            function () {
                closePopup(false);
            }
        );

        closeButton.addEventListener(
            "click",
            function () {
                closePopup(false);
            }
        );

        const overlay =
            popup.querySelector(".nn-popup-overlay");

        overlay.addEventListener(
            "click",
            function (event) {

                if (event.target === overlay) {
                    closePopup(false);
                }

            }
        );

    });
}


// =====================================================
// INPUT POPUP
// =====================================================

function showInputPopup(
    message,
    defaultValue = "",
    title = "Edit Category"
) {

    return new Promise(function (resolve) {

        const popup = createCustomPopup();

        const titleElement =
            popup.querySelector("#nnPopupTitle");

        const messageElement =
            popup.querySelector("#nnPopupMessage");

        const inputWrapper =
            popup.querySelector("#nnPopupInputWrapper");

        const input =
            popup.querySelector("#nnPopupInput");

        const confirmButton =
            popup.querySelector("#nnPopupConfirm");

        const cancelButton =
            popup.querySelector("#nnPopupCancel");

        const closeButton =
            popup.querySelector("#nnPopupClose");

        titleElement.textContent = title;
        messageElement.textContent = message;

        inputWrapper.style.display = "block";

        input.value = defaultValue;
        input.placeholder = "Enter category name";

        confirmButton.textContent = "Save";

        function closePopup(result) {

            if (popup.parentElement) {
                popup.remove();
            }

            resolve(result);
        }

        confirmButton.addEventListener(
            "click",
            function () {

                const value = input.value.trim();

                if (!value) {
                    input.focus();
                    return;
                }

                closePopup(value);
            }
        );

        cancelButton.addEventListener(
            "click",
            function () {
                closePopup(null);
            }
        );

        closeButton.addEventListener(
            "click",
            function () {
                closePopup(null);
            }
        );

        input.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    confirmButton.click();
                }

                if (event.key === "Escape") {

                    event.preventDefault();

                    closePopup(null);
                }

            }
        );

        setTimeout(function () {

            input.focus();
            input.select();

        }, 100);

    });
}


// =====================================================
// NOTIFICATION
// =====================================================

function showNotification(
    message,
    type = "success"
) {

    const oldNotification =
        document.querySelector(".custom-notification");

    if (oldNotification) {
        oldNotification.remove();
    }

    const notification =
        document.createElement("div");

    notification.className =
        `custom-notification ${type}`;

    const icon =
        type === "success"
            ? "✓"
            : "✕";

    notification.innerHTML = `
        <div class="notification-icon">
            ${icon}
        </div>

        <div class="notification-message">
            ${message}
        </div>

        <button
            type="button"
            class="notification-close"
        >
            &times;
        </button>
    `;

    document.body.appendChild(notification);

    setTimeout(function () {

        notification.classList.add("show");

    }, 10);

    const closeButton =
        notification.querySelector(
            ".notification-close"
        );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                notification.classList.remove("show");

                setTimeout(function () {

                    if (notification.parentElement) {
                        notification.remove();
                    }

                }, 300);

            }
        );

    }

    setTimeout(function () {

        if (!notification.parentElement) {
            return;
        }

        notification.classList.remove("show");

        setTimeout(function () {

            if (notification.parentElement) {
                notification.remove();
            }

        }, 300);

    }, 3000);
}


// =====================================================
// LOAD NOTES
// =====================================================

async function loadNotes() {

    try {

        const response = await fetch(
            `${API_URL}/api/notes`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.status === 401) {
            handleSessionExpired();
            return;
        }

        if (!response.ok) {
            throw new Error(
                "Failed to load notes."
            );
        }

        const data = await response.json();

        if (Array.isArray(data)) {
            allNotes = data;
        } else {
            allNotes = Array.isArray(data.notes)
                ? data.notes
                : [];
        }

        displayNotes(allNotes);

    } catch (error) {

        console.error(
            "Error loading notes:",
            error
        );

        if (notesContainer) {
            notesContainer.innerHTML = "";
        }

        if (emptyMessage) {
            emptyMessage.style.display = "block";
        }

        showNotification(
            "Unable to load notes.",
            "error"
        );
    }
}


// =====================================================
// DISPLAY NOTES
// =====================================================

function displayNotes(notes) {

    if (!notesContainer) {
        return;
    }

    notesContainer.innerHTML = "";

    if (!Array.isArray(notes) || notes.length === 0) {

        if (emptyMessage) {
            emptyMessage.style.display = "block";
        }

        return;
    }

    if (emptyMessage) {
        emptyMessage.style.display = "none";
    }

    notes.forEach(function (note) {

        const card = document.createElement("div");

        card.className = "note-card";
        card.style.position = "relative";
        card.style.zIndex = "1";

        const noteId =
            note._id ||
            note.id;

        card.dataset.id =
            noteId || "";

        card.dataset.category =
            note.category || "Study";


        // =================================================
        // ICON
        // =================================================

        const icon = document.createElement("div");

        icon.className = "note-icon";

        icon.innerHTML =
            '<i class="fa-regular fa-note-sticky"></i>';


        // =================================================
        // INFO
        // =================================================

        const info = document.createElement("div");

        info.className = "note-info";


        // =================================================
        // TITLE
        // =================================================

        const title = document.createElement("h3");

        title.textContent =
            note.title || "Untitled Note";


        // =================================================
        // DESCRIPTION
        // =================================================

        const description =
            document.createElement("p");

        description.textContent =
            note.content ||
            note.description ||
            "No content";


        info.appendChild(title);
        info.appendChild(description);


        // =================================================
        // MORE BUTTON
        // =================================================

        const moreButton =
            document.createElement("button");

        moreButton.type = "button";
        moreButton.className = "more-btn";

        moreButton.innerHTML =
            '<i class="fa-solid fa-ellipsis-vertical"></i>';


        // =================================================
        // NOTE MENU
        // =================================================

        const menu =
            document.createElement("div");

        menu.className = "note-menu";


        // =================================================
        // EDIT BUTTON
        // =================================================

        const editButton =
            document.createElement("button");

        editButton.type = "button";
        editButton.className = "edit-note-btn";
        editButton.textContent = "✏️ Edit";


        // =================================================
        // DELETE BUTTON
        // =================================================

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "delete-note-btn";
        deleteButton.textContent = "🗑️ Delete";


        // =================================================
        // BUILD MENU
        // =================================================

        menu.appendChild(editButton);
        menu.appendChild(deleteButton);


        // =================================================
        // BUILD CARD
        // =================================================

        card.appendChild(icon);
        card.appendChild(info);
        card.appendChild(moreButton);
        card.appendChild(menu);

        notesContainer.appendChild(card);


        // =================================================
        // OPEN NOTE
        // =================================================

        card.addEventListener(
            "click",
            function () {

                if (!noteId) {

                    showNotification(
                        "Note ID not found.",
                        "error"
                    );

                    return;
                }

                window.location.href =
                    `view-note.html?id=${encodeURIComponent(noteId)}`;

            }
        );


        // =================================================
        // MORE MENU
        // =================================================

        moreButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                const isOpen =
                    menu.style.display === "block";

                document
                    .querySelectorAll(".note-menu")
                    .forEach(function (otherMenu) {

                        otherMenu.style.display = "none";

                    });

                document
                    .querySelectorAll(".note-card")
                    .forEach(function (otherCard) {

                        otherCard.style.zIndex = "1";

                    });

                if (!isOpen) {

                    menu.style.display = "block";
                    card.style.zIndex = "1000";

                }

            }
        );


        // =================================================
        // EDIT NOTE
        // =================================================

        editButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                if (!noteId) {

                    showNotification(
                        "Note ID not found.",
                        "error"
                    );

                    return;
                }

                menu.style.display = "none";
                card.style.zIndex = "1";

                window.location.href =
                    `create-note.html?id=${encodeURIComponent(noteId)}&edit=true`;

            }
        );


        // =================================================
        // DELETE NOTE
        // =================================================

        deleteButton.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();
                event.stopPropagation();

                if (!noteId) {

                    showNotification(
                        "Note ID not found.",
                        "error"
                    );

                    return;
                }

                const confirmed =
                    await showConfirmPopup(
                        "Are you sure you want to delete this note?",
                        "Delete Note?"
                    );

                if (!confirmed) {
                    return;
                }

                try {

                    deleteButton.disabled = true;
                    deleteButton.textContent = "Deleting...";

                    const response = await fetch(
                        `${API_URL}/api/notes/${encodeURIComponent(noteId)}`,
                        {
                            method: "DELETE",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        }
                    );

                    if (response.status === 401) {
                        handleSessionExpired();
                        return;
                    }

                    if (!response.ok) {

                        let errorMessage =
                            "Failed to delete note.";

                        try {

                            const errorData =
                                await response.json();

                            if (errorData.message) {
                                errorMessage =
                                    errorData.message;
                            }

                        } catch (error) {
                            // Ignore JSON parsing error
                        }

                        throw new Error(errorMessage);
                    }

                    allNotes = allNotes.filter(
                        function (item) {

                            const itemId =
                                item._id ||
                                item.id;

                            return (
                                String(itemId) !==
                                String(noteId)
                            );

                        }
                    );

                    displayNotes(allNotes);

                    showNotification(
                        "Note deleted successfully! 🗑️"
                    );

                } catch (error) {

                    console.error(
                        "Delete error:",
                        error
                    );

                    showNotification(
                        error.message ||
                        "Failed to delete note.",
                        "error"
                    );

                    deleteButton.disabled = false;
                    deleteButton.textContent = "🗑️ Delete";
                }

            }
        );

    });
}


// =====================================================
// SEARCH
// =====================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const searchText =
                searchInput.value
                    .toLowerCase()
                    .trim();

            const filteredNotes =
                allNotes.filter(
                    function (note) {

                        const title =
                            String(
                                note.title || ""
                            ).toLowerCase();

                        const content =
                            String(
                                note.content ||
                                note.description ||
                                ""
                            ).toLowerCase();

                        const category =
                            String(
                                note.category || ""
                            ).toLowerCase();

                        return (
                            title.includes(searchText) ||
                            content.includes(searchText) ||
                            category.includes(searchText)
                        );

                    }
                );

            displayNotes(filteredNotes);

        }
    );

}


// =====================================================
// CATEGORY MENU POSITION
// =====================================================

function positionCategoryMenu(
    menu,
    moreButton
) {

    menu.classList.add("show");

    const buttonRect =
        moreButton.getBoundingClientRect();

    const menuHeight =
        menu.offsetHeight;

    const menuWidth =
        menu.offsetWidth;

    let top =
        buttonRect.bottom + 5;

    let left =
        buttonRect.left;

    if (
        left + menuWidth >
        window.innerWidth - 10
    ) {

        left =
            window.innerWidth -
            menuWidth -
            10;
    }

    if (left < 10) {
        left = 10;
    }

    if (
        top + menuHeight >
        window.innerHeight - 10
    ) {

        top =
            buttonRect.top -
            menuHeight -
            5;
    }

    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
}


// =====================================================
// DISPLAY CATEGORIES
// =====================================================

function displayCategories() {

    if (!categoryList) {
        return;
    }

    document
        .querySelectorAll(".category-menu")
        .forEach(function (menu) {
            menu.remove();
        });

    categoryList.innerHTML = "";


    // =================================================
    // ALL CATEGORY
    // =================================================

    const allButton =
        document.createElement("button");

    allButton.type = "button";
    allButton.className = "category active";
    allButton.dataset.category = "All";
    allButton.textContent = "All";

    categoryList.appendChild(allButton);


    // =================================================
    // USER CATEGORIES
    // =================================================

    savedCategories.forEach(
        function (category) {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "category-wrapper";


            // CATEGORY BUTTON

            const button =
                document.createElement("button");

            button.type = "button";
            button.className = "category";
            button.dataset.category = category.name;

            button.textContent =
                `${category.icon || "📁"} ${category.name}`;


            // MORE BUTTON

            const moreButton =
                document.createElement("button");

            moreButton.type = "button";
            moreButton.className =
                "category-more-btn";

            moreButton.textContent = "⋮";


            // MENU

            const menu =
                document.createElement("div");

            menu.className =
                "category-menu";


            // EDIT

            const editButton =
                document.createElement("button");

            editButton.type = "button";
            editButton.textContent = "✏️ Edit";


            // DELETE

            const deleteButton =
                document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className =
                "delete-category-btn";

            deleteButton.textContent =
                "🗑️ Delete";


            menu.appendChild(editButton);
            menu.appendChild(deleteButton);

            wrapper.appendChild(button);
            wrapper.appendChild(moreButton);

            document.body.appendChild(menu);
            categoryList.appendChild(wrapper);


            // =================================================
            // SELECT CATEGORY
            // =================================================

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    document
                        .querySelectorAll(".category")
                        .forEach(function (item) {

                            item.classList.remove("active");

                        });

                    button.classList.add("active");

                    const selectedCategory =
                        category.name.toLowerCase();

                    const filteredNotes =
                        allNotes.filter(
                            function (note) {

                                return (
                                    String(
                                        note.category || ""
                                    ).toLowerCase() ===
                                    selectedCategory
                                );

                            }
                        );

                    displayNotes(filteredNotes);

                }
            );


            // =================================================
            // CATEGORY MORE
            // =================================================

            moreButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    document
                        .querySelectorAll(".category-menu")
                        .forEach(function (otherMenu) {

                            if (otherMenu !== menu) {
                                otherMenu.classList.remove("show");
                            }

                        });

                    if (menu.classList.contains("show")) {

                        menu.classList.remove("show");

                    } else {

                        positionCategoryMenu(
                            menu,
                            moreButton
                        );

                    }

                }
            );


            // =================================================
            // EDIT CATEGORY
            // =================================================

            editButton.addEventListener(
                "click",
                async function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    menu.classList.remove("show");

                    const newName =
                        await showInputPopup(
                            "Enter a new name for this category.",
                            category.name,
                            "Edit Category"
                        );

                    if (newName === null) {
                        return;
                    }

                    const cleanName =
                        newName.trim();

                    if (!cleanName) {
                        return;
                    }

                    const duplicate =
                        savedCategories.some(
                            function (item) {

                                return (
                                    item !== category &&
                                    item.name.toLowerCase() ===
                                    cleanName.toLowerCase()
                                );

                            }
                        );

                    if (duplicate) {

                        showNotification(
                            "This category already exists.",
                            "error"
                        );

                        return;
                    }

                    const oldName =
                        category.name;

                    category.name =
                        cleanName;


                    // Update note categories locally

                    allNotes.forEach(
                        function (note) {

                            const noteCategory =
                                String(
                                    note.category || ""
                                ).toLowerCase();

                            if (
                                noteCategory ===
                                oldName.toLowerCase()
                            ) {

                                note.category =
                                    cleanName;
                            }

                        }
                    );


                    localStorage.setItem(
                        "noteNestCategories",
                        JSON.stringify(savedCategories)
                    );

                    displayCategories();
                    displayNotes(allNotes);

                    showNotification(
                        "Category updated successfully! ✅"
                    );

                }
            );


            // =================================================
            // DELETE CATEGORY
            // =================================================

            deleteButton.addEventListener(
                "click",
                async function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    menu.classList.remove("show");

                    const confirmed =
                        await showConfirmPopup(
                            `Delete "${category.name}" category?`,
                            "Delete Category?"
                        );

                    if (!confirmed) {
                        return;
                    }

                    savedCategories =
                        savedCategories.filter(
                            function (item) {

                                return item !== category;

                            }
                        );

                    localStorage.setItem(
                        "noteNestCategories",
                        JSON.stringify(savedCategories)
                    );

                    displayCategories();
                    displayNotes(allNotes);

                    showNotification(
                        "Category deleted successfully! 🗑️"
                    );

                }
            );

        }
    );


    // =================================================
    // ALL CATEGORY CLICK
    // =================================================

    allButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            document
                .querySelectorAll(".category")
                .forEach(function (item) {

                    item.classList.remove("active");

                });

            allButton.classList.add("active");

            displayNotes(allNotes);

        }
    );

}


// =====================================================
// OPEN CATEGORY MODAL
// =====================================================

function openCategoryModal() {

    if (!categoryModal) {
        return;
    }

    if (categoryNameInput) {
        categoryNameInput.value = "";
    }

    categoryModal.classList.add("show");

    setTimeout(function () {

        if (categoryNameInput) {
            categoryNameInput.focus();
        }

    }, 100);
}


// =====================================================
// CLOSE CATEGORY MODAL
// =====================================================

function closeCategoryModalFunc() {

    if (!categoryModal) {
        return;
    }

    categoryModal.classList.remove("show");

    if (categoryNameInput) {
        categoryNameInput.value = "";
    }
}


// =====================================================
// ADD CATEGORY
// =====================================================

if (addCategoryBtn) {

    addCategoryBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            openCategoryModal();

        }
    );

}


// =====================================================
// CLOSE CATEGORY MODAL
// =====================================================

if (closeCategoryModal) {

    closeCategoryModal.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            closeCategoryModalFunc();

        }
    );

}


// =====================================================
// CANCEL CATEGORY
// =====================================================

if (cancelCategoryBtn) {

    cancelCategoryBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            closeCategoryModalFunc();

        }
    );

}


// =====================================================
// SAVE CATEGORY
// =====================================================

if (saveCategoryBtn) {

    saveCategoryBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            if (!categoryNameInput) {
                return;
            }

            const categoryName =
                categoryNameInput.value.trim();

            if (!categoryName) {

                showNotification(
                    "Please enter a category name.",
                    "error"
                );

                categoryNameInput.focus();

                return;
            }

            const alreadyExists =
                savedCategories.some(
                    function (category) {

                        return (
                            category.name.toLowerCase() ===
                            categoryName.toLowerCase()
                        );

                    }
                );

            if (alreadyExists) {

                showNotification(
                    "This category already exists.",
                    "error"
                );

                categoryNameInput.focus();

                return;
            }

            const newCategory = {
                name: categoryName,
                icon: "📁"
            };

            savedCategories.push(newCategory);

            localStorage.setItem(
                "noteNestCategories",
                JSON.stringify(savedCategories)
            );

            displayCategories();

            closeCategoryModalFunc();

            showNotification(
                `"${categoryName}" category added successfully! ✅`
            );

        }
    );

}


// =====================================================
// CLOSE MODAL ON OUTSIDE CLICK
// =====================================================

if (categoryModal) {

    categoryModal.addEventListener(
        "click",
        function (event) {

            if (event.target === categoryModal) {
                closeCategoryModalFunc();
            }

        }
    );

}


// =====================================================
// ENTER KEY - CATEGORY
// =====================================================

if (categoryNameInput) {

    categoryNameInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                if (saveCategoryBtn) {
                    saveCategoryBtn.click();
                }

            }

        }
    );

}


// =====================================================
// CLOSE ALL MENUS
// =====================================================

document.addEventListener(
    "click",
    function () {

        document
            .querySelectorAll(".category-menu")
            .forEach(function (menu) {

                menu.classList.remove("show");

            });

        document
            .querySelectorAll(".note-menu")
            .forEach(function (menu) {

                menu.style.display = "none";

            });

        document
            .querySelectorAll(".note-card")
            .forEach(function (card) {

                card.style.zIndex = "1";

            });

    }
);


// =====================================================
// ADD NOTE
// =====================================================

if (addNoteBtn) {

    addNoteBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            window.location.href =
                "create-note.html";

        }
    );

}


// =====================================================
// PROFILE NAVIGATION
// =====================================================

if (profileNav) {

    profileNav.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.location.href =
                "profile.html";

        }
    );

}


// =====================================================
// HOME NAVIGATION
// =====================================================

if (homeNav) {

    homeNav.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.location.href =
                "dashboard.html";

        }
    );

}


// =====================================================
// NOTES NAVIGATION
// =====================================================

if (notesNav) {

    notesNav.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.location.href =
                "notes.html";

        }
    );

}


// =====================================================
// SEE ALL
// =====================================================

if (seeAllBtn) {

    seeAllBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.location.href =
                "notes.html";

        }
    );

}


// =====================================================
// INITIALIZE
// =====================================================

displayCategories();
loadNotes();