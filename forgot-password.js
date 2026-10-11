const forgotForm = document.getElementById("forgotForm");
const emailInput = document.getElementById("email");
const resetBtn = document.getElementById("resetBtn");
const message = document.getElementById("message");


// ==========================
// FORM SUBMIT
// ==========================

forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    // Clear old message
    message.textContent = "";
    message.style.color = "";

    // Check email
    if (!email) {
        message.textContent = "Please enter your email address.";
        message.style.color = "#dc2626";
        return;
    }

    // Button loading state
    resetBtn.disabled = true;
    resetBtn.textContent = "Sending...";


    try {

        // ==========================
        // SEND REQUEST TO BACKEND
        // ==========================

        const response = await fetch(
            "https://notenest-s0gh.onrender.com/api/auth/forgot-password",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email
                })
            }
        );


        const data = await response.json();


        // ==========================
        // ERROR
        // ==========================

        if (!response.ok) {
            throw new Error(
                data.message || "Something went wrong."
            );
        }


        // ==========================
        // SUCCESS
        // ==========================

        message.textContent =
            "Reset link generated successfully!";

        message.style.color = "#16a34a";


        // ==========================
        // DEVELOPMENT ONLY
        // ==========================

        if (data.resetUrl) {

            console.log(
                "Password Reset URL:",
                data.resetUrl
            );

            // Temporary:
            // Show the reset link so you can test it.
            message.innerHTML =
                `Reset link generated!<br>
                <a href="${data.resetUrl}"
                   style="color:#2563eb; font-weight:600;"
                   target="_self">
                   Click here to reset your password
                </a>`;
        }


        // Clear email
        emailInput.value = "";


    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );

        message.textContent =
            error.message ||
            "Failed to send reset link.";

        message.style.color = "#dc2626";


    } finally {

        resetBtn.disabled = false;
        resetBtn.textContent = "Send Reset Link";
    }
});

