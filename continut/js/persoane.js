// obtinerea continutului unui tag
function getData(tag, parent){
    const element = parent.getElementsByTagName(tag)[0];
    return element ? element.innerHTML : "";
}

// incarcarea si afisarea datelor dintr-un fisier xml sub forma de tabel
function incarcaPersoane(){
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', '/resurse/persoane.xml');
    xhttp.send();

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4){
            if(xhttp.status == 200) {
            const xmlDoc = xhttp.responseXML;
            const persons = xmlDoc.getElementsByTagName("persoana");
            const section = document.getElementById('tabelPersoane');
            const table = document.createElement('table');
            table.classList.add('tabel-persoane');  // adaugare clasa unica pentru stil

            // creare antet tabel
            const firstRow = table.insertRow(0);
            const headere = [
                "Nume", "Prenume", "Vârstă", "Telefon", "Email",
                "Adresă", "Data nașterii"
            ];
            headere.forEach(h => {
                const th = document.createElement("th");
                th.innerHTML = h;
                firstRow.appendChild(th);
            });

            // creare randurilor tabelului cu date
            for(let i = 0; i < persons.length; i++){
                const person = persons[i];
                const row = table.insertRow(i+1);

                const nume = getData("nume", person);
                const prenume = getData("prenume", person);
                const varsta = getData("varsta", person);
                const telefon = getData("telefon", person);
                const email = getData("email", person);
                
                const adresa = person.getElementsByTagName("adresa")[0];
                const adresaCompleta = adresa ? `${getData("strada", adresa)}, Nr. ${getData("numar", adresa)}, ${getData("localitate", adresa)}, ${getData("judet", adresa)}, ${getData("tara", adresa)}, ${getData("cod_postal", adresa)}` : "";

                const data = person.getElementsByTagName("data_nasterii")[0];
                const dataCompleta = data ? `${getData("zi", data)} ${getData("luna", data)} ${getData("an", data)}` : "";
                
                const date = [nume, prenume, varsta, telefon, email, adresaCompleta, dataCompleta];
                date.forEach(d => {
                    const td = document.createElement("td");
                    td.innerHTML = d;
                    row.appendChild(td);
                });
            }

            const style = document.createElement('style');
            style.innerHTML = `
                .tabel-persoane {
                    border-collapse: collapse;
                    width: 100%;
                    margin-top: 20px;
                    white-space: nowrap; 
                }

                .tabel-persoane th, .tabel-persoane td {
                    border: 2px solid rgb(10, 114, 183);
                    text-align: center;
                    padding: 8px;
                    height: 25px;
                }

                .tabel-persoane th {
                    background-color:rgb(83, 143, 223);
                    font-size: 1.5em;
                    font-weight: bold;
                }

                .tabel-persoane tr:nth-child(even) {
                    background-color: #f2f2f2;
                }

            `;
            document.head.appendChild(style);

            // afisarea tabelului in pagina
            section.innerHTML = ''; // sterge continutul initial
            section.appendChild(table);
            } else {
                alert('Eroare la incarcarea fisierului XML');
            }
        }
    };
}