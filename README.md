# Customs

Customs is a framework for [Node.js](https://nodejs.org/) authorization, including an [Express](https://expressjs.com/) and [Passport](https://passportjs.org)-compatible middleware model for declarative route authorization.

Customs builds upon the wonderful work of the Passport team (however, Passport is not required) to create a flexible model for authorizing a request. Customs implements an extensible approach that works with your authorization logic, application design, and data model. On top of the core authorization framework, Customs provides a declarative middleware model for applying route authorization rules that enhance the expressiveness of an application.

---

## Install

```bash
$ npm install -P @rex/customs

# or

$ yarn add @rex/customs
```

## Usage

Customs' authorization model is based on traditional ["Role-Based Access Control" [RBAC]](https://en.wikipedia.org/wiki/Role-based_access_control). In Customs, a `Role` defines a collection of permissions. Once defined, a `Role` can be assigned to any entity (users, client applications, etc - whatever works for the host application) either globally (i.e. a global "System Admin") or for a specific target context ("Admin" for "Company A", "Editor" for "Document XYZ", etc - again, whatever entity types make sense for the host application).

When an entity attempts to perform an operation on a target context, Customs can then be invoked to verify that the entity has been granted the necessary permission (via some `Role` assignment) to perform the operation on the target context, or some parent context of the target context through which the permission is inherited.

Crucially - note the separation between `Role` and `Operation` as this is an important distinction. A `Role` is assigned to an entity, whereas an `Operation` is the action that entity will be entitled to perform. When authorizing an action, it is always the `Operation` that is being authorized, not the `Role`. This distinction dramatically reduces the amount of refactoring required when the function of a `Role` changes as an application evolves, as the reqeusting features rarely need to care.

To use Customs, there are a few steps you must take:

1. Implement your `EntityProvider`.
2. Select and configure a `PersistenceStrategy`.
3. Build an `AuthorizationService`.
4. Define and assign `Roles`.
5. Authorize usage by
    - Using `AuthorizationService` programatically, or
    - Using middleware to declare authorization rules

### Implement your `EntityProvider`

Out of the box, Customs knows nothing about your data model. To bridge that gap, Customs requires a very simple (only 2 methods) interface known as an `EntityProvider`. This interface tells Customs how to how to:

1. **Identify an entity**. To reference an entity, Customs needs to know the id and type of the entity. Both are arbitrary strings that can be _anything_ that makes sense to the host application.
2. **Identify an entity's parent**. To properly authorize requests, Customs need to be told when an entity belongs to another entity (only relevant if your data model has a hierarchy for permissions purposes). If an entity has no parent, simply return nothing!

The full interface specification can be found in [entity.ts](./src/entity.ts).

### Select and configure a `PersistenceStrategy`

Customs uses an extensible interface for storing `Role` definitions and assignments that can be implemented to support whatever database is appropriate for the host application. For convenience, however, Customs provides pre-created implementations for the common ORM tools [Mongoose](https://mongoosejs.com/) and soon [Sequelize](https://sequelize.org/).

To create a new `MongoosePersistenceStrategy`, you need only provide a `Promise` for an initialized `Mongoose` connection that Customs can use to interact with the database. Given a target connection, Customs will take care of creating and populating the necessary collections as needed. For example:

```typescript
import { MongoosePersistenceStrategy } from '@rex/customs';

const connection: Promise<Mongoose> = mongoose.connect('mongodb://localhost:27017/my-database');

const strategy = new MongoosePersistenceStrategy(connection);
```

If you _do_ choose to create your own implementation instead, the full interface specification can be found in [persistence/index.ts](./src/persistence/index.ts).

### Build an `AuthorizationService`

Once you have an `EntityProvider` and a `PersistenceStrategy`, creating a new `AuthorizationService` instance is fairly trivial:

```typescript
import AuthorizationService, { MongoosePersistenceStrategy } from '@rex/customs';
const strategy = new MongoosePersistenceStrategy(myConnection);
const provider = new MyProvider(...);

const authxService = new AuthorizationService(strategy, provider);
```

And now you are ready to start using Customs!

### Define and assign `Roles`

Once you have your `AuthorizationService` set up, there are a host of available operations available:

#### _Role definition_

`Role` definition takes a unique `Role` name and a list of operation permissions the `Role` confers. All of these are completely arbitrary string values that mean nothing semantically to Customs. Host applications are free to use whatever `Role` and `Operation` names are meaningful to the host application. Use of constants to refer to these names within an application is, however, considered a best practice to reduce coding errors.

```typescript
const ADMIN = 'ADMIN';
const MEMBER = 'MEMBER';
const CREATE = 'CREATE';
const READ = 'READ';
const UPDATE = 'UPDATE';
const DELETE = 'DELETE';

// create an ADMIN role that can do everything
await authxService.defineRole(ADMIN, [CREATE, READ, UPDATE, DELETE]);
// create a read-only MEMBER role
await authxService.defineRole(MEMBER, [READ]);
```

#### _Role assignment_

A defined `Role` is assigned or revoked from an entity on a target context very directly:

```typescript
// make user1 a global admin
await authxService.assignRole(user1, ADMIN);

// make user2 a company admin
await authxService.assignRole(user2, ADMIN, org1);

// make user 3 a company member
await authxService.assignRole(user3, MEMBER, org1);

// make user4 a document reader
await authxService.assignRole(user4, MEMBER, document1);

// revoke global admin status for user4
await authxService.revokeRole(user4, ADMIN);
```

### Authorize usage

And finally - the moment of truth! With `Role` definitions and assignments in place, authorization can now be performed. This can happen a couple different ways:

#### _Using `AuthorizationService` programatically_

Anywhere in a host application, the `AuthorizationService` can be directly invoked to authorize a particular entity to perform an operation on a target context. This allows for a very flexible set of authorization operations that can support a vast number of use cases:

```typescript
// a global assignment applies to any context
assert(await authxService.canPerform(UPDATE, user1, org2));

// but a scoped assignment only applies to the assigned scope
assert(await authxService.canPerform(UPDATE, user2, org1));
assert(!(await authxService.canPerform(UPDATE, user2, org2)));

// and a role only grants the specific set of defined operations
assert(await authxService.canPerform(READ, user3, org1));
assert(!(await authxService.canPerform(UPDATE, user3, org1)));

// also, role assignments are hierarchically inherited down the ownership chain
//  so - assuming that document1's parent is org1, and document2's parent is org2
assert(await authxService.canPerform(DELETE, user2, document1));
assert(!(await authxService.canPerform(DELETE, user2, document2)));

// but inheritance only goes 1 way - never upwards!
assert(await authxService.canPerform(READ, user4, document1));
assert(!(await authxService.canPerform(READ, user4, org1)));
```

#### _Using middleware to declare authorization rules_

The other option available is to leverage the Customs authorization middleware to add authorization rules to controller routes. This approach requires a little more configuration, but cleanly separates authorization rules from a controller implementation.

To use the Customs middleware, a handler must be implemented to resolve the authenticated user. Here's an example that uses the Passport approach:

```typescript
import { Middleware } from '@rex/customs';

const resolver = async (req: Request) => req.user;
const customs = new Middleware(authxService, resolver);
```

Once configured, authorization rules can be declaratively attached to route defintions:

```typescript
import { Middleware:{ can }} from '@rex/customs';

const userResolver = async (req:Request) => userService.load(req.params.id);

router.get(
  '/user/:id'
  passport.authenticate('bearer'),
  // can the Passport-authenticated user read the user referenced by this request?
  customs.authorize(can(READ, userResolver)),
  controller.getUser
);
```

A few things to note in the above example:

-   The `can` method requires a resolver to determine the target context of the operation, but this same resolver could be reused for _any_ method that targets a user id as its context.
-   The currently authenticated user is resolved using the resolver configured on the `Middleware` instance
-   This declaration does not care who the logged in user is or what `Role` that user has been assigned. It is _only_ interested in whether or not the authenticated entity is allowed to read the target user object.
