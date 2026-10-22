// Development preview only; the delivered game needs no server.
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const base=path.resolve(process.argv[2]||'.');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json; charset=utf-8'};
http.createServer((req,res)=>{
 let file;
 try{file=path.resolve(base,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400);res.end();return;}
 if(file!==base&&!file.startsWith(base+path.sep)){res.writeHead(403);res.end();return;}
 if(file===base)file=path.join(base,'index.html');
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);});
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
