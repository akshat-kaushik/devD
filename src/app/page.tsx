import prisma from "@/lib/prisma";


export default function Home() {
async function adduser(email: string, password: string) {
  const res = await prisma.user.create({
    data: {
      email: email,
      password: password,
    },
    select: {
      id: true,
      email: true,
      password: true,
    },
  });
  console.log(res);
}

adduser("adwawd", "daw");

  return (
   <>heelo
   </>
  );
}
