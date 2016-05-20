import env from './env';
import Exec from '../Exec';

Exec( env.server, env.commands )
.map((p) => {
    p
    .then(({server, command, stdout}) => {
        console.log( `[${server}] $ ${command}\n${stdout}` );
    })
    .catch(({server, command, stderr}) => {
        console.log( `[${server}] $ ${command}\n${stderr}` );
    });
});
