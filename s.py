import time
import requests

# URL of your Azure-hosted site
url = "https://www.floand-go.com"

# Ping every 15 minutes
interval_minutes = 15

while True:
    try:
        response = requests.get(url)
        print(f"Pinged {url} - Status code: {response.status_code}")
    except Exception as e:
        print(f"Error pinging site: {e}")
    
    time.sleep(interval_minutes * 60)
