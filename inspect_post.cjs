const http = require('http');

http.get('http://localhost:5000/api/marketplace/rideshare', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        const json = JSON.parse(data);
        if (json.length > 0) {
            console.log(JSON.stringify(json[0], null, 2));
        } else {
            console.log('No posts found');
        }
    });
});
