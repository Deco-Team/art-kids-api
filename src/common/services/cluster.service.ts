const cluster = require('cluster')
import { Injectable } from '@nestjs/common'
import * as os from 'os'

@Injectable()
export class ClusterService {
  static clusterize(callback: Function): void {
    const numCPUs = os.cpus().length

    if (cluster.isMaster) {
      console.log(`MASTER SERVER (${process.pid}) IS RUNNING. ${numCPUs} workers`)

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
      }

      cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`)
        cluster.fork();
      })
    } else {
      callback()
    }
  }
}
