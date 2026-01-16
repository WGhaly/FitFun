#!/usr/bin/env python3
"""
Simple HTTP server for FitFun development
Run this script to test the application locally
"""

import http.server
import socketserver
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"""
╔══════════════════════════════════════════════════════════╗
║                    FitFun Dev Server                     ║
╠══════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:{PORT}              ║
║                                                          ║
║  Press Ctrl+C to stop the server                        ║
╚══════════════════════════════════════════════════════════╝

Demo Credentials:
  User:  john@example.com / Password123!
  Admin: admin@fitfun.com / Admin123!
        """)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServer stopped.")
