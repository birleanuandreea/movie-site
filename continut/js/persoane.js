function incarcaPersoane(){
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', '/resurse/persoane.xml');

    xhttp.onload = function () {
        if (xhttp.status === 200) {
            const xmlDoc = xhttp.responseXML;
            console.log(xmlDoc);

            const persons = xmlDoc.getElementsByTagName("persoana");
            console.log(persons); //textContent

            const section = document.getElementById('tabelPersoane');   //
            const table = document.createElement('table');      // table
            const row = table.insertRow(-1);
            for (let i = 1; i < persons[0].childNodes.length; i += 2)
            {
                const th = document.createElement('th');
                th.textContent = persons[0].childNodes[i].tagName.replace(/([A-Z])/g, ' $1').replace(/\b\w/g, char => char.toUpperCase());
                row.appendChild(th);
            }

            for (let i = 0; i < persons.length; i++)
            {
                const row = table.insertRow(-1);

                for (let j = 1; j < persons[0].childNodes.length; j += 2)
                {
                    const td = document.createElement('td');
                    td.textContent = persons[i].childNodes[j].textContent;
                    row.appendChild(td);
                }
                
            }

            const style = document.createElement('style');
            style.innerHTML = `
                                table {
                                    border-collapse: collapse;
                                    width: 100%;
                                }

                                th, td {
                                    border: 2px solid #20608B;
                                    text-align: left;
                                    padding: 8px;
                                }

                                th {
                                    background-color: #4db9c7;
                                }

                                tr:nth-child(even) {
                                    background-color: #f2f2f2;
                                }
                            `;
            document.head.appendChild(style);

            section.innerHTML = '';
            section.appendChild(table);
        } else {
            console.error('Eroare la incarcarea fisierului XML');
        }
    };

    xhttp.send();
}