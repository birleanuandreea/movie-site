import socket
import os # pentru dimensiunea fisierului
import gzip
import threading
import json


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
        print('S-a terminat cititrea.')
        if linieDeStart == '':
            clientsocket.close()
            print('S-a terminat comunicarea cu clientul - nu s-a primit niciun mesaj.')
            return

        # interpretarea sirului de caractere `linieDeStart`
        elementeLineDeStart = linieDeStart.split()
        tipCerere = elementeLineDeStart[0]
        numeResursaCeruta = elementeLineDeStart[1]

        if tipCerere == 'GET':
            if numeResursaCeruta == '/':
                numeResursaCeruta = '/index.html'

            # calea este relativa la directorul de unde a fost executat scriptul
            numeFisier = '../continut' + numeResursaCeruta

            fisier = None
            try:
                # deschide fisierul pentru citire in mod binar
                fisier = open(numeFisier, 'rb')
                buf = fisier.read()
                compressed_buf = gzip.compress(buf)

                # tip media
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

                # se trimite raspunsul
                clientsocket.sendall(b'HTTP/1.1 200 OK\r\n')
                clientsocket.sendall(('Content-Length: ' + str(len(compressed_buf)) + '\r\n').encode())
                clientsocket.sendall(('Content-Type: ' + tipMedia + '\r\n').encode())
                clientsocket.sendall(b'Server: My PW Server\r\n')
                clientsocket.sendall(b'Content-Encoding: gzip\r\n')
                clientsocket.sendall(b'\r\n')
                clientsocket.sendall(compressed_buf)
            except IOError:
                # daca fisierul nu exista trebuie trimis un mesaj de 404 Not Found
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
        
        elif tipCerere == 'POST' and numeResursaCeruta == '/api/utilizatori':
            content_length_start = cerere.find('Content-Length: ')
            content_length_end = cerere.find('\r\n', content_length_start)
            content_length = int(cerere[content_length_start + 16:content_length_end])
                
            # incepe body-ul cererii (dupa \r\n\r\n)
            body_start = cerere.find('\r\n\r\n') + 4
            request_body = cerere[body_start:body_start + content_length]

            try:
                user_data = json.loads(request_body)
                    
                json_file_path = '../continut/resurse/utilizatori.json'
                users = []
                    
                if os.path.exists(json_file_path):
                    with open(json_file_path, 'r') as f:
                        try:
                            users = json.load(f)
                        except json.JSONDecodeError:
                            users = []
                    
                
                users.append(user_data)
                    
                
                with open(json_file_path, 'w') as f:
                    json.dump(users, f, indent=4)
                    
                
                response = "Utilizator înregistrat cu succes!"
                clientsocket.sendall(b'HTTP/1.1 200 OK\r\n')
                clientsocket.sendall(('Content-Length: ' + str(len(response)) + '\r\n').encode())
                clientsocket.sendall(b'Content-Type: text/plain; charset=utf-8\r\n')
                clientsocket.sendall(b'Server: My PW Server\r\n')
                clientsocket.sendall(b'\r\n')
                clientsocket.sendall(response.encode())
                    
            except json.JSONDecodeError as e:
                    # Eroare la parsarea JSON
                error_msg = f"Eroare la parsarea JSON: {str(e)}"
                clientsocket.sendall(b'HTTP/1.1 400 Bad Request\r\n')
                clientsocket.sendall(('Content-Length: ' + str(len(error_msg)) + '\r\n').encode())
                clientsocket.sendall(b'Content-Type: text/plain; charset=utf-8\r\n')
                clientsocket.sendall(b'Server: My PW Server\r\n')
                clientsocket.sendall(b'\r\n')
                clientsocket.sendall(error_msg.encode())
                
            except Exception as e:
                    # Alte erori
                error_msg = f"Eroare la procesarea cererii: {str(e)}"
                clientsocket.sendall(b'HTTP/1.1 500 Internal Server Error\r\n')
                clientsocket.sendall(('Content-Length: ' + str(len(error_msg)) + '\r\n').encode())
                clientsocket.sendall(b'Content-Type: text/plain; charset=utf-8\r\n')
                clientsocket.sendall(b'Server: My PW Server\r\n')
                clientsocket.sendall(b'\r\n')
                clientsocket.sendall(error_msg.encode())

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