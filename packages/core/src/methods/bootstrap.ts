import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as helmet from 'helmet';
import { ReflectiveInjector } from 'injection-js';
import 'reflect-metadata';
import { Module } from './../module/module';
import { Route } from '../route/route';
import { app } from '../server';


/**
 * @description The method to start up a Boat instance. 
 * This compiles all of the dependencies and prepares them to be served.
 * 
 * @export
 * @param {Module} mod 
 * @returns {void} 
 */
export function bootstrap(mod: any): void {
    /* Here, we start with some simple instantiation code.
       Boat includes a few middlewares we suggest, just to keep you safe. */
    app.use(bodyParser.json());
    app.use(helmet());
    app.use(compression());

    /* We strip some data from the type annotation on the module. */
    let annotations: Module = Reflect.getMetadata('annotations', mod)[0];

    /* If we have any middleware classes, they can be referenced here. */
    if (annotations.middlewares) {
        annotations.middlewares.forEach((middleware: any) => {
            app.use(new middleware().use);
        });
    }


    if (!annotations.providers) annotations.providers = [];
    if (!annotations.routes) annotations.routes = [];

    /* Here we inject all of the dependencies for the module. */
    let injector = ReflectiveInjector.resolveAndCreate([...annotations.providers, ...annotations.routes]);

    annotations.routes.forEach((route: Route) => {
        let rt = injector.get(route);
        let routeAnnotation = Reflect.getMetadata('annotations', route)[0];
        if (rt.get) {
            app.get(routeAnnotation.path, rt.get);
        }
        if (rt.post) {
            app.get(routeAnnotation.path, rt.post);
        }
        if (rt.patch) {
            app.get(routeAnnotation.path, rt.patch);
        }
        if (rt.put) {
            app.get(routeAnnotation.path, rt.put);
        }
        if (rt.delete) {
            app.get(routeAnnotation.path, rt.delete);
        }
    });

    /* Now we set up the listener and are ready to take requests. */
    let config = annotations.config;
    if (config && config.port) {
        app.listen(config.port);
        console.log('LISTENING ON PORT ' + config.port);
    } else {
        let port = process.env.PORT ? process.env.PORT : 8080;
        app.listen(port);
        console.log('LISTENING ON PORT ' + port);
    }
    return;
}