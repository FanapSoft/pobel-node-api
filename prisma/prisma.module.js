//import { PrismaClient } from "@prisma/client"

//const prisma = new PrismaClient()

//export default prisma;
import prisma from '@prisma/client';
const { PrismaClient } = prisma;

// const { PrismaClient } = require('@prisma/client')
// const prisma = new PrismaClient();//{log: ['query', 'info', `warn`, `error`],}
// module.exports = prisma;
// prisma.$on('info', e => {
//     console.log(e)
//     //console.log("Query: " + e.query)
//     //console.log("Duration: " + e.duration + "ms")
// })
export default new PrismaClient();
