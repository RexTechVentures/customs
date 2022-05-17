import { NextFunction, Request, Response } from 'express';
import AuthorizationService from './authorization-service';

export type Predicate = (req: Request, authService: AuthorizationService, actorResolver: Resolver) => Promise<boolean>;
export type Resolver = (req: Request) => Promise<any | undefined>;
export class AuthorizationDeniedError extends Error {}

export default class Middleware {
	private _authService: AuthorizationService;
	private _actorResolver: Resolver;

	constructor(authService: AuthorizationService, actorResolver: Resolver) {
		this._authService = authService;
		this._actorResolver = actorResolver;
	}

	authorize(...futurePredicates: Promise<Predicate>[]) {
		return async (req: Request, res: Response, next: NextFunction) => {
			try {
				const andHandler = await and(...futurePredicates);
				const allTrue = await andHandler(req, this._authService, this._actorResolver);
				if (allTrue) {
					next();
				} else {
					next(new AuthorizationDeniedError('Access denied'));
				}
			} catch (ignore) {
				next(new AuthorizationDeniedError('Access denied'));
			}
		};
	}
}

export const and = async (...futurePredicates: Promise<Predicate>[]) => {
	return async (req: Request, authService: AuthorizationService, actorResolver: Resolver) => {
		const predicates = await Promise.all(futurePredicates);
		const results = await Promise.all(predicates.map(predicate => predicate(req, authService, actorResolver)));
		return !results.filter(result => !result).length;
	};
};

export const or = async (...futurePredicates: Promise<Predicate>[]) => {
	return async (req: Request, authService: AuthorizationService, actorResolver: Resolver) => {
		const predicates = await Promise.all(futurePredicates);
		const results = await Promise.all(predicates.map(predicate => predicate(req, authService, actorResolver)));
		return !!results.filter(result => result).length;
	};
};

export const can = async (operation: string, contextResolver: Resolver): Promise<Predicate> => {
	return async (req: Request, authService: AuthorizationService, actorResolver: Resolver) => {
		const actor = await actorResolver(req);
		const context = await contextResolver(req);
		if (actor && context) {
			return authService.canPerform(operation, actor, context);
		} else {
			return false;
		}
	};
};
