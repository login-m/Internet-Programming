# Makar Baranov 
# ID:5319040
# Fall 2017 CSci4211: Introduction to Computer Networks
# This program serves as a server and client for ASCII file transferring
# Written in Python v3.

# To compile and run as a Server 
# - $ python program.py <hostname> <port_num>

# To compile and run as a Client
# - $ python program.py <hostname> <port_num> <file_name>

# - - - Brief description of the program - - -
# Server: Firstly, the server program creates a TCP socket and binds it to
# a specific port passed as an argument. Then it listens on that socket
# for any incoming connections. Once the connection is established, it waits
# for the packets. Having received a packet, it parses the packet and checks
# if the checksum matches. If it doesn't, server doesn't do anything. If it does,
# check that the packet is the one that the server waits (by comparing ack_num and seq_num).
# If it does, write the payload to the file, otherwise send the last successful ACK packet to the client.
# If no packets received for 60 seconds, the connection terminates and safely closes the socket and the file
# (os may hold the payload in the buffer and only write it when the server closes the file, which is after timeout time = 60)

# Client: Firstly, the client program creates a TCP socket and bits it to
# a specific port passed as an argument. Then it tries to connect and if sucessful,
# start the whole transmission process. It includes assembling the packets, sending/retransmitting the packets
# and receiving the ACK for packets that the server has processed. If ACK is not received in 10 seconds, the 
# timeout event is triggered and client resends the packet. If ACK is received but packet's ack_num is not the one
# expected, the client retransmits the initial packet. If ACK matches SEQ, the clients tries to send the next packet.
# When the client receives the ACK for the last packet, it closes the connection.

# Package Structure: I decided to construct my packet as follows:
# [0:3) = sequence number
# [3:4) = flag that indicates the packet is the last
# [4:7) = the size of payload
# [7:47) = checksum hex
# [47:67) = file name
# [67:512] = payload data

# What I've learned: I had a lot of fun doing this project. Since no initial code was provided, I had to think carefully
# about the design. I also learned that I had to handle ValueError exceptions when converting so my program doesn't crash.
# Playing with the unstable network provided to us, I learned how delays may affect the transmission and had to cope with it.

# Additional Info: Since we were not allowed to modify networkLayer in any way, I couldn't find a way to terminate it gracefully.
# Also, the program doesn't use any multithreading so it assumes only 1 file will be transferred during its runtime after which it
# shutdowns.
