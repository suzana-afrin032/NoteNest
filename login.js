const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");

const errorMessage = document.getElementById("errorMessage");

const togglePassword = document.getElementById("togglePassword");

const googleBtn = document.getElementById("googleBtn");


// =========================
// SHOW / HIDE PASSWORD
// =========================

togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.textContent = "🙈";

    } else {

        passwordInput.type = "password";

        togglePassword.textContent = "👁";

    }

});


// =========================
// LOGIN
// =========================

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    errorMessage.textContent = "";

    const email = emailInput.value.trim();

    const password = passwordInput.value;


    if (!email || !password) {

        errorMessage.textContent =
            "Please enter email and password.";

        return;
    }


    loginBtn.disabled = true;

    loginBtn.textContent = "Logging in...";


    try {

        const response = await fetch(
            "http://localhost:5000/api/auth/login",
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


        const data = await response.json();


        if (!response.ok) {

            errorMessage.textContent =
                data.message ||
                "Invalid email or password.";

            loginBtn.disabled = false;

            loginBtn.textContent = "Login";

            return;
        }


        // SAVE TOKEN

        if (data.token) {

            localStorage.setItem(
                "token",
                data.token
            );
        }


        // SAVE USER

        if (data.user) {

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );
        }


        // SUCCESS

        loginBtn.textContent =
            "Login Successful ✓";


        setTimeout(() => {

            window.location.href =
                "dashboard.html";

        }, 500);


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        errorMessage.textContent =
            "Server error. Please try again.";

        loginBtn.disabled = false;

        loginBtn.textContent = "Login";
    }

});


// =========================
// GOOGLE LOGIN
// =========================

googleBtn.addEventListener("click", () => {

    window.location.href =
        "http://localhost:5000/api/auth/google";

});