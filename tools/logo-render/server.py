"""Tiny dev server: serves this folder and saves POSTed PNGs into public/brand/poses."""
import http.server, os, base64, json
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../public/brand/poses"))
class H(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        name = os.path.basename(body["name"])
        with open(os.path.join(OUT, name), "wb") as f:
            f.write(base64.b64decode(body["data"].split(",", 1)[1]))
        self.send_response(200); self.send_header("Access-Control-Allow-Origin", "*"); self.end_headers()
os.chdir(os.path.dirname(__file__))
http.server.ThreadingHTTPServer(("127.0.0.1", 8765), H).serve_forever()
