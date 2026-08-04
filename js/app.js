/*====================================================
 AI Fluency Master
 app.js
 Version 1.0
====================================================*/

document.addEventListener("DOMContentLoaded", () => {

    // ============================
    // Update Footer Year
    // ============================
    const year = document.querySelector(".current-year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    // ============================
    // Smooth Scrolling
    // ============================
    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", function (e) {

            const target = document.querySelector(this.getAttribute("href"));

            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({
                behavior: "smooth"
            });

        });

    });

    // ============================
    // Reveal Animation
    // ============================
    const revealElements = document.querySelectorAll(".reveal");

    function revealOnScroll() {

        const trigger = window.innerHeight * 0.85;

        revealElements.forEach(el => {

            const top = el.getBoundingClientRect().top;

            if (top < trigger) {
                el.classList.add("active");
            }

        });

    }

    window.addEventListener("scroll", revealOnScroll);

    revealOnScroll();

    // ============================
    // Reading Progress Bar
    // ============================
    const progress = document.getElementById("progress-bar");

    function updateProgress() {

        if (!progress) return;

        const scrollTop = window.scrollY;

        const height =
            document.documentElement.scrollHeight -
            window.innerHeight;

        const percent = (scrollTop / height) * 100;

        progress.style.width = percent + "%";

    }

    window.addEventListener("scroll", updateProgress);

    updateProgress();

    // ============================
    // Active Navigation
    // ============================
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll("nav a");

    function highlightNav() {

        let current = "";

        sections.forEach(section => {

            const top = section.offsetTop - 120;

            if (scrollY >= top) {
                current = section.getAttribute("id");
            }

        });

        navLinks.forEach(link => {

            link.classList.remove("active");

            if (link.getAttribute("href") === "#" + current) {
                link.classList.add("active");
            }

        });

    }

    window.addEventListener("scroll", highlightNav);

    highlightNav();

    // ============================
    // Local Progress Storage
    // ============================
    if (!localStorage.getItem("afm-progress")) {

        localStorage.setItem("afm-progress", JSON.stringify({
            completedChapters: [],
            quizzesPassed: [],
            certificateUnlocked: false
        }));

    }

    console.log("AI Fluency Master Loaded Successfully.");

});
