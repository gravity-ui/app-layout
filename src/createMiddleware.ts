import type {Request, Response, NextFunction} from 'express';
import {createRenderFunction} from './render.js';
import type {Plugin, RenderFunction} from './types.js';

interface CreateMiddlewareOptions {
    name?: string;
    plugins?: Plugin[];
}
export function createMiddleware({name = 'renderLayout', plugins}: CreateMiddlewareOptions) {
    const renderFunction = createRenderFunction();

    type WithRenderFunction<T> = T & {
        [K in typeof name]: RenderFunction;
    };
    return function layoutMiddleware(_req: Request, res: Response, next: NextFunction) {
        (res as WithRenderFunction<Response>)[name] = function renderLayout(params) {
            return renderFunction(params, plugins);
        };
        next();
    };
}
