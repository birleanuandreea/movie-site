self.addEventListener('message', function (event) {
    
    const nume = event.data.nume;
    const cantitate = event.data.cantitate;
    const id = event.data.id;


    console.log(`Received message from main script: ID: ${id} Nume: ${nume}, Cantitate: ${cantitate}`);

    
    self.postMessage(event.data);
});

