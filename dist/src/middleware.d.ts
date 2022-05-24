import { NextFunction, Request, Response } from 'express';
import AuthorizationService from './authorization-service';
export declare type Predicate = (req: Request, authService: AuthorizationService, actorResolver: Resolver) => Promise<boolean>;
export declare type Resolver = (req: Request) => Promise<any | undefined>;
export declare class AuthorizationDeniedError extends Error {
}
export default class Middleware {
    private _authService;
    private _actorResolver;
    constructor(authService: AuthorizationService, actorResolver: Resolver);
    authorize(...futurePredicates: Promise<Predicate>[]): (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const and: (...futurePredicates: Promise<Predicate>[]) => Promise<(req: Request, authService: AuthorizationService, actorResolver: Resolver) => Promise<boolean>>;
export declare const or: (...futurePredicates: Promise<Predicate>[]) => Promise<(req: Request, authService: AuthorizationService, actorResolver: Resolver) => Promise<boolean>>;
export declare const can: (operation: string, contextResolver: Resolver) => Promise<Predicate>;
