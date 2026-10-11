const resetForm = document.getElementById("resetForm");

const passwordInput = document.getElementById("password");
const confirmPasswordInput =
    document.getElementById("confirmPassword");

const resetBtn = document.getElementById("resetBtn");
const message = document.getElementById("message");


// ==========================
// GET TOKEN FROM URL
// ==========================

const urlParams = new URLSearchParams(
    window.location.search
);

const token = urlParams.get("token");


// ==========================
// CHECK TOKEN
// ==========================

if (!token) {

    message.textContent =
        "Invalid or missing reset link.";

    message.style.color = "#dc2626";

    resetBtn.disabled = true;
}


// ==========================
// FORM SUBMIT
// ==========================

resetForm.addEventListener("submit", async (e) => {

    e.preventDefault();


    // Clear old message

    message.textContent = "";
    message.style.color = "";


    const password =
        passwordInput.value.trim();

    const confirmPassword =
        confirmPasswordInput.value.trim();


    // ==========================
    // CHECK TOKEN
    // ==========================

    if (!token) {

        message.textContent =
            "Invalid or missing reset link.";

        message.style.color = "#dc2626";

        return;
    }


    // ==========================
    // CHECK PASSWORD
    // ==========================

    if (password.length < 6) {

        message.textContent =
            "Password must be at least 6 characters.";

        message.style.color = "#dc2626";

        return;
    }


    // ==========================
    // CONFIRM PASSWORD
    // ==========================

    if (password !== confirmPassword) {

        message.textContent =
            "Passwords do not match.";

        message.style.color = "#dc2626";

        return;
    }


    // ==========================
    // LOADING
    // ==========================

    resetBtn.disabled = true;

    resetBtn.textContent =
        "Resetting...";


    try {

        // ==========================
        // SEND REQUEST
        // ==========================

        const response = await fetch(
            "https://notenest-s0gh.onrender.com/api/auth/reset-password",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    token: token,
                    password: password
                })
            }
        );


        const data = await response.json();


        // ==========================
        // ERROR
        // ==========================

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to reset password."
            );
        }


        // ==========================
        // SUCCESS
        // ==========================

        message.textContent =
            "Password reset successfully!";

        message.style.color = "#16a34a";


        // Disable form

        passwordInput.disabled = true;

        confirmPasswordInput.disabled = true;

        resetBtn.disabled = true;

        resetBtn.textContent =
            "Password Reset";


        // ==========================
        // GO TO LOGIN
        // ==========================

        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 2000);


    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        message.textContent =
            error.message ||
            "Something went wrong.";

        message.style.color = "#dc2626";


        resetBtn.disabled = false;

        resetBtn.textContent =
            "Reset Password";
    }

});

