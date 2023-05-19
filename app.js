////////////////////////////////////////////////////////
// Make date input as picker with jQuery widget
////////////////////////////////////////////////////////

$(function () {
    $("#date").datepicker({
        dateFormat: "dd.mm.yy"
    });
});

//////////////////////////////////////////////////////////////////////////////////////////////////////
// Instantly after loading window, retrieve and render all possible theatre options from finnkino API
//////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
    getAreas();
    getShows(); // Get initial list of all shows today when no value selected
});

////////////////////////////////////////////////////////
//  Trigger the getShows() function if 
//  a change is detected in the drop-down or date picker.
//////////////////////////////////////////////////////// 

$("#dropdown").change(function () {
    getShows($(this).val(), $("#date"));
});


$("#date").change(function () {
    getShows($("#dropdown").val(), $(this).val());
});

////////////////////////////////////////////////////////
//  GET selectable theaters from Finnkino's API and 
//  create options based on response data.
//////////////////////////////////////////////////////// 

function getAreas() {
    $.get("https://www.finnkino.fi/xml/TheatreAreas/", function (response) {
        console.log('Getting theatres OK');
        createSelections(response);
    }, "xml");
};

////////////////////////////////////////////////////////
//  Function to create new selection option to dropdown
//////////////////////////////////////////////////////// 

function createSelections(xml) {
    $(xml).find("TheatreArea").each(function () {
        let value = $(this).find("ID").text();
        let name = $(this).find("Name").text();
        $("#dropdown").append(new Option(name, value));
    });
};

//////////////////////////////////////////////////////
//  Function to get all shows of desired
//  theatre and date. Date defaults today if none given.
//////////////////////////////////////////////////////

function getShows(theatreArea, inputDate) {
    const loadingEl = `<div class="loader">Venaa rauhassa, haetaa tietoja laiskalta API:lta..<br>
    <img class="img-fluid loading-img" src="img/loading.gif" alt="loading"></div>`;
    $("#shows").html(loadingEl);

    $.get("https://www.finnkino.fi/xml/Schedule/?area=" + theatreArea + "&dt=" + inputDate, function (response) {
        console.log('Getting shows OK!');
        createShows(response);
    }, "xml");
};

//////////////////////////////////////////////////////
//  Function to create show element
//////////////////////////////////////////////////////

function createShows(xml) {
    $("#shows").html(''); // Clear before new generation
    let shows = $(xml).find("Show");

    // Check if there is actually shows in array. Iterate through the shows list and render those on the table
    if (shows.length > 0) {
        shows.each(function () {

            let title = $(this).find("Title").text();
            let prodYear = $(this).find("ProductionYear").text();
            let genres = $(this).find("Genres").text();
            let lengthInMinutes = $(this).find("LengthInMinutes").text();
            let showStart = $(this).find("dttmShowStart").text();
            let theatreAuditorium = $(this).find("TheatreAndAuditorium").text();
            let eventLink = $(this).find("EventURL").text();
            let showLink = $(this).find("ShowURL").text();
            let moviePicture = $(this).find("EventSmallImagePortrait").text();

            $("#shows").append(
                `<tr class="slidable">
                 <td><img class="img-fluid" src="${moviePicture}" alt="${title}"></td>
                 <td colspan="3"><h2><a href="${eventLink}" target="_blank">${title} - ${prodYear}</a></h2>
                 <span>${genres} Kesto: ${lengthInMinutes} Minuuttia</span>
                 <h5><a href="${showLink}" target="_blank">Näytös: ${parseTimestamp(showStart)} | ${theatreAuditorium}</a></h5>
                </td>
                </tr>`
            );
        });
        $(".slidable").fadeIn(1500);
    }
    // show error message if array containing shows is empty
    else {

        let htmlElement = `<tr class="slidable">
        <td><img class="img-fluid" src="img/sadface.png" alt="error"></td>
        <td colspan="3"><p><h2>Voe rähämä! Ei yhtään näytöstä!</h2>
        Ettei nyt vain olisi päivämäärä keturallaan?</p>
        </td>
        </tr>`
        $("#shows").html(htmlElement);
        $(".slidable").fadeIn(1500);
    };
};

//////////////////////////////////////////////////////
//  Function to parse timestamp to more readable form
//////////////////////////////////////////////////////

function parseTimestamp(timestamp) {
    unixTime = Date.parse(timestamp);
    let date = new Date(unixTime);
    let options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleTimeString("fi-FI", options);
};