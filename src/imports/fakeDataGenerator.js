//const prisma = require('../prisma/prisma.module');
import faker from 'faker';
import fakerFa from 'faker/locale/fa.js';

import pkg from '@prisma/client'
const { PrismaClient } = pkg
const prisma = new PrismaClient();

async function generateUsers() {
    /**
     * Generate fake users
     */
    for(let i = 0; i < 2; i++) {
        console.log('?')

        await prisma.user.create({
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
        console.log('??')
        await prisma.user.create({
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
}

async function generateAnswers() {

}

generateUsers();
