import { initTabs } from "./tabs.js";

function initViews(user) {
    // Add hashchange event listener only once during initialization
    window.addEventListener("hashchange", function () {
        viewChange(user);
    });

    // Call viewChange function on initialization
    viewChange(user);
}

function viewChange(user) {
    // console.log("Changing view", user);

    // Get the current hashLink
    let hashLink = window.location.hash || "#login-page";
    console.log(`view is: ${hashLink}`)

    if (user) {
        // Check user role and set hashLink accordingly
        if (user.IsAdmin) {
            hashLink = "#admin-page";
            // console.log(`user is: ${user.Username} (Admin: ${user.IsAdmin})`);
            document.querySelector("#logout-btn").classList.remove("hidden");
        } else {
            hashLink = "#substitute-page";
            // console.log(`user is: ${user.Username} (Admin: ${user.IsAdmin})`);
            document.querySelector("#logout-btn").classList.remove("hidden");
            
        }
    }

    // Hide all views
    hideAllViews();

    // Display the active one //hører det her under setActiveLink??
    const activeView = document.querySelector(hashLink);
    if (activeView) {
        activeView.classList.add("active");
    }

    // Update the hash link in case it was modified
    if (window.location.hash !== hashLink) {
        window.location.hash = hashLink;
    }

    if (hashLink === "#shifts-view-section-admin" || hashLink === "#shifts") {
        initTabs();
    }
}

function setActiveLink(view) {
    //sætter link variabel til at være det samme som hashLink/location.hash, altså den URL man er på
    const link = document.querySelector(`a.view-link[href="${view}"]`);

    //sætter link/den side man er på til at være aktiv
    if (link) {
        link.classList.add("active");
    }
}

function hideAllViews() {
    document.querySelectorAll(".view-content").forEach((link) => link.classList.remove("active"));
    //document.querySelectorAll(".view-link").forEach((link) => link.classList.add("active"));
}

function logOutView() {
    console.log("logging out");

    let hashLink = "#login-page";

    hideAllViews();
    document.querySelector(hashLink).classList.add("active");
    document.querySelector("#login-form").reset();
    document.querySelector("#logout-btn").classList.add("hidden");
    document.querySelector("#username-logged-in").textContent = "";
    document.querySelector(".substitute-view").classList.remove("active");
    document.querySelector(".view-content-admin").classList.remove("active");
    setActiveLink(hashLink);
}

export { initViews, viewChange, logOutView };