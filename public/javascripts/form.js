var form = document.querySelector('form');
form.addEventListener('submit', onSubmit);

function onSubmit(event) {
    event.preventDefault();
    console.log(event.srcElement);
    $.ajax("/api/customer", {
        method: "POST",
        json: true,
        traditional: true,
        crossDomain: true,
        data: objectifyForm($(event.srcElement).serializeArray())
    }).then(function (response) {
        window.location.href = response.redirect;
    })
}

function objectifyForm(formArray) { //serialize data function

    var returnArray = {};
    for (var i = 0; i < formArray.length; i++) {
        returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return returnArray;
}