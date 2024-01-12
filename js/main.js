"use strict";

//Endpoint
const endpoint = "https://localhost:3333";

// ===== IMPORTS ===== \\
import { login } from "./controller/login.js";
import { initViews, logOutView } from "./controller/view-router.js";
import { MyInfoRenderer } from "./view/myinfo-renderer.js";
import { ListRenderer } from "./controller/listrenderer.js";
import { MyShiftsRenderer } from "./view/myshiftsrenderer.js";
import { AvailableShiftsRenderer } from "./view/availableshiftsrenderer.js";
import { AdminShiftRenderer } from "./view/adminshiftrenderer.js";
import { AdminViewAvaliableShiftRenderer } from "./view/admin-view-avaliable-shift-renderer.js";
import { AdminViewSubstitutesRenderer } from "./view/admin-view-substitutes-renderer.js .js";
import { CalendarRenderer } from "./view/substitute-view-calendar.js";
import * as requestedshift from "./model/requested-shift.js";
import * as shift from "./model/myshifts.js";
import * as substitute from "./model/substitute.js";
import {
    getShiftData,
    getShiftInterestData,
    getSubstitutesData,
    getRequestedShifts,
    updateLoginInfo,
    assignSubstitute,
    updateSubstitute,
    createNewSubstitute,
    deleteSubstitute,
    createNewShift,
} from "./controller/rest-service.js";

window.addEventListener("load", initApp);

//Definer globale variabler
let requestedShiftsList = [];
let substitutes = [];
let shifts = [];
let employee = [];
let loggedInEmployeeID = [];
let shiftInterests = [];

async function initApp() {
    console.log("JavaScript is live! 🎉");

    await buildShiftsList();
    await buildSubstitutesList();
    shiftInterests = await getShiftInterestData();

    applyEventListeners();

    initViews();
}

async function buildRequestedShiftsList() {
    const data = await getRequestedShifts();
    requestedShiftsList = data.map(requestedshift.construct);
}

async function buildShiftsList() {
    const originalData = await getShiftData();
    shifts = originalData.map(shift.construct);
}

async function buildSubstitutesList() {
    const originalData = await getSubstitutesData();
    substitutes = originalData.map(substitute.construct);
}

// create substitute show dialog
function createNewSubstituteClicked() {
    document.querySelector("#dialog-create-new-substitute").showModal();
}

// create substitute close dialog
function closeCreateNewSubstituteDialog() {
    document.querySelector("#dialog-create-new-substitute").close();
}

// create substitute error dialog close
function closeErrorMessageInCreateSubstitute() {
    document.querySelector("#dialog-error-message-create-substitute").close();
}

// create shift show dialog
function createNewShiftClicked() {
    document.querySelector("#dialog-create-new-shift").showModal();
}

// create shift close dialog
function closeCreateNewShiftDialog() {
    document.querySelector("#dialog-create-new-shift").close();
}

// create shift close error dialog
function closeErrorMessageInCreateShift() {
    document.querySelector("#dialog-error-message-create-shift").close();
}

function cancelDeleteSubstitute() {
    document.querySelector("#dialog-delete-substitute").close();
}

function cancelUpdateSubstitute() {
    document.querySelector("#dialog-admin-update-substitute").close();
}

function applyEventListeners() {
    // eventlistener for login form
    document.querySelector("#login-form").addEventListener("submit", login);

    // eventlistener for submit myinfo
    document.querySelector("#form-editLoginInfo-dialog").addEventListener("submit", updateLoginInfo);

    // eventlisteners for create new substitute
    document.querySelector("#create-substitute-btn").addEventListener("click", createNewSubstituteClicked);
    document.querySelector("#form-create-new-substitute").addEventListener("submit", createNewSubstitute);
    document
        .querySelector("#form-create-new-substitute-cancel-btn")
        .addEventListener("click", closeCreateNewSubstituteDialog);
    document
        .querySelector("#error-message-create-substitute-btn")
        .addEventListener("click", closeErrorMessageInCreateSubstitute);

    // eventlisteners for create new shift
    document.querySelector("#create-new-shift-btn").addEventListener("click", createNewShiftClicked);
    document.querySelector("#form-create-new-shift").addEventListener("submit", createNewShift);
    document.querySelector("#form-create-new-shift-cancel-btn").addEventListener("click", closeCreateNewShiftDialog);
    document.querySelector("#error-message-create-shift-btn").addEventListener("click", closeErrorMessageInCreateShift);

    // eventlisteners for assign substitute
    document.querySelector("#dialog-admin-assign-shift").addEventListener("submit", assignSubstitute);

    // eventlisteners for update substitute
    document.querySelector("#form-admin-update-substitute").addEventListener("submit", updateSubstitute);
    document
        .querySelector("#form-admin-update-substitute-cancel-btn")
        .addEventListener("click", cancelUpdateSubstitute);

    // eventlisteners for delete substitute
    document.querySelector("#form-delete-substitute").addEventListener("submit", deleteSubstitute);
    document.querySelector("#form-cancel-delete-substitute").addEventListener("click", cancelDeleteSubstitute);

    // eventlistener for logout
    document.querySelector("#logout-btn").addEventListener("click", logOutView);

    document.querySelector("#confirmInterest-btn").addEventListener("click", function () {
        document.querySelector("#shiftInterest-dialog").close();
    });
    document.querySelector("#reject-new-login-info").addEventListener("click", function (event) {
        event.preventDefault(); // Prevent the default form submission behavior
        document.querySelector("#editLoginInfo-dialog").close();
    });

    document.querySelector("#close-passwords-dialog").addEventListener("click", function () {
        document.querySelector("#not-matching-passwords").close();
    });
    document.querySelector("#close-shiftInterest-dialog-btn").addEventListener("click", function () {
        document.querySelector("#existing-shiftInterest-entry").close();
    });
}

