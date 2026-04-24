$(document).ready(function () {

    $("#submitBtn").click(function () {
        let name = $("#name").val();
        let email = $("#email").val();

        if (name === "" || email === "") {
            $("#result").html("Please fill all fields");
        } else {
            $("#result").html("Hello " + name + ", we will contact you at " + email);
        }
    });

    $("#showInfo").click(function () {
        $("#info").html("jQuery Mobile makes web apps mobile-friendly!");
    });

});