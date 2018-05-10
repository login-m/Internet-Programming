# Fall 2017 CSci4211: Introduction to Computer Networks
# This program serves as the server of DNS query.
# Written in Python v3.

import sys, threading, os
from socket import *

def main():
    host = "localhost" # query. It can be changed to anything you desire.
    port = 5001 # Port number.

    #create a socket object, SOCK_STREAM for TCP
    serverSocket = socket(AF_INET,SOCK_STREAM)

    #bind socket to the current address on port 5001
    serverSocket.bind(('',port))

    #Listen on the given socket maximum number of connections queued is 20
    serverSocket.listen(20)

    monitor = threading.Thread(target=monitorQuit, args=[])
    monitor.start()

    print("Server is listening...")

    while 1:
        #blocked until a remote machine connects to the local port 5001
        connectionSock, addr = serverSocket.accept()
        server = threading.Thread(target=dnsQuery, args=[connectionSock, addr[0]])
        server.start()

def dnsQuery(connectionSock, srcAddress):
    #check the DNS_mapping.txt to see if the host name exists

    #set local file cache to predetermined file.
    invalid_chars=";", "/" , "?" , ":" , "@" , "&" , "=" , "+" , "$" , ",";
    cache_filename="DNS_Mapping.txt"
    not_found = "Host not found\n" 


    #open/create file if it doesn't exist
    file = open(cache_filename,'a+')
    file.seek(0)

    #read the file line by line to look for a
    #match with the query sent from the client
    found = False
    query_legit = True
    query = connectionSock.recv(1024).decode()
    query=query.lower()

    # Check for invalid symbols
    for c in query:
        for symbol in invalid_chars:
            if c == symbol:
                query_legit = False

    if (query_legit):
        for line in file:
            x=line.split(':')[0]
            if query == x:
                resolution="Local DNS:" + line
                found = True
                break

        #if match not found
        if not (found):
        	try:
        		IP=gethostbyname(query)
        		file.write(query + ":" + IP + "\n")
        		resolution="Root DNS:" + query + ":" + IP + "\n"
        	except error as msg:
        		file.write(query + ":" + not_found)
        		resolution=not_found
    else :
        resolution=not_found

    #print response to the terminal
    print(resolution)

    #send the response back to the client
    connectionSock.send(resolution.encode())
    #close the server socket.
    connectionSock.close()


def monitorQuit():
    while 1:
        sentence = input()
        if sentence == "exit":
            os.kill(os.getpid(),9)

main()