async function generateAdminData() {
    loggedInEmployeeID = JSON.parse(localStorage.getItem("currentUser"));

    await buildSubstitutesList();
    await buildShiftsList();
    await buildRequestedShiftsList();

    // ADMIN: Create an instance of "item"Renderers for admin
    const myInfoRenderer = new MyInfoRenderer();
    const adminShiftRenderer = new AdminShiftRenderer();
    const adminViewAvaliableShiftRenderer = new AdminViewAvaliableShiftRenderer();
    const adminViewSubstitutesRenderer = new AdminViewSubstitutesRenderer();

    // ADMIN: MyInfo
    const specificSubstitute = substitutes.filter((substitute) => substitute.id === loggedInEmployeeID.EmployeeID);
    const substitute = new ListRenderer(
        specificSubstitute,
        "#admin-user-info",
        myInfoRenderer,
        "#edit-myinfo-btn1",
        "#edit-myinfo-btn2"
    );
    substitute.render();

    // ADMIN: shifts, new instance of Listrenderer for shifts (admin view)
    const shiftsAdminList = new ListRenderer(shifts, "#shifts-admin-tbody", adminShiftRenderer);
    shiftsAdminList.render();

    // ADMIN: avaliable shifts
    const availableShiftsListAdmin = requestedShiftsList.filter((shift) => !shift.shiftIsTaken);
    const adminAvaliableShiftList = new ListRenderer(
        availableShiftsListAdmin,
        "#availableShifts-admin-tbody",
        adminViewAvaliableShiftRenderer,
        "#assign-btn"
    );
    adminAvaliableShiftList.render();

    // ADMIN: substitutes
    const userListForAdmin = new ListRenderer(
        substitutes,
        "#substitutes-list-admin-tbody",
        adminViewSubstitutesRenderer,
        "#update-substitute-btn",
        "#delete-substitute-btn"
    );
    userListForAdmin.render();

    // ADMIN: add sort eventlisteners vikarer
    document.querySelector("#admin-substitutesList-table-headers").addEventListener("click", (event) => {
        const targetId = event.target.id;
        if (targetId === "substitute-name") {
            userListForAdmin.sort("fullName");
        } else if (targetId === "substitute-employeeID") {
            userListForAdmin.sort("id");
        }
    });

    // ADMIN: add sort eventlisteners vagter
    document.querySelector("#table-headers").addEventListener("click", (event) => {
        const targetId = event.target.id;
        if (targetId === "shift-date") {
            shiftsAdminList.sort("date");
        } else if (targetId === "shift-time") {
            shiftsAdminList.sort("shiftStart");
        } else if (targetId === "shift-employee") {
            shiftsAdminList.sort("fullName");
        }
    });

    // ADMIN: add sort eventlisteners ledige vagter -- admin
    document.querySelector("#admin-available-shifts-table-headers").addEventListener("click", (event) => {
        const targetId = event.target.id;
        if (targetId === "shift-date") {
            adminAvaliableShiftList.sort("timeDK");
        } else if (targetId === "shift-time") {
            adminAvaliableShiftList.sort("hoursStartEnd");
        } else if (targetId === "shift-requested-by") {
            adminAvaliableShiftList.sort("numberOfRequests");
        }
    });

    // ADMIN: add filter eventlistener
    document.querySelector("#admin-shifts-filter").addEventListener("change", () => {
        shiftsAdminList.filter(document.querySelector("#admin-shifts-filter").value);
        adminAvaliableShiftList.filter(document.querySelector("#admin-shifts-filter").value);
    });
}

