import { Router } from 'express';
import { Request, Response } from '_debugger';
import { Boat } from '../decorators/boat';
import * as express from 'express';
import { BootstrapConfig } from '../types/bootstrap';
let router: any = express.Router();


/**
 * bootstrap
 * @param mod {Boat} The AppModule to bootstrap
 * @param config {BootstrapConfig} the optional configuration for your app
 * @param config.port {number} the port on which to run your app
 */

export function bootstrap(mod: any, config?: BootstrapConfig): void {
    let app: any = express();

    if (config && config.port) {
        app.listen(config.port);
        console.log("LISTENING ON PORT " + config.port);
    } else {
        app.listen(process.env.PORT | 8080);
        console.log("LISTENING ON PORT " + process.env.PORT || 8080);
    }

    if (mod.middlewares) {
        for (let i = 0; i < mod.middlewares.length; i++) {
            app.use(mod.middlewares);
        }
    }
    mod.methods.forEach((route: any) => {
        app[route.method](route.path, (req: Request, res: Response) => {
            route.executor(req, res);
        });
    });
}