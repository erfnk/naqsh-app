import { createBoard } from "./procedures/create-board";
import { createColumn } from "./procedures/create-column";
import { createTask } from "./procedures/create-task";
import { deleteBoard } from "./procedures/delete-board";
import { deleteColumn } from "./procedures/delete-column";
import { deleteTask } from "./procedures/delete-task";
import { getBoard } from "./procedures/get-board";
import { getBoardBySlugProcedure } from "./procedures/get-board-by-slug";
import { listBoards } from "./procedures/list-boards";
import { listMembers } from "./procedures/list-members";
import { moveTask } from "./procedures/move-task";
import { reorderColumns } from "./procedures/reorder-columns";
import { reorderTasks } from "./procedures/reorder-tasks";
import { toggleFavorite } from "./procedures/toggle-favorite";
import { updateBoard } from "./procedures/update-board";
import { updateColumn } from "./procedures/update-column";
import { updateTask } from "./procedures/update-task";

export const boardsRouter = {
	create: createBoard,
	list: listBoards,
	get: getBoard,
	getBySlug: getBoardBySlugProcedure,
	update: updateBoard,
	delete: deleteBoard,
	toggleFavorite,
	columns: {
		create: createColumn,
		update: updateColumn,
		delete: deleteColumn,
		reorder: reorderColumns,
	},
	tasks: {
		create: createTask,
		update: updateTask,
		delete: deleteTask,
		move: moveTask,
		reorder: reorderTasks,
	},
	members: {
		list: listMembers,
	},
};
