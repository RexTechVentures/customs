import AuthorizationService from './authorization-service';
import { EntityProvider, EntityReference, refEq } from './entity';
import { PersistenceStrategy, Role, AssignedRole } from './persistence';
import MongoosePersistenceStrategy from './persistence/mongoose';
import Middleware from './middleware';

export default AuthorizationService;

export { EntityProvider, EntityReference, refEq };
export { PersistenceStrategy, Role, AssignedRole };
export { MongoosePersistenceStrategy };
export { Middleware };
