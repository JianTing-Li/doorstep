import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import os

PORT = 8081
SERPAPI_KEY = "YOUR_API_KEY_HERE" # Replace with your actual SerpApi key!

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # 1. Custom API Route
        if self.path.startswith('/api/events'):
            if SERPAPI_KEY == "YOUR_API_KEY_HERE":
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing SerpApi Key in server.py"}).encode())
                return

            try:
                # Query SerpApi for Google Events in New York
                url = f"https://serpapi.com/search.json?engine=google_events&q=Events&location=New+York&api_key={SERPAPI_KEY}"
                
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as response:
                    data = json.loads(response.read().decode())
                
                # Send the response back to the frontend
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(data).encode())
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
            return
            
        # 2. Serve regular static files (HTML/CSS/JS)
        return super().do_GET()

# Ensure we are serving files from the correct directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), ProxyHandler) as httpd:
    print(f"Server started at http://localhost:{PORT}")
    print("Serving static files and proxying /api/events to SerpApi...")
    httpd.serve_forever()
