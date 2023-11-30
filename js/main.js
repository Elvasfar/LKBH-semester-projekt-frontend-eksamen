"use strict";

//Endpoint
const endpoint = "http://localhost:3333";

// ===== IMPORTS ===== \\
import { loginClicked } from "./login.js";
import { initViews, logOutView } from "./view-router.js";
import { getShiftData, getSubstitutesData } from "./rest-service.js";
import { Substituterenderer } from "./substituterenderer.js";
import { ListRenderer } from "./listrenderer.js";
import { initTabs } from "./tabs.js";
import { MyShiftsRenderer } from "./myshiftsrenderer.js";
import { AvailableShiftsRenderer } from "./availableshiftsrenderer.js";

window.addEventListener("load", initApp);

//Definer globale variabler
let substitutes = [];
let shifts = [];
// let employee = [];

async function initApp() {
    console.log("JavaScript is live! 🎉");
    document.querySelector("#logout-btn").classList.add("hidden");
    document.querySelector("#logout-btn").addEventListener("click", logOutView);
    document.querySelector("#login-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        let employee = await loginClicked();
        // console.log(employee);

        // Get the EmployeeID of the logged-in user
        const loggedInEmployeeID = employee.EmployeeID;
        // console.log(loggedInEmployeeID);

        if (employee.IsAdmin) {
            console.log(`logged in as: admin`);
            // Create an instance of Renderers
            const substituteRenderer = new Substituterenderer();

            const specificSubstitute = substitutes.filter((substitute) => substitute.EmployeeID === loggedInEmployeeID);
            console.log(specificSubstitute);
            const substitute = new ListRenderer(specificSubstitute, "#admin-user-info", substituteRenderer);
            substitute.render();
            
            initTabs();
        } else if (!employee.IsAdmin) {
            console.log(`logged in as: substitute`);

            // Create an instance of Renderers
            const substituteRenderer = new Substituterenderer();
            const MyShiftsrenderer = new MyShiftsRenderer();
            const availableShiftsRenderer = new AvailableShiftsRenderer();

            // Convert shift.EmployeeID to string before comparison
            const shiftsOfLoggedInEmployee = shifts.filter((shift) => String(shift.EmployeeID) === String(loggedInEmployeeID));
            // console.log(shiftsOfLoggedInEmployee);
            const myShifts = new ListRenderer(shiftsOfLoggedInEmployee, "#myShifts", MyShiftsrenderer);
            myShifts.render();

            const specificSubstitute = substitutes.filter((substitute) => substitute.EmployeeID === loggedInEmployeeID);
            // console.log(specificSubstitute);
            const substitute = new ListRenderer(specificSubstitute, ".forside-text", substituteRenderer);
            substitute.render();

            const displayAvailableShifts = shifts.filter((shift) => !shift.ShiftIsTaken);
            // console.log(displayAvailableShifts);
            const availableShiftsSubstitutes = new ListRenderer(displayAvailableShifts, "#availableShifts", availableShiftsRenderer);
            availableShiftsSubstitutes.render();
        }
    });
    
    // initTabs();
    initViews();
    substitutes = await getSubstitutesData();
    shifts = await getShiftData();
}

export { endpoint, initApp };
