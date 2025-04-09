class Produs {
    constructor(id, nume, cantitate){
    this.id = id;
    this.nume = nume;
    this.cantitate = cantitate;
    }
}

const worker = new Worker("js/worker.js");
worker.addEventListener('message', function(event) {
    const produs = event.data;
    console.log(`Worker a confirmat adăugarea produsului: ${produs.nume}`);
});
function adaugaProdus() {
    const nume = document.getElementById("numeProdus").value;
    const cantitate = document.getElementById("cantitate").value;

    if (!nume || !cantitate) {
        alert("Completează toate câmpurile!");
        return;
    }

    let produse = JSON.parse(localStorage.getItem("produse")) || [];

    const produsNou = new Produs(produse.length + 1, nume, cantitate);

    produse.push(produsNou);

    localStorage.setItem("produse", JSON.stringify(produse));

    document.getElementById("numeProdus").value = "";
    document.getElementById("cantitate").value = "";
    
    afiseazaProduse();

    if (worker) {
        worker.postMessage(produsNou);

    }
}
function afiseazaProduse() {
    const tabel = document.getElementById("tabelProduse");
    tabel.innerHTML = ""; 

    const produse = JSON.parse(localStorage.getItem("produse")) || [];

    produse.forEach((produs) => {
        const rand = document.createElement("tr");

        const td1 = document.createElement("td");
        td1.innerText = produs.id;
        const td2 = document.createElement("td");
        td2.innerText = produs.nume;
        const td3 = document.createElement("td");
        td3.innerText = produs.cantitate;

        rand.appendChild(td1);
        rand.appendChild(td2);
        rand.appendChild(td3);

        tabel.appendChild(rand);
    });
}