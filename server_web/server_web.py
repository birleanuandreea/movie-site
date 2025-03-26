import socket

# creeaza un server socket 
serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM) 
# specifica ca serverul va rula pe portul 5678, accesibil de pe orice ip al serverului 
serversocket.bind(('', 5678)) 
# serverul poate accepta conexiuni; specifica cati clienti pot astepta la coada 
serversocket.listen(5) 

while True: 
    print('#########################################################################')
    print('Serverul asculta potentiali clienti.')
    # asteapta conectarea unui client la server 
    (clientsocket, address) = serversocket.accept() 
    print('S-a conectat un client.')
    
    # se proceseaza cererea si se citeste prima linie de text 
    cerere = '' 
    linieDeStart = '' 
    while True: 
        data = clientsocket.recv(1024) 
        cerere = cerere + data.decode() 
        print('S-a citit mesajul: \n---------------------------\n' + cerere + '\n---------------------------')
        pozitie = cerere.find('\r\n') 
        if (pozitie > -1): 
            linieDeStart = cerere[0:pozitie] 
            print('S-a citit linia de start din cerere: ##### ' + linieDeStart + ' #####')
            break 
    print('S-a terminat citirea.')
    
    # extrage resursa ceruta
    parts = linieDeStart.split()
    if len(parts) > 1:
        resource = parts[1]
    else:
        resource = "/"
        
    # raspunde cu Hello World si numele resursei
    response_body = f"Hello World! - {resource}"
    response = "HTTP/1.1 200 OK\r\n" \
                "Content-Type: text/plain\r\n" \
                f"Content-Length: {len(response_body)}\r\n" \
                "Connection: close\r\n\r\n" + response_body
        
    clientsocket.sendall(response.encode())
    clientsocket.close()
