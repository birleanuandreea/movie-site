class Stocare {
    async salveazaLista(lista) {
        throw new Error("Metoda salveazaLista trebuie implementata");
    }

    async incarcaLista() {
        throw new Error("Metoda incarcaLista trebuie implementata");
    }
}

// implementare cu localStorage
class StocareLocalStorage extends Stocare {
    async salveazaLista(lista) {
        localStorage.setItem('cumparaturi', JSON.stringify(lista));
    }

    async incarcaLista() {
        return JSON.parse(localStorage.getItem('cumparaturi') || '[]');
    }
}

// implementare cu indexedDB
class StocareIndexedDB extends Stocare {
    constructor() {
        super();
        this.dbName = 'CumparaturiDB';
        this.objectStoreName = 'produse';
        this.db = null;
        this.init();    // descidere, creare tabelei daca nu exista
    }

    init() {
        const request = indexedDB.open(this.dbName, 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(this.objectStoreName)) {
                db.createObjectStore(this.objectStoreName, { keyPath: 'id' });
            }
        };
        request.onsuccess = (e) => {
            this.db = e.target.result;
        };
        request.onerror = (e) => {
            console.error("Eroare IndexedDB:", e);
        };
    }

    async salveazaLista(lista) {
        if (!this.db) return;
        const tx = this.db.transaction(this.objectStoreName, 'readwrite');
        const store = tx.objectStore(this.objectStoreName);
        store.clear();
        for (let produs of lista) {
            store.put(produs);
        }
    }

    async incarcaLista() {
        return new Promise((resolve, reject) => {
            if (!this.db) return resolve([]);
            const tx = this.db.transaction(this.objectStoreName, 'readonly');
            const store = tx.objectStore(this.objectStoreName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject([]);
        });
    }
}


class Produs {
    constructor(id, nume, cantitate) {
        this.id = id;
        this.nume = nume;
        this.cantitate = cantitate;
    }
}


const worker = new Worker("js/worker.js");
worker.onmessage = function(e){
    console.log("Worker-ul confirma adaugarea produsului:"+ e.data);
}


let strategieStocare = new StocareLocalStorage();

document.getElementById('metodaStocare').addEventListener('change', async (e) => {
    const metoda = e.target.value;
    strategieStocare = (metoda === 'indexedDB') ? new StocareIndexedDB() : new StocareLocalStorage();

    setTimeout(() => afiseazaLista(), 200);
});


async function afiseazaLista() {
    const lista = await strategieStocare.incarcaLista();
    const tbody = document.getElementById('lista-produse');
    tbody.innerHTML = '';
    lista.forEach((p) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.id}</td>
            <td>${p.nume}</td>
            <td>${p.cantitate}</td>
        `;
        tbody.appendChild(row);
    });
}


async function inregistrareProdus(){
    const nume = document.getElementById('numeProdus').value;
    const cantitate = parseInt(document.getElementById('cantitateProdus').value);

    if (!nume || isNaN(cantitate)){
        alert("Introduceti datele in formular");
        return;
    } 

    let lista = await strategieStocare.incarcaLista();
    const produs = new Produs(lista.length + 1, nume, cantitate);
    lista.push(produs);

    await strategieStocare.salveazaLista(lista);
    afiseazaLista();

    worker.postMessage(`Produs adaugat: ${produs.nume} (${produs.cantitate})`);
    document.getElementById("formularCumparaturi").reset();
}