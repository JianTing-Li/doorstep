import re
with open('app.js', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\\`', '`').replace('\\${', '${')
with open('app.js', 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed app.js')
