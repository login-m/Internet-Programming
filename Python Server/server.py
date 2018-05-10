#!/usr/bin/env python3
# See https://docs.python.org/3.2/library/socket.html
# for a decscription of python socket and its parameters

# My comments:
# 1. Chose calendar.html
# 2. Used same name fields and was told that parsing on equal sign
#    is enough, no need to make the page look exactly as a provided example
import socket
import os
import sys
import datetime

from stat import *
from threading import Thread
from argparse import ArgumentParser


BUFSIZE = 4096
METHODS = ["HEAD", "GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"]
op_server = "OPTIONS,GET,HEAD,POST,PUT,DELETE"
op_calendar = "OPTIONS,GET,HEAD"
op_form = "OPTIONS,GET,HEAD,POST"
op_private = "OPTIONS"
redirect_list = "csumn"

# Helper Functions
def append_body(reply,path):
  file = open(path,'r')
  for i in file:
    reply+=i
  return reply

def check_exist(method,request,body):

  if (redirect_list in request):
    return prepare_301()
  if method not in METHODS:
    return prepare_405()
  path = request[1:]
  if path == "" and method == "OPTIONS":
    return prepare_200(method,path,body)
  if os.path.exists(path):
    permissions = oct(os.stat(path)[ST_MODE])
    permissions = permissions[6:]
    if (((method == "PUT" or method == "DELETE") and permissions < "6") or permissions < "4"):
      return prepare_403()
    #if (file extension not in cur_Accept): 
      #prepare_406()
    return prepare_200(method,path,body)
  elif (method == "PUT" or method == "POST"):
    return prepare_200(method,path,body)
  return prepare_404()
  

def prepare_403():
  reply = "HTTP/1.1 403 Forbidden\n\n"
  return append_body(reply,"403.html")

def prepare_404():
  reply = "HTTP/1.1 404 Not Found\n\n"
  return append_body(reply,"404.html")

def prepare_405():
  reply = "HTTP/1.1 405 Method Not Allowed\n\n"
  return reply

def prepare_406():
  reply = "HTTP/1.1 406 Not Acceptable\n\n"
  return reply

def prepare_301():
  reply = "HTTP/1.1 301 Moved Permanently\n" \
        + "Location: https://www.cs.umn.edu\n" \
        + "Connection: close\n" \
        + "Content-Length: 0\n\n"
  return reply

def prepare_200(method,request,body):

  # Header variables
  i = datetime.datetime.now()

  # HEAD Method
  if method=="HEAD":
    reply = "HTTP/1.1 200 OK\n" \
          + "Connection: close\n" \
          + "Content-Type: text/html\n" \
          + "Date: %s\n\n" % i.isoformat()
    return reply

  # GET Method
  if method=="GET":
    reply = "HTTP/1.1 200 OK\n" \
          + "Connection: close\n" \
          + "Content-Type: text/html\n" \
          + "Date: %s\n\n" % i.isoformat()
    return append_body(reply,request)

  # PUT Method
  if method == "PUT":
    if os.path.exists(request):
      reply = "HTTP/1.1 200 OK\n"
    else:
      reply = "HTTP/1.1 201 Created\n"
    reply += "Content-Location: /" + request + "\n"
    reply += "Date: %s\n\n" % i.isoformat()
    file = open(request,'w')
    file.write(body)
    file.close()
    os.chmod(request, 0o646)
    return reply

  # DELETE Method
  if method == "DELETE":
    reply = "HTTP/1.1 200 OK\n" \
          + "Date: %s\n\n" % i.isoformat()
    os.remove(request)
    return reply

  # OPTIONS Method
  if method == "OPTIONS":
    reply = "HTTP/1.1 200 OK\n"
    if request == "":
      reply+= "Allow: " + op_server + "\n"
    elif request == "calendar.html":
      reply+= "Allow: " + op_calendar + "\n"
    elif request == "form.html":
      reply+= "Allow: " + op_form + "\n"
    elif request == "private.html":
      reply+= "Allow: " + op_private + "\n"
    reply += "Date: %s\n\n" % i.isoformat()
    return reply

  # POST Method
  if method == "POST":
    reply = "HTTP/1.1 200 OK\n" \
          + "Date: %s\n\n" % i.isoformat()

    temp = "Following Form Data Submitted Successfully\n\n" + body
    body = temp
    body = body.replace("%40"," ")
    body = body.replace("+", " ")
    body = body.replace("%3A=", ": ")
    body = body.replace("%3A", ":")
    body = body.replace("&","\n\n")
    body = body.replace("%2F", "/")
    body = body.replace("%2C", ",")
    reply += body
    return reply


def client_talk(client_sock, client_addr):
    print('talking to {}'.format(client_addr))

    # Change maybe to previous version
    data = client_sock.recv(BUFSIZE)
    data = data.decode('utf-8')

    # Print request to a console and get body
    body_flag = False
    body = ""
    for line in data.splitlines():
      print(line)
      if body_flag:
        body+=line
      if len(line.strip()) == 0 :
        body_flag=True

    # Get first line of HTTP request
    method_list= (data.split('\n',1)[0]).split()
    if method_list:     
      method = method_list[0];
      request = method_list[1];
      protocol = method_list[2];

      # Assemble response
      response = check_exist(method,request,body)

      # Print response
      #for line in response.splitlines():
      #  print(line)

      # Send response
      client_sock.send(bytes(response.encode('utf-8')))
    
    # Clean up
    client_sock.shutdown(1)
    client_sock.close()
    print('connection closed.')

class EchoServer:
  def __init__(self, host, port):
    print('listening on port {}'.format(port))
    self.host = host
    self.port = port
    self.setup_socket()
    self.accept()
    self.sock.shutdown()
    self.sock.close()

  def setup_socket(self):
    self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    self.sock.bind((self.host, self.port))
    self.sock.listen(128)

  def accept(self):
    while True:
      (client, address) = self.sock.accept()
      th = Thread(target=client_talk, args=(client, address))
      th.start()

def parse_args():
  parser = ArgumentParser()
  parser.add_argument('--host', type=str, default='localhost',
                      help='specify a host to operate on (default: localhost)')
  parser.add_argument('-p', '--port', type=int, default=9001,
                      help='specify a port to operate on (default: 9001)')
  args = parser.parse_args()
  return (args.host, args.port)


if __name__ == '__main__':
  (host, port) = parse_args()
  EchoServer(host, port)