async function generateSubstituteData() {
    loggedInEmployeeID = JSON.parse(localStorage.getItem("currentUser"));

    // Create an instance of itemRenderers
    const myInfoRenderer = new MyInfoRenderer();
    const MyShiftsrenderer = new MyShiftsRenderer();
    const availableShiftsRenderer = new AvailableShiftsRenderer();
    const calendarRenderer = new CalendarRenderer();
    await buildSubstitutesList();

    // MyInfo
    const specificSubstitute = substitutes.filter((substitute) => substitute.id === loggedInEmployeeID.EmployeeID);
    const substitute = new ListRenderer(
        specificSubstitute,
        ".my-info",
        myInfoRenderer,
        "#edit-myinfo-btn1",
        "#edit-myinfo-btn2"
    );
    substitute.render();

    // Convert shift.id to string before comparison
    const shiftsOfLoggedInEmployee = shifts.filter(
        (shift) => String(shift.employeeID) === String(loggedInEmployeeID.EmployeeID)
    );
    const myShifts = new ListRenderer(shiftsOfLoggedInEmployee, "#myShifts", MyShiftsrenderer);
    myShifts.render();

    const displayAvailableShifts = shifts.filter((shift) => !shift.shiftIsTaken);
    const availableShiftsSubstitutes = new ListRenderer(
        displayAvailableShifts,
        "#availableShifts",
        availableShiftsRenderer,
        "#request-shift-btn"
    );
    availableShiftsSubstitutes.render();
    // availableShiftsRenderer.attachEventListener();

    const calendar = new ListRenderer(shiftsOfLoggedInEmployee, "#calendarBody", calendarRenderer);
    calendar.render();

    // add sort eventlisteners mine vagter
    document.querySelector("#shifts-table-headers").addEventListener("click", (event) => {
        const targetId = event.target.id;
        if (targetId === "shift-date") {
            myShifts.sort("date");
        } else if (targetId === "shifts-shift-time") {
            myShifts.sort("shiftStart");
        } else if (targetId === "shift-hours") {
            myShifts.sort("shiftLength");
        }
    });

    // add sort eventlisteners ledige vagter
    document.querySelector("#available-shifts-table-headers").addEventListener("click", (event) => {
        const targetId = event.target.id;
        if (targetId === "shift-date") {
            availableShiftsSubstitutes.sort("date");
        } else if (targetId === "available-shift-time") {
            availableShiftsSubstitutes.sort("shiftStart");
        }
    });

    function updateCalendar(currentWeek) {
        const calendarBody = document.getElementById("calendarBody");
        calendarBody.innerHTML = ""; // Clear existing content

        // Filter shifts for the current week
        const shiftsForCurrentWeek = shiftsOfLoggedInEmployee.filter((shift) => shift.weekNumber === currentWeek);

        // Render each shift for the current week
        shiftsForCurrentWeek.forEach((shift) => {
            const html = calendarRenderer.render(shift, currentWeek);
            calendarBody.innerHTML += html;
        });
    }

    // Function to navigate to the previous week
    function prevWeek() {
        // Update the week number and call the updateCalendar function
        if (currentWeek === 1) {
            currentWeek = 52;
            currentYear--;
        } else {
            currentWeek--;
        }
        updateCalendar(currentWeek);
        updateWeekHeader(currentWeek);
    }

    // Function to navigate to the next week
    function nextWeek() {
        // Update the week number and call the updateCalendar function
        if (currentWeek === 52) {
            currentWeek = 1;
            currentYear++;
        } else {
            currentWeek++;
        }
        updateCalendar(currentWeek);
        updateWeekHeader(currentWeek);
    }

    // Function to update the week header
    function updateWeekHeader(weekNumber) {
        document.getElementById("currentWeek").textContent = `Uge ${currentWeek}`;
        document.getElementById("calendar-year").textContent = `Min Kalender ${currentYear}`;

        // Get the start date of the specified week
        const startDate = getStartDateOfWeek(currentYear, weekNumber);

        // Get the table header row
        const headerRow = document.getElementById("calendar-th").querySelector("tr");

        // Loop through each day of the week
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            // Update the inner HTML of the corresponding table header cell
            const cell = headerRow.children[i];
            cell.innerHTML = `${getWeekday(currentDate)}<br>${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
            // Inside the loop where you're creating table header cells
            const row = document.createElement("tr");
            row.dataset.week = currentWeek;
            row.dataset.date = `${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
        }
    }

    // Get the current date
    const currentDate = new Date();
    let currentYear = 2023;

    // Calculate the current week number
    let currentWeek = getWeekNumber(currentDate);

    // Function to calculate the week number
    function getWeekNumber(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    }

    function getStartDateOfWeek(year, weekNumber) {
        const januaryFirst = new Date(year, 0, 1);
        const daysToFirstMonday = (8 - januaryFirst.getDay()) % 7;
        const daysToTargetWeek = (weekNumber - 1) * 7;

        const startDate = new Date(januaryFirst);
        startDate.setDate(januaryFirst.getDate() + daysToFirstMonday + daysToTargetWeek);

        return startDate;
    }

    // Function to get the weekday based on a date
    function getWeekday(date) {
        const daysOfWeek = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
        const dayIndex = date.getDay();
        return daysOfWeek[dayIndex];
    }

    // Initial calendar update
    updateCalendar(currentWeek);
    updateWeekHeader(currentWeek);

    document.querySelector("#prev-week-btn").addEventListener("click", prevWeek);
    document.querySelector("#next-week-btn").addEventListener("click", nextWeek);
}

export {
    endpoint,
    initApp,
    generateAdminData,
    generateSubstituteData,
    employee,
    loggedInEmployeeID,
    shiftInterests,
    substitutes,
    requestedShiftsList,
    buildShiftsList,
    buildRequestedShiftsList,
};
