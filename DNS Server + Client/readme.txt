# Makar Baranov 
# ID:5319040
# Fall 2017 CSci4211: Introduction to Computer Networks
# This program serves as the server of DNS query.
# Written in Python v3.

# To compile and run DNSClientV3.py
# - $ python DNSClientV3.py

# To compile and run DNSServerV3.py
# - $ python DNSServerV3.py

# - - - Brief description of the program - - -
# Firstly, the server program creates a TCP socket and binds it to
# a specific port defined in the port variable. Then it listens on that socket
# for any incoming connecting (max 20) and creates another thread for managing 
# server shutdown. The server keeps running in infinite loop trying to accept 
# possible incoming queries, and if it receives one, a thread is created to 
# manage the query. The query is cached on local DNS in case it doesn't reside
# in DNS_Mapping.txt file. It reduces delay if some user requests a resolution for
# the query that has already been requested in the past because the server doesn't need 
# to ask ROOT DNS for resolution help.
# The server needs multiple sockets, one is a "Welcoming socket" to perform a three-way
# handshake between client and the server to setup a connection and, if the setup is 
# successful, it would result in another socket being created on the server side to perform 
# the information exchange between the two entities. 
# Threading is used for handling multiple clients: when the client appears, we create a thread
# to resolve a query for him. Being done with the query, the thread finishes and makes the used 
# socket free.