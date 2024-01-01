"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { CreateBoard } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }

  const { title, image } = data;

  const [imageId, imageThumbUrl, imageFullUrl, imageLinkHTML, imageUserName] =
    image.split("|");

  if (
    !imageId ||
    !imageThumbUrl ||
    !imageFullUrl ||
    !imageUserName ||
    !imageLinkHTML
  ) {
    return {
      error: "Missing fields. Fail to create board.",
    };
  }

  let board;

  try {
    board = await db.board.create({
      data: {
        title: title,
        orgId: orgId,
        imageId: imageId,
        imageThumbUrl: imageThumbUrl,
        imageFullUrl: imageFullUrl,
        imageUserName: imageUserName,
        imageLinkHTML: imageLinkHTML,
      },
    });
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to create.",
    };
  }

  revalidatePath(`/board/${board.id}`);
  return { data: board };
};

export const createBoard = createSafeAction(CreateBoard, handler);
