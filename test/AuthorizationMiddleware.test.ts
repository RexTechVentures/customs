import express, { NextFunction, Request, Response } from 'express';
import AuthorizationService from 'src/authorization-service';
import { AuthorizationDeniedError, authorize, can, configure, or, Predicate } from 'src/middleware';
import supertest, { SuperTest, Test } from 'supertest';
import { assignedRoles, entities, roles } from 'test/fixture';
import MemoryStrategy from 'test/memory-persistence-strategy';
import MemoryProvider from 'test/memory-provider';

const strategy = new MemoryStrategy(roles, assignedRoles);
const provider = new MemoryProvider(entities);

const authxService = new AuthorizationService(strategy, provider);
const actorResolver = async (req:Request) => req.user;
configure(authxService, actorResolver);

const app = express();
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
	const [id, type] = (req.headers.authorization || '').split('|');
	if (!id || !type) {
		res.status(201).json({ error: 'unauthorized' });
	} else {
		const user = entities.find(entity => entity.id === id && entity.type === type);
		if (!user) {
			res.status(404).json({ error: 'not found' });
		} else {
			req.user = user;
			next();
		}
	}
});

declare global {
	namespace Express {
		interface Request {
			user?: any | undefined;
		}
	}
}

const resolveEntity: Predicate = async (req: Request): Promise<any | undefined> => {
	return entities.find(entity => entity.id === req.params.id && entity.type === req.params.type);
};

const handle = async (req: Request, res: Response, next: NextFunction) => {
	res.json({});
};

app.get('/a/:type/:id', authorize(can('a', resolveEntity)), handle);
app.get('/b/:type/:id', authorize(can('b', resolveEntity)), handle);
app.get('/ab/:type/:id', authorize(can('a', resolveEntity), can('b', resolveEntity)), handle);
app.get('/ba/:type/:id', authorize(or(can('a', resolveEntity), can('b', resolveEntity))), handle);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	if (err instanceof AuthorizationDeniedError) {
		res.status(403).json({ err: 'Access Denied' });
	} else {
		res.status(500).json({ err });
	}
});

describe('AuthorizationMiddleware', () => {
	let request: SuperTest<Test>;

	beforeEach(() => {
		request = supertest(app);
	});

	it('Should fail unauthorized request', async () => {
		await request.get('/a/user/abc').set('Authorization', '1|user').expect(403);
	});

	it('Should pass authorized request', async () => {
		await request.get('/a/user/2').set('Authorization', '1|user').expect(200);
	});

	it('Should pass `and` true predicates', async () => {
		await request.get('/ab/org/1').set('Authorization', '1|user').expect(200);
	});

	it('Should fail `and` single false predicate', async () => {
		await request.get('/ab/thing/1').set('Authorization', '2|user').expect(403);
	});

	it('Should pass `or` single true predicate', async () => {
		await request.get('/ba/thing/1').set('Authorization', '2|user').expect(200);
	});
});
