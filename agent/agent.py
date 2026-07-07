import time
import socket
import os

LOG_FILE = "app.log"
UDP_IP = "127.0.0.1"
UDP_PORT = 5005

def follow(thefile):
    # Seek to the end of the file
    thefile.seek(0, os.SEEK_END)
    while True:
        line = thefile.readline()
        if not line:
            time.sleep(0.1)
            continue
        yield line

if __name__ == "__main__":
    print(f"Agent starting. Monitoring {LOG_FILE} and sending to UDP {UDP_IP}:{UDP_PORT}...")
    
    # Ensure file exists
    if not os.path.exists(LOG_FILE):
        open(LOG_FILE, 'a').close()
        
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    
    with open(LOG_FILE, "r") as log_file:
        log_lines = follow(log_file)
        for line in log_lines:
            # Send via UDP. Fire and forget!
            sock.sendto(line.encode('utf-8'), (UDP_IP, UDP_PORT))
            print(f"Sent: {line.strip()}")
