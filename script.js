// Auto change dots
const dots = document.querySelectorAll(".dots span");
let current = 0;

setInterval(() => {
    dots[current].classList.remove("active");
    current = (current + 1) % dots.length;
    dots[current].classList.add("active");
}, 2000);

// Get Started Button
document.querySelector(".start-btn").addEventListener("click", () => {

    document.querySelector(".start-btn").style.transform = "scale(.95)";

    setTimeout(() => {
        window.location.href = "login.html";
    }, 200);

});

// Login Button
document.querySelector(".login-btn").addEventListener("click", () => {

    document.querySelector(".login-btn").style.transform = "scale(.95)";

    setTimeout(() => {
        window.location.href = "login.html";
    }, 200);

});