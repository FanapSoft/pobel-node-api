import p from '@prisma/client';
import TargetDefinitionsMiddleware from "./middlewares/TargetDefinitionsMiddleware.js";

const { PrismaClient } = p;

const prisma = new PrismaClient();
TargetDefinitionsMiddleware(prisma);
export default prisma;
