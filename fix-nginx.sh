#!/bin/bash
# Quick fix for nginx config

cat > /etc/nginx/sites-available/default << 'EOFCONFIG'
server {
    listen 80;
    server_name www.ridexmw.com ridexmw.com;
    
   root /var/www/rideweb/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOFCONFIG

nginx -t && systemctl reload nginx
echo "Nginx configured and reloaded!"
