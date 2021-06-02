//const prisma = require('../prisma/prisma.module');
const faker = require('faker');
const fakerFa = require('faker/locale/fa');

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
/**
 * Generate fake users
 */
for(let i = 0; i < 2; i++) {
    prisma.user.create({
        data: {
            UserName: faker.internet.userName(faker.name.firstName(), faker.name.lastName()),
            Email: faker.internet.email(),
            Name: fakerFa.name.findName(),
            Role: 'user',
            PodUserId: faker.datatype.number(),
            SSOProfile: {},
            Tokens: {}
        }
    });
}

for(let i = 0; i < 20; i++) {
    prisma.user.create({
        data: {
            UserName: faker.internet.userName(faker.name.firstName(), faker.name.lastName()),
            Name: fakerFa.name.findName(),
            Email: faker.internet.email(),
            PodUserId: faker.datatype.number(),
            Role: 'user',
            SSOProfile: {},
            Tokens: {}
        }
    });
}

