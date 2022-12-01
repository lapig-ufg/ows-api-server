require('dotenv').config();
const cluster = require('cluster');
let clusterWorkerSize = require('os').cpus().length;

if (clusterWorkerSize > 1) {
    if (cluster.isMaster) {
        if (process.env.NODE_ENV === 'dev') {
            clusterWorkerSize = 2
        } else if(process.env.NODE_ENV === 'worker'){
            clusterWorkerSize = parseInt(process.env.NUMBER_WORKERS)
        }

        for (let i=0; i < clusterWorkerSize; i++) {
            let ENV_VAR = {}
            if (i == 0) {
                ENV_VAR = { 'PRIMARY_WORKER': 1 }
            }
            cluster.fork(ENV_VAR);
        }

        cluster.on("exit", function(worker) {
            console.log(process.env.APP_NAME, worker.id, "has exited.")
        })
    } else {
        require('./app.js');
    }
} else {
    require('./app.js');
}
