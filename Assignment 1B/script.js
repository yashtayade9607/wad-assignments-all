/* ---------- NAME VALIDATION ---------- */
function validateName() {
    let name = document.getElementById("name").value;
    let error = document.getElementById("nameError");
    let pattern = /^[A-Za-z][A-Za-z ]*$/;

    if (name === "") {
        error.textContent = "";
        return false;
    } else if (!pattern.test(name)) {
        error.textContent = "Only alphabets allowed";
        return false;
    } else {
        error.textContent = "";
        return true;
    }
}

/* ---------- MOBILE VALIDATION ---------- */
function validateMobile() {
    let mobile = document.getElementById("tel").value;
    let error = document.getElementById("mobileError");
    let pattern = /^[6-9][0-9]{9}$/;

    if (mobile === "") {
        error.textContent = "";
        return false;
    } else if (!/^[0-9]*$/.test(mobile)) {
        error.textContent = "Only numbers allowed";
        return false;
    } else if (!pattern.test(mobile)) {
        error.textContent = "Must start with 6-9 and be 10 digits";
        return false;
    } else {
        error.textContent = "";
        return true;
    }
}

/* ---------- PASSWORD VALIDATION ---------- */
function validatePassword() {
    let password = document.getElementById("password").value;
    let error = document.getElementById("passwordError");
    let pattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{8,}$/;

    if (password === "") {
        error.textContent = "";
        return false;
    } else if (!pattern.test(password)) {
        error.textContent = "Min 8 chars, 1 uppercase, 1 number & 1 symbol";
        return false;
    } else {
        error.textContent = "";
        return true;
    }
}

/* ---------- SHOW / HIDE PASSWORD ---------- */
function togglePassword() {
    let pwd = document.getElementById("password");
    let btn = document.getElementById("showPassword");
    btn.textContent = (btn.textContent === "Show") ? "Hide" : "Show" ;
    pwd.type = pwd.type === "password" ? "text" : "password";
}

/* ---------- DOB VALIDATION ---------- */
function validateDOB() {
    let dob = document.getElementById("dob").value;
    let error = document.getElementById("dobError");

    if (dob === "") {
        error.textContent = "";
        return false;
    }

    let dobDate = new Date(dob);
    let today = new Date();

    if (dobDate > today) {
        error.textContent = "DOB cannot be a future date";
        return false;
    }

    let age = today.getFullYear() - dobDate.getFullYear();
    let m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) age--;

    if (age < 18 || age > 60) {
        error.textContent = "Age must be between 18 and 60";
        return false;
    } else {
        error.textContent = "";
        return true;
    }
}

/* ---------- ADDRESS VALIDATION ---------- */
function validateAddress() {
    let address = document.getElementById("address").value;
    let error = document.getElementById("addressError");

    if (address === "") {
        error.textContent = "";
        return false;
    }

    let lines = address.trim().split("\n");

    if (lines.length < 2) {
        error.textContent = "Address must contain at least 2 lines";
        return false;
    } else {
        error.textContent = "";
        return true;
    }
}

/* ---------- OTHER HOBBY TOGGLE ---------- */
function toggleOtherHobby() {
    let checkbox = document.getElementById("other");
    let textbox = document.getElementById("otherHobbies");

    textbox.style.display = checkbox.checked ? "inline" : "none";
    if (!checkbox.checked) textbox.value = "";
}

/* ---------- FORM SUBMISSION ---------- */
let submissions = [];

document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();

    if (
        !validateName() ||
        !validateMobile() ||
        !validatePassword() ||
        !validateDOB() ||
        !validateAddress()
    ) {
        return;
    }

    let dob = document.getElementById("dob").value;
    let dobDate = new Date(dob);
    let today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    let m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) age--;

    let hobbies = [];
    if (singing.checked) hobbies.push("Singing");
    if (dancing.checked) hobbies.push("Dancing");
    if (drawing.checked) hobbies.push("Drawing");
    if (other.checked && otherHobbies.value.trim())
        hobbies.push(otherHobbies.value.trim());

    let formData = {
        name: name.value,
        mobile: tel.value,
        email: document.querySelector("input[type='email']").value,
        password: password.value,
        dob: dob,
        age: age,
        address: address.value,
        city: document.querySelector("select").value,
        gender: document.querySelector("input[name='gender']:checked").value,
        hobbies: hobbies
    };

    submissions.push(formData);

    document.querySelector(".container").style.display = "block";
    document.getElementById("output").textContent =
        JSON.stringify(submissions, null, 2);

    this.reset();
    document.getElementById("otherHobbies").style.display = "none";
});
