import { viewChange } from "./view-router.js";

const endpoint = "https://localhost:3333";

// get Json-data
async function getSubstitutesData() {
    const response = await fetch(`${endpoint}/substitutes`);
    const data = await response.json();
    return data;
}

// get Json-data
async function getShiftData() {
    const response = await fetch(`${endpoint}/shifts`);
    const data = await response.json();
    return data;
}

// get Json-data
async function getShiftInterestData() {
    const response = await fetch(`${endpoint}/shiftInterests`);
    const data = await response.json();
    return data;
}

//Fetching "/shifts/requestedshifts" from endpoint and returns js object
async function getRequestedShifts() {
    const response = await fetch(`${endpoint}/shifts/requestedshifts`);
    const data = response.json();
    return data;
}

// update username and/or password
async function updateLoginInfo() {
    const form = document.querySelector("#form-editLoginInfo-dialog");
    const employeeID = form.userID.value;
    const userName = form.editUsername.value;
    const passwordNew = form.editPassword.value;
    const passwordNewConfirm = form.confirmNewPassword.value;

    console.log(userName);
    console.log(passwordNew);

    if (passwordNew !== passwordNewConfirm) {
        console.log("password ikke ens");
        document.querySelector("#not-matching-passwords").showModal();
    } else {
        const bodyToUpdate = { Username: userName, PasswordHash: passwordNew, EmployeeID: employeeID };

        const response = await fetch(`${endpoint}/substitutes/${employeeID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyToUpdate),
        });

        if (response.ok) {
            console.log("Dit password er nu ændret!");
        } else {
            console.log("Noget gik galt, dit password er IKKE ændret!");
        }
    }
    viewChange();
}

// Create shift request/interest
async function createShiftRequest(substituteID, shiftID) {
    const employeeID = substituteID;
    const requestedShiftID = shiftID;
    const bodyToPost = { ShiftID: requestedShiftID, EmployeeID: employeeID };

    const response = await fetch(`${endpoint}/shiftInterests`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(bodyToPost),
    });

    if (response.ok) {
        console.log("Dit bud er registreret!");
        document.querySelector("#shiftInterest-dialog").showModal();
    } else {
        console.log("Dit bud blev ikke registreret! (måske har du allerede budt?)");
        document.querySelector("#existing-shiftInterest-entry").showModal();
    }
}

//Opdatere tildeling af vagt
async function assignSubstitute(event) {
    event.preventDefault();
    const form = event.target;

    const shiftID = Number(form.formAssignShiftID.value);
    const employeeID = Number(form.formAssignSubstituteID.value);
    const bodyToUpdate = { EmployeeID: employeeID, ShiftID: shiftID };

    const response = await fetch(`${endpoint}/shifts/${shiftID}`, {
        method: "put",
        headers: { "content-type": "application/json" },
        // Convert body to JSON string before sending it to the API
        body: JSON.stringify(bodyToUpdate),
    });

    document.querySelector("#dialog-admin-assign-shift").close();
    viewChange();
}

// Create new substitute
async function createNewSubstitute(event) {
    event.preventDefault();

    const form = event.target;

    const firstName = form.firstname.value;
    const lastName = form.lastname.value;
    const dateOfBirth = form.elements["date-of-birth"].value;
    const mail = form.mail.value;
    const number = form.elements["phone-number"].value;
    let adminStatus = form.elements["admin-status"].value;
    if (adminStatus === "is-not-admin") {
        adminStatus = false;
    } else if (adminStatus === "is-admin") {
        adminStatus = true;
    }
    const userName = form.username.value;
    const password = form.password.value;

    const user = {
        FirstName: firstName,
        LastName: lastName,
        DateOfBirth: dateOfBirth,
        Mail: mail,
        Number: number,
        IsAdmin: adminStatus,
        Username: userName,
        PasswordHash: password,
    };
    const userAsJson = JSON.stringify(user);
    const response = await fetch(`${endpoint}/substitutes/`, {
        method: "POST",
        body: userAsJson,
        headers: {
            "content-Type": "application/json",
        },
    });

    if (response.ok) {
        // if success, close dialog tag
        document.querySelector("#dialog-create-new-substitute").close();

        viewChange();
    } else {
        document.querySelector("#dialog-error-message-create-substitute").showModal();
        document
            .querySelector("#error-message-create-substitute-btn")
            .addEventListener("click", closeErrorMessageInCreateSubstitute);
    }
}

// Delete substitute
async function deleteSubstitute(event) {
    // forhindre default adfærd der refresher siden
    event.preventDefault();
    const form = event.target;

    const employeeID = Number(form.formDeleteEmployeeID.value);
    const bodyToDelete = { EmployeeID: employeeID };

    const response = await fetch(`${endpoint}/substitutes/${employeeID}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(bodyToDelete),
    });

    if (response.ok) {
        console.log("Vikar slettet!");
    } else {
        console.log("Noget gik galt, vikaren er IKKE slettet!");
    }

    document.querySelector("#dialog-delete-substitute").close();

    viewChange();
}

// Update Substitute
async function updateSubstitute(event) {
    event.preventDefault();
    const form = event.target;

    const firstName = form.firstname.value;
    const lastName = form.lastname.value;
    const birthdate = form.dateofbirth.value;
    const mail = form.mail.value;
    const number = Number(form.phonennumber.value);
    // const isAdmin = form.querySelector("#form-admin-update-substitute-is-admin").checked;
    const userName = form.username.value;
    const id = Number(form.formUpdateEmployeeID.value);

    const bodyToUpdate = {
        FirstName: firstName,
        LastName: lastName,
        DateOfBirth: birthdate,
        Mail: mail,
        Number: number,
        Username: userName,
        EmployeeID: id,
    };

    console.log(bodyToUpdate);

    const response = await fetch(`${endpoint}/substitutes/admins/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(bodyToUpdate),
    });

    if (response.ok) {
        console.log("Brugeren er opdateret med succes!");
    } else {
        console.log("Noget gik galt, brugeren blev ikke opdateret!");
    }

    document.querySelector("#dialog-admin-update-substitute").close();

    viewChange();
}

// Create new shift
async function createNewShift(event) {
    event.preventDefault();

    const form = event.target;

    const shiftDate = form.elements["shift-date"].value;
    const shiftStart = form.elements["shift-start"].value;
    const shiftEnd = form.elements["shift-end"].value;

    const convertedShiftStart = formatDateTime(shiftStart);
    const convertedShiftEnd = formatDateTime(shiftEnd);
    const newShift = {
        Date: shiftDate,
        ShiftStart: convertedShiftStart,
        ShiftEnd: convertedShiftEnd,
    };
    const newShiftAsJson = JSON.stringify(newShift);
    const response = await fetch(`${endpoint}/shifts/`, {
        method: "POST",
        headers: { "content-Type": "application/json" },
        body: newShiftAsJson,
    });
    if (response.ok) {
        // if success, close dialog window
        document.querySelector("#dialog-create-new-shift").close();

        viewChange();
    } else {
        document.querySelector("#dialog-error-message-create-shift").showModal();
        document
            .querySelector("#error-message-create-shift-btn")
            .addEventListener("click", closeErrorMessageInCreateShift);
    }
}

// corrects date format
const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = (date.getHours() + 1).toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export {
    getShiftData,
    getSubstitutesData,
    getShiftInterestData,
    getRequestedShifts,
    updateLoginInfo,
    createShiftRequest,
    assignSubstitute,
    updateSubstitute,
    createNewSubstitute,
    deleteSubstitute,
    createNewShift,
};
