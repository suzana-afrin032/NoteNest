javascript
// ===========================
// BACK BUTTON
// ===========================

function goBack() {

    window.location.href = "index.html";

}


// ===========================
// CONTINUE BUTTON
// ===========================

function continueToLogin() {

    const button = document.querySelector(".continue-btn");

    button.style.transform = "scale(.95)";

    setTimeout(() => {

        window.location.href = "getstarted.html";

    }, 200);

}

