// =========================
// ELEMENTS
// =========================

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const errorMessage = document.getElementById("errorMessage");
const togglePassword = document.getElementById("togglePassword");
const googleBtn = document.getElementById("googleBtn");


// =========================
// BACKEND API URL
// =========================

const API_URL = "https://notenest-s0gh.onrender.com";


// =========================
// SHOW AUTH ERROR
// =========================

const savedAuthError = sessionStorage.getItem("authError");

if (savedAuthError && errorMessage) {
    errorMessage.textContent = savedAuthError;
    sessionStorage.removeItem("authError");
}


// =========================
// SHOW / HIDE PASSWORD
// =========================

if (togglePassword) {
    togglePassword.addEventListener("click", () => {

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.textContent = "🙈";
        } else {
            passwordInput.type = "password";
            togglePassword.textContent = "👁";
        }

    });
}


// =========================
// LOGIN
// =========================

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    errorMessage.textContent = "";
    errorMessage.style.color = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // =========================
    // VALIDATION
    // =========================

    if (!email || !password) {
        errorMessage.textContent =
            "Please enter email and password.";
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";


    // =========================
    // SLOW SERVER MESSAGE
    // =========================

    const slowTimer = setTimeout(() => {

        errorMessage.style.color = "#888";

        errorMessage.textContent =
            "Server-er response ashte ektu deri hocche. Ektu opekkha korun...";

    }, 4000);


    try {

        // =========================
        // LOGIN REQUEST
        // =========================

        const response = await fetch(
            `${API_URL}/api/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );


        clearTimeout(slowTimer);

        errorMessage.style.color = "";


        // =========================
        // RESPONSE
        // =========================

        const data = await response.json();


        // =========================
        // LOGIN FAILED
        // =========================

        if (!response.ok) {

            errorMessage.textContent =
                data.message ||
                "Invalid email or password.";

            loginBtn.disabled = false;
            loginBtn.textContent = "Login";

            return;
        }


        // =========================
        // CHECK TOKEN
        // =========================

        if (!data.token) {

            errorMessage.textContent =
                "Login failed. Token was not received.";

            loginBtn.disabled = false;
            loginBtn.textContent = "Login";

            return;
        }


        // =========================
        // CLEAR OLD SESSION
        // =========================

        localStorage.removeItem("token");
        localStorage.removeItem("user");


        // =========================
        // SAVE NEW TOKEN
        // =========================

        localStorage.setItem(
            "token",
            data.token
        );


        // =========================
        // SAVE USER
        // =========================

        if (data.user) {

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );
        }


        // =========================
        // LOGIN SUCCESS
        // =========================

        loginBtn.textContent =
            "Login Successful ✓";


        // =========================
        // GO TO DASHBOARD
        // =========================

        setTimeout(() => {

            window.location.href = "dashboard.html";

        }, 500);


    } catch (error) {

        clearTimeout(slowTimer);

        console.error("Login error:", error);

        errorMessage.style.color = "";

        errorMessage.textContent =
            "Server-er sathe connect hocche na. Backend (npm start) chalu ache kina dekhun.";

        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }

});


// =========================
// GOOGLE LOGIN
// =========================

if (googleBtn) {

    googleBtn.addEventListener("click", () => {

        window.location.href =
            `${API_URL}/api/auth/google`;

    });

}

