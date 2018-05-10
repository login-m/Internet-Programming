import hashlib
import select, time
import sys, threading, os
import random
from socket import *


def main():
  if (len(sys.argv) == 4):
    client_mode(sys.argv[1],sys.argv[2],sys.argv[3])
  else:
    server_mode(sys.argv[1],sys.argv[2])


def client_mode(host,port,filename):
 
	# Setup connection
  try:
    cSock = socket(AF_INET, SOCK_STREAM)
  except error as msg:
    cSock = None
    print(msg)
  try:
    cSock.connect(("localhost", int(port)))
  except error as msg:
    cSock = None
    print(msg)
  if cSock is None:
    print("Error: cannot open socket")
    sys.exit(1) # If the socket cannot be opened, quit the program.
  timeOut = 10


  # ! Try to make the packet and send it over without the network 512 byte ... ! #		

	# Prepare packet
  seq_num=100;
  last_flag = 0

	# Open the file
  file = open(filename,'r+')

	
  while True:
    data_size = 512-40-3-1-20
    data_size = data_size - int(len(str(data_size)))
    payload = file.read(data_size)
    while (len(payload) < data_size):
      payload+="#"
      last_flag=1
    while(len(filename) < 20):
      filename+="#"
      
    hash_str = filename + payload
    hash_object = hashlib.sha1(hash_str.encode())
    hex_dig = hash_object.hexdigest()

    packet = str(seq_num) + str(last_flag) + str(data_size) + str(hex_dig) + filename + payload #+ filename
    not_sent = True

    while(not_sent):
      cSock.send(packet.encode())
      ready = select.select([cSock], [], [], timeOut) 
      if ready[0]:
        ACK_packet = cSock.recv(512).decode()
        try:
          ACK_seq_num = int(ACK_packet[0:3])
        except ValueError:
          print("Packet is corrupted! Discarding and retransmitting...")
          continue

        if (ACK_seq_num == seq_num):
          if (last_flag != 1):
            print("received ACK. Preparing next packet...")
          not_sent = False
          seq_num=seq_num+1
          if (seq_num > 127):
            seq_num=1
        else:
          print("ACK_SEQ_NUM is not the one expected. Retransmitting...") 
      else:
        print("Timeout! Retransmitting...")

    if (last_flag == 1):
      print("Received ACK. End of file. Terminating...")
      cSock.close()
      file.close()
      break

	

def server_mode(host, port):

  #ack_num
  ack_num = 99 

  #create a socket object, SOCK_STREAM for TCP
  serverSocket = socket(AF_INET,SOCK_STREAM)
  serverSocket.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)

	#bind socket to the current address on port 5001
  serverSocket.bind(('',int(port)))

	#Listen on the given socket maximum number of connections queued is 20
  serverSocket.listen(20)

  print("Server is listening...")

  #blocked until a remote machine connects to the local port 5001
  connectionSock, addr = serverSocket.accept()
  timeOut=60

	# Read the packet
  while True:
    ready = select.select([connectionSock], [], [], timeOut) 
    if ready[0]:
      packet = connectionSock.recv(512).decode()
      if(len(packet) < 512):
        break;
    
		  # Split the packet
      try:
        seq_num = int(packet[0:3])
        last_flag = int(packet[3:4])
        data_size = int(packet[4:7])
      except ValueError:
        print("Packet is corrupted! Discarding...")
        continue
      packet_hex_dig = packet[7:47]
      hash_str = packet[47:]
      filename = packet[47:67]
      payload = packet[67:]  

		  # Perform checksum
      hash_object = hashlib.sha1(hash_str)
      hex_dig = hash_object.hexdigest()


      # Checksum OK
      if (hex_dig == packet_hex_dig):
        if (seq_num == ack_num + 1):
          ack_num=seq_num
          if (last_flag == 1):
            payload=payload.rstrip('#')
          filename=filename.rstrip('#')
          file = open(filename,'a+')
          file.seek(0) 
          file.write(payload)
          print("Payload #" + str(seq_num) + ": " + payload)
        elif (seq_num < ack_num + 1):
          print("This packet has already been received.")
        else:
          print("This packet is not the one the server expects next. Discard.")

        print("Transmitting ACK...\n")
        ACK_packet = str(ack_num) + "#" * 509
        connectionSock.send(ACK_packet)
      else:
        print("Checksum failed!")
    
    else:
      print("TimeOut! No packets received, closing connection...")
      connectionSock.close()
      file.close()
      break

main()

			
