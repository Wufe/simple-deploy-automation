import credentials from './ssh.env';
import ssh from 'simple-ssh';
import Q from 'q';

export default (server, commands) => {
    if( server.constructor !== Array ){
        server = [ server ];
    }
    if( commands.constructor !== Array ){
        commands = [ commands ];
    }
    let servers = [];
    for( let i = 0; i < server.length; i++ ){
        if( credentials[server[i]] !== undefined ){
            let cred = credentials[server[i]];
            cred.name = server[i];
            servers.push( cred );
        }
    }
    let promises = [];
    for( let i = 0; i < servers.length; i++ ){
        server = servers[i];
        let {host, user, pass} = server;
        if( host === undefined || user === undefined || pass === undefined ){
            console.log( "Cannot connect to server. I need all details (host,user,pass)." );
        }else{
            let connection = new ssh({
                host,
                user,
                pass
            });
            connection.on( 'error', ( e ) => {
                console.log( 'Error', e );
            })
            for( let a = 0; a < commands.length; a++ ){
                let command = commands[a];
                let deferred = Q.defer();
                let out = "";
                let err = "";
                connection = connection.exec( command, {
                    out: ( stdout ) => {
                        out += stdout;
                    },
                    err: ( stderr ) => {
                        err += stderr;
                    },
                    exit: () => {
                        if( out )
                            deferred.resolve({ server: server.name, command: command, stdout: out });
                        if( err )
                            deferred.reject({ server: server.name, command: command, stderr: err });
                    }
                });

                promises.push(deferred.promise);
            }
            connection.start();
        }
    }
    return promises;
};
