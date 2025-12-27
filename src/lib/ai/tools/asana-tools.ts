import { getValidAccessToken } from "@/lib/integrations/token-refresh";
import type Anthropic from "@anthropic-ai/sdk";

// Asana API base URL
const ASANA_API_BASE = "https://app.asana.com/api/1.0";

// Tool definitions for Claude
export const asanaToolDefinitions: Anthropic.Messages.Tool[] = [
  {
    name: "list_asana_tasks",
    description:
      "List tasks from the user's Asana account. Can filter by project, assignee, or completion status.",
    input_schema: {
      type: "object" as const,
      properties: {
        projectId: {
          type: "string",
          description: "Filter by project ID (optional)",
        },
        completed: {
          type: "boolean",
          description: "Filter by completion status. If not specified, returns incomplete tasks.",
        },
        limit: {
          type: "number",
          description: "Maximum number of tasks to return (default: 20, max: 100)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_asana_task",
    description: "Get detailed information about a specific Asana task by its ID.",
    input_schema: {
      type: "object" as const,
      properties: {
        taskId: {
          type: "string",
          description: "The Asana task GID (global ID)",
        },
      },
      required: ["taskId"],
    },
  },
  {
    name: "create_asana_task",
    description:
      "Create a new task in Asana. Requires at minimum a task name. Optionally specify project, due date, and description.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "Task name/title",
        },
        notes: {
          type: "string",
          description: "Task description/notes (optional)",
        },
        dueDate: {
          type: "string",
          description: "Due date in YYYY-MM-DD format (optional)",
        },
        projectId: {
          type: "string",
          description: "Project GID to add the task to (optional)",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "complete_asana_task",
    description: "Mark an Asana task as complete.",
    input_schema: {
      type: "object" as const,
      properties: {
        taskId: {
          type: "string",
          description: "The Asana task GID to mark as complete",
        },
      },
      required: ["taskId"],
    },
  },
];

// Asana types
interface AsanaTask {
  gid: string;
  name: string;
  notes?: string;
  completed: boolean;
  completed_at?: string;
  due_on?: string;
  due_at?: string;
  created_at?: string;
  modified_at?: string;
  assignee?: { gid: string; name?: string; email?: string };
  projects?: Array<{ gid: string; name: string }>;
  tags?: Array<{ gid: string; name: string }>;
  workspace?: { gid: string; name: string };
  permalink_url?: string;
}

interface AsanaUser {
  gid: string;
  name: string;
  email: string;
  workspaces?: Array<{ gid: string; name: string }>;
}

interface AsanaListResponse {
  data: AsanaTask[];
  next_page?: { offset: string };
}

// Tool execution functions

async function getCurrentUser(
  accessToken: string
): Promise<AsanaUser | null> {
  try {
    const response = await fetch(`${ASANA_API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data;
  } catch {
    return null;
  }
}

export async function listAsanaTasks(
  userId: string,
  projectId?: string,
  completed: boolean = false,
  limit: number = 20
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(userId, "asana");
    if (!accessToken) {
      return {
        success: false,
        error:
          "Asana is not connected or the connection has expired. Please reconnect in settings.",
      };
    }

    const effectiveLimit = Math.min(limit, 100);

    // Get current user to find their workspace
    const currentUser = await getCurrentUser(accessToken);
    if (!currentUser) {
      return { success: false, error: "Failed to retrieve Asana user information" };
    }

    const workspace = currentUser.workspaces?.[0];
    if (!workspace) {
      return { success: false, error: "No Asana workspace found for this user" };
    }

    let url: URL;
    const queryParams: Record<string, string> = {
      limit: effectiveLimit.toString(),
      completed_since: completed ? "1970-01-01T00:00:00.000Z" : "",
      opt_fields: "name,completed,due_on,due_at,assignee,assignee.name,projects,projects.name,notes,permalink_url",
    };

    if (!completed) {
      queryParams.completed_since = "now"; // "now" means only incomplete tasks
    }

    if (projectId) {
      url = new URL(`${ASANA_API_BASE}/projects/${projectId}/tasks`);
    } else {
      url = new URL(`${ASANA_API_BASE}/tasks`);
      queryParams.workspace = workspace.gid;
      queryParams.assignee = "me";
    }

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Asana API error:", errorData);
      return { success: false, error: "Failed to retrieve tasks from Asana" };
    }

    const data: AsanaListResponse = await response.json();
    const tasks = data.data.map((task) => ({
      id: task.gid,
      name: task.name,
      notes: task.notes?.slice(0, 500),
      completed: task.completed,
      dueDate: task.due_on || task.due_at,
      assignee: task.assignee?.name,
      projects: task.projects?.map((p) => ({ id: p.gid, name: p.name })),
      link: task.permalink_url,
    }));

    return {
      success: true,
      data: {
        tasks,
        total: tasks.length,
        workspace: workspace.name,
      },
    };
  } catch (error) {
    console.error("Error listing Asana tasks:", error);
    return { success: false, error: "An error occurred while retrieving tasks" };
  }
}

export async function getAsanaTask(
  userId: string,
  taskId: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(userId, "asana");
    if (!accessToken) {
      return {
        success: false,
        error:
          "Asana is not connected or the connection has expired. Please reconnect in settings.",
      };
    }

    const url = new URL(`${ASANA_API_BASE}/tasks/${taskId}`);
    url.searchParams.set(
      "opt_fields",
      "name,notes,completed,completed_at,due_on,due_at,created_at,modified_at,assignee,assignee.name,assignee.email,projects,projects.name,tags,tags.name,workspace,workspace.name,permalink_url"
    );

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: "Task not found" };
      }
      return { success: false, error: "Failed to retrieve task" };
    }

    const data = await response.json();
    const task: AsanaTask = data.data;

    return {
      success: true,
      data: {
        id: task.gid,
        name: task.name,
        notes: task.notes,
        completed: task.completed,
        completedAt: task.completed_at,
        dueDate: task.due_on || task.due_at,
        createdAt: task.created_at,
        modifiedAt: task.modified_at,
        assignee: task.assignee
          ? { name: task.assignee.name, email: task.assignee.email }
          : null,
        projects: task.projects?.map((p) => ({ id: p.gid, name: p.name })),
        tags: task.tags?.map((t) => ({ id: t.gid, name: t.name })),
        workspace: task.workspace?.name,
        link: task.permalink_url,
      },
    };
  } catch (error) {
    console.error("Error getting Asana task:", error);
    return { success: false, error: "An error occurred while retrieving the task" };
  }
}

export async function createAsanaTask(
  userId: string,
  name: string,
  notes?: string,
  dueDate?: string,
  projectId?: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(userId, "asana");
    if (!accessToken) {
      return {
        success: false,
        error:
          "Asana is not connected or the connection has expired. Please reconnect in settings.",
      };
    }

    // Get current user and workspace
    const currentUser = await getCurrentUser(accessToken);
    if (!currentUser) {
      return { success: false, error: "Failed to retrieve Asana user information" };
    }

    const workspace = currentUser.workspaces?.[0];
    if (!workspace) {
      return { success: false, error: "No Asana workspace found for this user" };
    }

    const taskData: Record<string, unknown> = {
      name,
      workspace: workspace.gid,
      assignee: "me",
    };

    if (notes) taskData.notes = notes;
    if (dueDate) taskData.due_on = dueDate;
    if (projectId) taskData.projects = [projectId];

    const response = await fetch(`${ASANA_API_BASE}/tasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: taskData }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Asana create error:", errorData);
      return { success: false, error: "Failed to create task in Asana" };
    }

    const data = await response.json();
    const task: AsanaTask = data.data;

    return {
      success: true,
      data: {
        id: task.gid,
        name: task.name,
        dueDate: task.due_on,
        link: task.permalink_url,
        message: `Task "${name}" created successfully`,
      },
    };
  } catch (error) {
    console.error("Error creating Asana task:", error);
    return { success: false, error: "An error occurred while creating the task" };
  }
}

export async function completeAsanaTask(
  userId: string,
  taskId: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(userId, "asana");
    if (!accessToken) {
      return {
        success: false,
        error:
          "Asana is not connected or the connection has expired. Please reconnect in settings.",
      };
    }

    const response = await fetch(`${ASANA_API_BASE}/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: { completed: true } }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: "Task not found" };
      }
      const errorData = await response.text();
      console.error("Asana complete error:", errorData);
      return { success: false, error: "Failed to complete task" };
    }

    const data = await response.json();
    const task: AsanaTask = data.data;

    return {
      success: true,
      data: {
        id: task.gid,
        name: task.name,
        completed: task.completed,
        completedAt: task.completed_at,
        message: `Task "${task.name}" marked as complete`,
      },
    };
  } catch (error) {
    console.error("Error completing Asana task:", error);
    return { success: false, error: "An error occurred while completing the task" };
  }
}

// Tool handler function
export async function handleAsanaTool(
  userId: string,
  toolName: string,
  input: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  switch (toolName) {
    case "list_asana_tasks":
      return listAsanaTasks(
        userId,
        input.projectId as string | undefined,
        input.completed as boolean | undefined,
        input.limit as number | undefined
      );

    case "get_asana_task":
      return getAsanaTask(userId, input.taskId as string);

    case "create_asana_task":
      return createAsanaTask(
        userId,
        input.name as string,
        input.notes as string | undefined,
        input.dueDate as string | undefined,
        input.projectId as string | undefined
      );

    case "complete_asana_task":
      return completeAsanaTask(userId, input.taskId as string);

    default:
      return { success: false, error: `Unknown Asana tool: ${toolName}` };
  }
}
