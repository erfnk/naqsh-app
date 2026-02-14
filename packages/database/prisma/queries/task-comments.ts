import { db } from "../client";

export async function createTaskComment({
	taskId,
	authorId,
	content,
}: {
	taskId: string;
	authorId: string;
	content: string;
}) {
	return db.taskComment.create({
		data: { taskId, authorId, content },
		include: {
			author: {
				select: { id: true, name: true, email: true, image: true },
			},
		},
	});
}

export async function getTaskComments(taskId: string) {
	return db.taskComment.findMany({
		where: { taskId },
		include: {
			author: {
				select: { id: true, name: true, email: true, image: true },
			},
		},
		orderBy: { createdAt: "asc" },
	});
}

export async function updateTaskComment({
	id,
	content,
}: {
	id: string;
	content: string;
}) {
	return db.taskComment.update({
		where: { id },
		data: { content },
		include: {
			author: {
				select: { id: true, name: true, email: true, image: true },
			},
		},
	});
}

export async function deleteTaskComment(id: string) {
	return db.taskComment.delete({ where: { id } });
}

export async function getTaskComment(id: string) {
	return db.taskComment.findUnique({
		where: { id },
		select: { id: true, taskId: true, authorId: true },
	});
}
