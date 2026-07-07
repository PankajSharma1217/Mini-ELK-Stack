import time
import random
import datetime

# Mock log levels and messages
LEVELS = ["INFO", "WARN", "ERROR"]
MESSAGES = {
    "INFO": ["User logged in", "Page rendered", "Data fetched", "Session started"],
    "WARN": ["High memory usage detected", "Slow database query", "API rate limit approaching"],
    "ERROR": ["Auth failed for user", "Database connection lost", "Null pointer exception", "Failed to parse JSON"]
}

LOG_FILE = "app.log"

def generate_log():
    level = random.choice(LEVELS)
    message = random.choice(MESSAGES[level])
    user_id = random.randint(1, 1000)
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    return f"[{timestamp}] {level}: {message} user_id {user_id}\n"

if __name__ == "__main__":
    print(f"Starting log generation into {LOG_FILE}...")
    with open(LOG_FILE, "a") as f:
        pass # create if not exists
        
    while True:
        with open(LOG_FILE, "a") as f:
            log_line = generate_log()
            f.write(log_line)
            f.flush()
        time.sleep(random.uniform(0.5, 3.0))
