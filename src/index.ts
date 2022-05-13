import AuthorizationService from './authorization-service';
import { EntityProvider, EntityReference, refEq } from './entity';
import { PersistenceStrategy } from './persistence';
import MongoosePersistenceStrategy from './persistence/mongoose';

export default AuthorizationService;

export { EntityProvider, EntityReference, refEq };
export { PersistenceStrategy };
export { MongoosePersistenceStrategy };
