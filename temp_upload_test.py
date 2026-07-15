import uuid
import urllib.request

boundary = '----WebKitFormBoundary' + uuid.uuid4().hex
body = []

def add_field(name, value):
    body.append(f'--{boundary}\r\n'.encode())
    body.append(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode())
    body.append(str(value).encode())
    body.append(b'\r\n')

def add_file(name, filename, content):
    body.append(f'--{boundary}\r\n'.encode())
    body.append(f'Content-Disposition: form-data; name="{name}"; filename="{filename}"\r\n'.encode())
    body.append(b'Content-Type: application/pdf\r\n\r\n')
    body.append(content)
    body.append(b'\r\n')

add_file('file', 'test.pdf', b'%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF')
add_field('patient_name', 'Test Patient')
add_field('patient_initials', 'TP')
add_field('sensitivity', 'Normal')
add_field('department', 'Radiology')
add_field('author', 'Local Test')
add_field('record_id', 'verification-test')
body.append(f'--{boundary}--\r\n'.encode())
payload = b''.join(body)

req = urllib.request.Request('http://127.0.0.1:8000/api/records/upload', data=payload, method='POST')
req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
try:
    with urllib.request.urlopen(req, timeout=60) as resp:
        print(resp.status)
        print(resp.read().decode())
except Exception as exc:
    print(type(exc).__name__, exc)
    if hasattr(exc, 'read'):
        print(exc.read().decode())
