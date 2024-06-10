import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

declare const global: {
  prisma?: PrismaClient;
};

if (global.prisma === undefined) {
  prisma = new PrismaClient();
  global.prisma = prisma;
}
else{
    prisma = global.prisma;
    
}

export default prisma;
