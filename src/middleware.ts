import { NextFunction, Request, Response } from 'express';
import AuthorizationService from './authorization-service';

export type Predicate = (req: Request) => Promise<boolean>;
export class AuthorizationDeniedError extends Error {}

let _authService: AuthorizationService;

export const configure = (authService: AuthorizationService) => {
	_authService = authService;
};

export const authorize = (...futurePredicates: Promise<Predicate>[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const andHandler = await and(...futurePredicates);
			const allTrue = await andHandler(req);
			if (allTrue) {
				next();
			} else {
				next(new AuthorizationDeniedError('Access denied'));
			}
		} catch (ignore) {
			next(new AuthorizationDeniedError('Access denied'));
		}
	};
};

export const and = async (...futurePredicates: Promise<Predicate>[]) => {
	return async (req: Request) => {
		const predicates = await Promise.all(futurePredicates);
		const results = await Promise.all(predicates.map(predicate => predicate(req)));
		return !results.filter(result => !result).length;
	};
};

export const or = async (...futurePredicates: Promise<Predicate>[]) => {
	return async (req: Request) => {
		const predicates = await Promise.all(futurePredicates);
		const results = await Promise.all(predicates.map(predicate => predicate(req)));
		return !!results.filter(result => result).length;
	};
};
export const can = async (
	operation: string,
	contextResolver: (req: Request) => Promise<any | undefined>
): Promise<Predicate> => {
	return async (req: Request) => {
		const user = req.user;
		const context = await contextResolver(req);
		if (user && context) {
			return _authService.canPerform(operation, user, context);
		} else {
			return false;
		}
	};
};
