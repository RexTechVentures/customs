declare global {
    namespace Express {
        interface Request {
            user?: any | undefined;
        }
    }
}
export {};
