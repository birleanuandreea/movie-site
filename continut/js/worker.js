self.onmessage = function(e) {
    console.log("Worker a fost notificat:", e.data);
    self.postMessage("Worker confirma primirea: " + e.data);
};
