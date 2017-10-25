(function(){
    var element = function(id){
        return document.getElementById(id);
    }

    var status = element('status');
    var messages = element('messages');
    var textarea = element('textarea');
    var username = element('username');
    var clearBtn = element('clear');

    var statusDefault = '';

    var setStatus = function(s){
        status.textContent = s;

        if(s!==statusDefault){
            console.log('Message will dissapear!')
            var delay = setTimeout(function(){
                setStatus('');
            },4000);
        }
    }

    var socket = io.connect('http://127.0.0.1:4200');

    if(socket !== undefined){
        console.log('Connected to socket...');

        socket.on('output',function(data){
            console.log(data);
            if(data.length){
                for(var x = data.length-1; x >= 0;x--){
                    var message = document.createElement('div');
                    message.setAttribute('class','chat-message');
                    message.textContent = data[x].name +': '+data[x].message;
                    messages.appendChild(message);
                    messages.insertBefore(message,messages.firstChild);
                }
            }
        });
        socket.on('status',function(data){
            setStatus((typeof data === 'object')? data.message:data);

            if(data.clear){
                textarea.value = '';
            }
        });

        textarea.addEventListener('keydown',function(event){
            if(event.which===13){
                socket.emit('input',{
                    name: username.value,
                    message: textarea.value
                });
                event.preventDefault();
            }
            else{
                socket.emit('typing', username.value);
            }
        });
         clearBtn.addEventListener('click', function(){
             socket.emit('clear');
         });

         socket.on('typing', function(data){
            setStatus(data+' is typing...');
         });

         socket.on('cleared',function(){
             messages.textContent='';
         });
    }
})();