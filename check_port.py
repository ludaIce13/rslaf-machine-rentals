import socket

def check_port(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def main():
    port = 8000
    if check_port(port):
        print(f"Port {port} is in use. The backend server might be running.")
    else:
        print(f"Port {port} is not in use. The backend server is not running.")

if __name__ == "__main__":
    main()
    input("\nPress Enter to exit...")
