import socket
import os
import json
import threading
from urllib.parse import parse_qs

# salveaza datele unui utilizator intr-un fisier JSON
def save_user(user_data):
    users_file_path = '../continut/resurse/utilizatori.json'
    
    # incarca utilizatorii existenti
    existing_users = []
    if os.path.exists(users_file_path):
        try:
            with open(users_file_path, 'r', encoding="utf-8") as f:
                existing_users = json.load(f)
        except json.JSONDecodeError:
            # daca exista dar nu are format JSON valid => o lista goala
            existing_users = []

    existing_users.append(user_data)
    
    # Create directories if they don't exist
    # os.makedirs(os.path.dirname(users_file_path), exist_ok=True)
    
    with open(users_file_path, 'w', encoding="utf-8") as f:
        json.dump(existing_users, f, indent=4, ensure_ascii=False)
    
    return True

def inregistrare_client(clientsocket, address):
    print('S-a conectat un client.')
    try:
        # se proceseaza cererea si se citeste prima linie de text
        cerere = ''
        linieDeStart = ''
        while True:
            buf = clientsocket.recv(1024)
            if len(buf) < 1:
                break
            cerere = cerere + buf.decode()
            print('S-a citit mesajul: \n---------------------------\n' + cerere + '\n---------------------------')
            pozitie = cerere.find('\r\n')
            if pozitie > -1 and linieDeStart == '':
                linieDeStart = cerere[0:pozitie]
                print('S-a citit linia de start din cerere: ##### ' + linieDeStart + ' #####')
                break
        print('S-a terminat citirea.')
        if linieDeStart == '':
            clientsocket.close()
            print('S-a terminat comunicarea cu clientul - nu s-a primit niciun mesaj.')
            return

        # interpretarea sirului de caractere `linieDeStart`
        elementeLineDeStart = linieDeStart.split()
        tipCerere = elementeLineDeStart[0]
        numeResursaCeruta = elementeLineDeStart[1]

        # Tratarea cererii GET
        if tipCerere == 'GET':
            if numeResursaCeruta == '/':
                numeResursaCeruta = '/inregistreaza.html'

            numeFisier = '../continut' + numeResursaCeruta

            fisier = None
            try:
                fisier = open(numeFisier, 'rb')
                buf = fisier.read()

                numeExtensie = numeFisier[numeFisier.rfind('.') + 1:]
                tipuriMedia = {
                    'html': 'text/html; charset=utf-8',
                    'css': 'text/css; charset=utf-8',
                    'js': 'text/javascript; charset=utf-8',
                    'png': 'image/png',
                    'jpg': 'image/jpeg',
                    'jpeg': 'image/jpeg',
                    'gif': 'image/gif',
                    'ico': 'image/x-icon',
                    'xml': 'application/xml; charset=utf-8',
                    'json': 'application/json; charset=utf-8'
                }
                tipMedia = tipuriMedia.get(numeExtensie, 'text/plain; charset=utf-8')

                clientsocket.sendall(b'HTTP/1.1 200 OK\r\n')
                clientsocket.sendall(('Content-Length: ' + str(len(buf)) + '\r\n').encode())
                clientsocket.sendall(('Content-Type: ' + tipMedia + '\r\n').encode())
                clientsocket.sendall(b'Server: My PW Server\r\n')
                clientsocket.sendall(b'\r\n')
                clientsocket.sendall(buf)
            except IOError:
                msg = 'Eroare! Resursa ceruta ' + numeResursaCeruta + ' nu a putut fi gasita!'
                print(msg)
                clientsocket.sendall(b'HTTP/1.1 404 Not Found\r\n')
                clientsocket.sendall(('Content-Length: ' + str(len(msg.encode('utf-8'))) + '\r\n').encode())
                clientsocket.sendall(b'Content-Type: text/plain; charset=utf-8\r\n')
                clientsocket.sendall(b'Server: My PW Server\r\n')
                clientsocket.sendall(b'\r\n')
                clientsocket.sendall(msg.encode())
            finally:
                if fisier is not None:
                    fisier.close()

        # Tratarea cererii POST pentru /api/utilizatori
        if numeResursaCeruta == '/api/utilizatori' and tipCerere == 'POST':
            while '\r\n\r\n' not in cerere:
                buf = clientsocket.recv(1024)
                if not buf:
                    break
                cerere += buf.decode()

            headers, body = cerere.split('\r\n\r\n', 1)

            content_length = 0
            for header in headers.split('\r\n'):
                if header.lower().startswith('content-length:'):
                    content_length = int(header.split(':', 1)[1].strip())
                    break

            while len(body.encode('utf-8')) < content_length:
                more = clientsocket.recv(1024)
                if not more:
                    break
                body += more.decode()

            try:
                form_data = parse_qs(body)
                user_data = {k: v[0] for k, v in form_data.items()}

                success = save_user(user_data)

                if success:
                    response = 'HTTP/1.1 303 See Other\r\nLocation: /index.html\r\n\r\n'
                else:
                    response = 'HTTP/1.1 400 Bad Request\r\nContent-Type: application/json\r\n\r\n' \
                               '{"status": "error", "message": "Error saving user data"}\r\n'
                clientsocket.sendall(response.encode('utf-8'))
            except json.JSONDecodeError:
                # date invalide
                response = 'HTTP/1.1 400 Bad Request\r\nContent-Type: application/json\r\n\r\n' \
                           '{"status": "error", "message": "Invalid JSON data"}\r\n'
                clientsocket.sendall(response.encode('utf-8'))

    finally:
        clientsocket.close()
        print('S-a terminat comunicarea cu clientul.')

# creeaza un server socket
serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# specifica ca serverul va rula pe portul 5678, accesibil de pe orice ip al serverului
serversocket.bind(('', 5678))
# serverul poate accepta conexiuni; specifica cati clienti pot astepta la coada
serversocket.listen(5)

print('#########################################################################')
print('Serverul asculta potentiali clienti.')
# asteapta conectarea unui client la server
while True:
    # metoda `accept` este blocanta => clientsocket, care reprezinta socket-ul corespunzator clientului conectat
    (clientsocket, address) = serversocket.accept()
    client = threading.Thread(target=inregistrare_client, args=(clientsocket, address))
    client.start()
