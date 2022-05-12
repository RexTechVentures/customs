import { expect } from 'chai';
import AuthorizationService from 'src/authorization-service';
import MemoryStrategy from 'test/memory-persistence-strategy';
import { entities, roles, assignedRoles, org1, org2, thing1, thing2, user1, user2 } from './fixture';
import { Entity, MemoryProvider } from './memory-provider';
import express, { Request, Response, NextFunction } from 'express';
import { authorize, can, configure } from 'src/middleware';
import { EntityReference } from 'src';
import supertest, { SuperTest, Test } from 'supertest';

const strategy = new MemoryStrategy(roles, assignedRoles);
const provider = new MemoryProvider(entities);

const authxService = new AuthorizationService(strategy, provider);
configure(authxService);

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

const resolveUserId = async (req: Request):Promise<EntityReference | undefined> => {
    console.log('resolving user id %s', req.params.id);
    const user = entities.find(entity => entity.id === req.params.id && entity.type === 'user');
    console.log('returing %j', user);
    return user;
}

app.get(
    '/user/:id',
    authorize(can('read', resolveUserId)),
    async (req: Request, res: Response, next: NextFunction) => {
        res.json({})
    }
);

app.use((err:any, req:Request, res:Response, next:NextFunction) => {
    console.log('threw %j', err);
    res.status(500).json({err});
})

describe('AuthorizationMiddleware', () => {
    let request: SuperTest<Test>;

    beforeEach(() => {
        request = supertest(app);
    });

    it('Should fail unauthorized request', async () => {
        await request
            .get('/user/abc')
            .set('Authorization','1|user')
            .expect(401);
    })
});