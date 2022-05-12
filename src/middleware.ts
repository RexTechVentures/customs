import Express, { Request, Response, NextFunction } from 'express';
import AuthorizationService from './authorization-service';
import { EntityReference } from './entity';

export type Predicate = (req: Request, res: Response) => Promise<boolean>;
export class AuthorizationDeniedError extends Error { }

let _authService: AuthorizationService;

export const configure = (authService: AuthorizationService) => {
    _authService = authService;
}

export const authorize = (...predicates: Promise<Predicate>[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        console.log('authorize(%j)', predicates);
        try {
            const test = await (await predicates[0])(req, res);
            console.log('test -> %s', test);

            await Promise.all(predicates.map(({then}) => then(predicate => predicate(req, res))));
            next();
        } catch (ignore) {
            console.log('throwing %j', ignore);
            next(new AuthorizationDeniedError('Access denied'));
        }
    }
};

export const can = async (operation: string, contextResolver: (req: Request) => Promise<EntityReference | undefined>):Promise<Predicate> => {
    return async (req: Request, res: Response) => {
        console.log('can...');
        const context = await contextResolver(req);
        console.log('can(%s,%s,%j)', req.params.id, operation, context);
        const actor = await _authService.getReference(req.user);
        return _authService.canPerform(operation, actor, context);
    };
};
