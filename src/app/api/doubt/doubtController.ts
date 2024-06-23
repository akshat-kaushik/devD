import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { DoubtType } from "@/types/types";

export class DoubtController {
  token
  req: NextRequest;

  constructor(token:any, req: NextRequest) {
    this.token = token;
    this.req = req;
  }

  async createDoubt() {
    const { title, description, image, video, link, tags }: DoubtType =
      await this.req.json();

 
    const tagPromises = tags.map(async (tag) => {
      const createdTag = await prisma.tag.upsert({
        where: { name: tag },
        update: {},
        create: { name: tag },
      });
      return createdTag.id;
    });

    const tagIds = await Promise.all(tagPromises);

  
    const createdDoubt = await prisma.doubt.create({
      data: {
        title,
        description,
        image,
        video,
        link,
        userId: this.token.id,
        tags: {
          create: tagIds.map((tag) => {
            return {
              tag: {
                connect: { id: tag },
              },
            };
          }),
        },
      },
      include: {
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    console.log(createdDoubt);

    return createdDoubt;
  }

  async getAll() {
    const url= new URL(this.req.url)
    const urlid= parseInt(url.searchParams.get("id") ?? "0");
    if(urlid!=0){
      const doubts = await prisma.doubt.findUnique({
        where: { id: urlid },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
      return doubts;
    }
    const doubts = await prisma.doubt.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
    console.log(doubts);
    return doubts;
  }


  //UPDATE DOUBT
  async updateDoubt() {
    try{const { id, title, description, image, video, link, tags }: DoubtType =
      await this.req.json();

    if (!id) {
      throw new Error("id is required");
    }

    const doubti = await prisma.doubt.findUnique({
      where: { id },
    })
    if(doubti==null) throw new Error("Doubt not found");

    const dataToUpdate: any = {};

    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (image !== undefined) dataToUpdate.image = image;
    if (video !== undefined) dataToUpdate.video = video;
    if (link !== undefined) dataToUpdate.link = link;

    if (tags !== undefined) {
      const tagPromises = tags.map(async (tag) => {
        const createdTag = await prisma.tag.upsert({
          where: { name: tag },
          update: {},
          create: { name: tag },
        });
        return createdTag.id;
      });

      const tagIds = await Promise.all(tagPromises);

      dataToUpdate.tags = {
        set: tagIds.map((tagId) => ({ id: tagId })),
      };
    }

    const updatedDoubt = await prisma.doubt.update({
      where: { id },
      data: dataToUpdate,
      include: {
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    console.log(updatedDoubt);
    return updatedDoubt;}
    catch(e){
      console.log(e);
      throw e;
    }
  }

  async deleteDoubt() {
    try{
      const { id }: { id: number } = await this.req.json();

    if (!id) {
      throw new Error("id is required");
    }
    console.log(id);

    const doubt = await prisma.doubt.findUnique({
      where: { id },
    });
    if(!doubt) throw new Error("Doubt not found");

    await prisma.doubtTag.deleteMany({
      where: { doubtId: id },
    });
    await prisma.doubt.delete({
      where: { id }
    });
      
    }
    catch(e){
      console.log(e);
      throw e;
    }
}}
