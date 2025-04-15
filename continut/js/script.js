// --------------------------------------------------------------------------------------------------------------------------------------------
// Initializarea paginii invat.html
function InitPage(){
    
    setInterval( () => {
        const data = new Date();
        const dataTimpElement = document.getElementById("dataTimp");
        if (dataTimpElement) {
            dataTimpElement.innerHTML = data;
        }
    }, 1000);

    showInfo();
    InitCanvas();
    Table();
}

// ---------------------------------------------------------------------------------------------------------------------------
// Informatii depre pagina
function showInfo(){
    document.getElementById('url').innerHTML = window.location.href;

    if(navigator.geolocation){
        window.navigator.geolocation.getCurrentPosition(showPosition);
    }else{
        document.getElementById("locatie").innerHTML = "Geolocation nu este suportat de acest browser.";
    }
    
    document.getElementById('browser').innerHTML = window.navigator.userAgent.replace(/ *\([^)]*\)*/g, "");
    document.getElementById('sistemOperare').innerHTML = /\(([^)]+)\)/.exec(window.navigator.userAgent)[1];
}

function showPosition(position){
    document.getElementById("locatie").innerHTML = 
    "Latitudine: " + Math.round(position.coords.latitude * 100)/100 + "<br>" +
    "Longitudine: " + Math.round(position.coords.longitude * 100)/100;
 }


//----------------------------------------------------------------------------------------------------------------------------------------------
// Canvas
function InitCanvas() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext("2d");    // To draw in the canvas you need to create a 2D context object
    const strokeColorPicker = document.getElementById('strokeColor');
    const fillColorPicker = document.getElementById('fillColor');

    let startX = null;
    let startY = null;
    

    let img = new Image(); 
    img.src = 'Imagini/scene.png';
    img.onload = function() {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    // eveniment click pentru desenarea unui dreptunghi
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // primul click
        if (startX === null || startY === null) {
            startX = x;
            startY = y;
        } else {
            // al doilea click
            const width = x - startX;
            const height = y - startY;

            ctx.strokeStyle = strokeColorPicker.value;
            ctx.fillStyle = fillColorPicker.value;
            

            ctx.beginPath();
            ctx.rect(startX, startY, width, height);
            ctx.fill();
            ctx.stroke();


            startX = null;
            startY = null;
        }
    });

    document.getElementById('delete').addEventListener("click", function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height); 
    });
}


//----------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Tabel modificat dinamic
function Table(){
    document.getElementById('add_row').addEventListener('click', function(){
        try{
            const index = document.getElementById('row_column').value;
            if(index === "" )
                throw new Error('Casuta goala');
            
            const color = document.getElementById('color').value;
            const dynamicTable = document.getElementById('dynamicTable');
            
            const no_rows = dynamicTable.rows.length;
            if(index > no_rows || index < 0){
                throw new Error("Indexul randului este invalid");
            }

            const no_columns = dynamicTable.rows[0].cells.length;
            const row = dynamicTable.insertRow(index);

            for(let i = 0; i < no_columns; i++){
                let cell = row.insertCell(i);
                cell.style.backgroundColor = color;
                cell.style.height = "15px";
            }
        }
        catch(error){
            alert(error);
        }
    });
    document.getElementById('add_column').addEventListener('click', function(){
        try{
            const index = document.getElementById('row_column').value;
            if(index === "" )
                throw new Error('Casuta goala');
            
            const color = document.getElementById('color').value;
            const dynamicTable = document.getElementById('dynamicTable');

            const no_rows = dynamicTable.rows.length;
            const no_columns = dynamicTable.rows[0].cells.length;
        
            if(index > no_columns || index < 0) {
                throw new Error('Index-ul coloanei este invalid');
            }

            for(let i = 0; i < no_rows; i++){
                let cell = dynamicTable.rows[i].insertCell(index);
                cell.style.backgroundColor = color;
                cell.style.width = "50px";
            }
        }
        catch(error){
            alert(error);
        }
    });
}


//-----------------------------------------------------------------------------------------------------------------------
// functie AJAX apelata in index.html
function schimbaContinut(resursa, jsFisier, jsFunctie) {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            document.getElementById('continut').innerHTML = xhttp.responseText;

            if (jsFisier) {
                if (!document.querySelector(`script[src="${jsFisier}"]`)) {
                    var elementScript = document.createElement('script');
                    elementScript.onload = function() {
                        console.log("Script incarcat");
                        if (jsFunctie) {
                            window[jsFunctie]();
                        }
                    };
                    elementScript.src = jsFisier;
                    document.head.appendChild(elementScript);
                } else {
                    if (jsFunctie) {
                        window[jsFunctie]();
                    }
                }
            } else {
                if (jsFunctie) {
                    window[jsFunctie]();
                }
            }
        }
    };
    xhttp.open('GET', resursa + '.html', true);
    xhttp.send();
}


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// functia AJAX apelata in verificare.html
async function verificaUtilizator(){
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try{
        const response = await fetch("resurse/utilizatori.json");

        if(response.status === 200){
            const text = await response.text();
            const users = JSON.parse(text);

            const ok = users.find(user => {
                return user.utilizator === username && user.parola === password
            });

            if(ok){
                document.getElementById("auth").innerHTML = "Autentificare reusita";
            }else{
                document.getElementById("auth").innerHTML = "Eroare la autentificare";
            }
        }else{
            throw new Error("Eroare la incarcarea fisierului");
        }
    }catch(error){
        alert(error);
    }
}

// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// functie pentru inregistrarea in formular
function inregistreaza() {

    let p = document.getElementById("mesaj");
    p.innerHTML = "";

    let f = document.getElementById("registrationForm");

    if (!f.checkValidity()) {
        p.innerHTML = "Vă rugăm să completați toate câmpurile formularului.";
        p.style.color = "red";
        return;
    }

    const data = {
        utilizator: document.getElementById("utilizator").value,
        parola: document.getElementById("parola").value,
        nume: document.getElementById("nume").value,
        prenume: document.getElementById("prenume").value,
        email: document.getElementById("email").value,
        telefon: document.getElementById("telefon").value,
        sex: document.getElementById("sex").value,
        gen: document.getElementById("gen").value,
        culoare: document.getElementById("culoare").value,
        data: document.getElementById("data").value,
        ora: document.getElementById("ora").value,
        varsta: document.getElementById("varsta").value,
        adresa: document.getElementById("adresa").value,
        descriere: document.getElementById("descriere").value
    };

    fetch('/api/utilizatori', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            p.innerHTML = "Eroare la înregistrare!";
            p.style.color = "red";
            throw new Error("Eroare la inregistrare");
        }
        return response.text();
    })
    .then(data => {
        p.innerHTML = data;
        p.style.color = "green";
        f.reset();
    })
    .catch(error => {
        console.error(error);
    });
}