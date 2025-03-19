function showAll(){
    let url = window.location.href;
    document.getElementById('url').innerHTML = url;

    window.navigator.geolocation.getCurrentPosition(showPosition);
    document.getElementById('browser').innerHTML = window.navigator.userAgent.replace(/ *\([^)]*\)*/g, "");
    document.getElementById('sistemOperare').innerHTML = /\(([^)]+)\)/.exec(window.navigator.userAgent)[1];
}

function dateTime(){
    const now = new Date();
    document.getElementById('dataTimp').innerHTML = now;
}

function showPosition(position){
    document.getElementById("locatie").innerHTML = 
    "Latitudine: " + position.coords.latitude + "<br>" +
    "Longitudine: " + position.coords.longitude;
 }

function InitPage(){
    // setInterval()
    // window.savedInterval = setInterval(() => {
    //     document.getElementById('dataTimp').innerHTML =  new Date().toLocaleString();
    // }, 1000);
    setInterval(dateTime, 1000);
    showAll();
}