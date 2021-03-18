const express = require('express');
const socket = require('socket.io');
// const server=require('http').createServer(app);
// io.listen(server);
const app = express();
const users = {};
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(':::Server is UP & running successfully:::')
  console.log(`:::http://localhost:${port}:::`)
});
const io = socket(server)

app.use(express.static(__dirname + '/public'));
app.set('view engine','ejs');

app.get('/',function(req,res){
     res.render('index');
});

io.on('connection',function(socket){

      console.log("A New Connection Established");

      socket.on('new user',function(data,callback){
        if(data in users){
          console.log("Username already taken");
          callback(false);
        }else{
          console.log("Username available");
          callback(true);
          socket.nickname=data;
          users[socket.nickname]=socket;
          updateNicknames();
         console.log(users);
        }
      });


      function updateNicknames(){
        io.emit('usernames',Object.keys(users));
      }


      socket.on('send message',function(data,callback){
        var msg=data.trim();
        //  console.log(msg,data);
        if(msg.substr(0,1) === '@'){
          msg=msg.substr(1);
          var ind=msg.indexOf(' ');
          if(ind !== -1){
            var name=msg.substring(0,ind);
            var msg=msg.substring(ind+1);
             if(name in users){
                users[name].emit('whisper',{msg:msg,nick:socket.nickname});
                console.log(socket.nickname,":",msg);
                socket.emit('private',{msg:msg,nick:name});
              }else{
              callback("Sorry, "+name+" is not online");
            }
          }else{
            callback("you forgot to write the message");
          }
        }

         else{
        //  console.log("Got Message :"+data)
        console.log(msg,socket.nickname);
         io.sockets.emit('new message',{msg:msg,nick:socket.nickname});
           }
      });


      socket.on('disconnect',function(data){
            if(!socket.nickname) return;
            delete users[socket.nickname];
            updateNicknames();
      });
    //  socket.on('mssgprivate',function(data){
        
    //  })

});
