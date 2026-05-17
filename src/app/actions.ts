"use server";

import { prisma } from "@/lib/db";
import { Goal, CheckIn, User, GoalStatus, ProgressStatus, UomType, Quarter } from "@/lib/mockData";
import { revalidatePath } from "next/cache";

// ─── Helpers: Type Mappers ───

function mapUser(dbUser: any): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role as any,
    department: dbUser.department,
    managerId: dbUser.managerId || undefined,
  };
}

function mapGoal(dbGoal: any): Goal {
  return {
    id: dbGoal.id,
    userId: dbGoal.userId,
    title: dbGoal.title,
    description: dbGoal.description,
    thrustArea: dbGoal.thrustArea,
    uom: dbGoal.uom as any,
    target: dbGoal.target,
    weightage: dbGoal.weightage,
    status: dbGoal.status as any,
    progressStatus: dbGoal.progressStatus as any,
    isShared: dbGoal.isShared,
    createdAt: dbGoal.createdAt instanceof Date ? dbGoal.createdAt.toISOString().split("T")[0] : String(dbGoal.createdAt),
    approvedAt: dbGoal.approvedAt ? (dbGoal.approvedAt instanceof Date ? dbGoal.approvedAt.toISOString().split("T")[0] : String(dbGoal.approvedAt)) : undefined,
  };
}

function mapCheckIn(dbCheckIn: any): CheckIn {
  return {
    id: dbCheckIn.id,
    goalId: dbCheckIn.goalId,
    quarter: dbCheckIn.quarter as any,
    actualAchievement: dbCheckIn.actualAchievement,
    progressStatus: dbCheckIn.progressStatus as any,
    managerComment: dbCheckIn.managerComment || undefined,
    updatedAt: dbCheckIn.updatedAt instanceof Date ? dbCheckIn.updatedAt.toISOString().split("T")[0] : String(dbCheckIn.updatedAt),
  };
}

// ─── Server Actions ───

export async function getUsers(): Promise<User[]> {
  try {
    const dbUsers = await prisma.user.findMany();
    return dbUsers.map(mapUser);
  } catch (error) {
    console.error("Error in getUsers action:", error);
    return [];
  }
}

export async function getGoals(): Promise<Goal[]> {
  try {
    const dbGoals = await prisma.goal.findMany({
      orderBy: { createdAt: "desc" },
    });
    return dbGoals.map(mapGoal);
  } catch (error) {
    console.error("Error in getGoals action:", error);
    return [];
  }
}

export async function getCheckIns(): Promise<CheckIn[]> {
  try {
    const dbCheckIns = await prisma.checkIn.findMany();
    return dbCheckIns.map(mapCheckIn);
  } catch (error) {
    console.error("Error in getCheckIns action:", error);
    return [];
  }
}

export async function createGoal(data: {
  userId: string;
  title: string;
  description: string;
  thrustArea: string;
  uom: UomType;
  target: number;
  weightage: number;
  status: GoalStatus;
  progressStatus: ProgressStatus;
  isShared: boolean;
}): Promise<Goal | null> {
  try {
    const newDbGoal = await prisma.goal.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description || "",
        thrustArea: data.thrustArea,
        uom: data.uom,
        target: Number(data.target),
        weightage: Number(data.weightage),
        status: data.status,
        progressStatus: data.progressStatus,
        isShared: data.isShared,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        goalId: newDbGoal.id,
        action: "Goal Created",
        details: `Created goal "${data.title}" under ${data.thrustArea} with weightage ${data.weightage}%.`,
      },
    });

    revalidatePath("/goals");
    return mapGoal(newDbGoal);
  } catch (error) {
    console.error("Error in createGoal action:", error);
    return null;
  }
}

export async function updateGoalStatus(
  goalId: string,
  status: GoalStatus,
  actionUserEmail: string = "neha@company.com"
): Promise<Goal | null> {
  try {
    // Find actor
    const actor = await prisma.user.findUnique({ where: { email: actionUserEmail } });
    if (!actor) throw new Error("Action actor user not found.");

    const dbGoal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!dbGoal) throw new Error("Goal not found.");

    const updatedDbGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        status,
        approvedAt: status === "approved" || status === "locked" ? new Date() : null,
      },
    });

    let actionLabel = "Goal Updated";
    if (status === "approved") actionLabel = "Goal Approved";
    if (status === "rejected") actionLabel = "Goal Rejected";

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        goalId,
        action: actionLabel,
        details: `Updated status of "${dbGoal.title}" to "${status}".`,
      },
    });

    revalidatePath("/goals");
    revalidatePath("/manager/approvals");
    return mapGoal(updatedDbGoal);
  } catch (error) {
    console.error("Error in updateGoalStatus action:", error);
    return null;
  }
}

export async function batchUpdateGoalStatus(
  goalIds: string[],
  status: GoalStatus,
  actionUserEmail: string = "neha@company.com"
): Promise<boolean> {
  try {
    const actor = await prisma.user.findUnique({ where: { email: actionUserEmail } });
    if (!actor) throw new Error("Action actor user not found.");

    for (const goalId of goalIds) {
      const dbGoal = await prisma.goal.findUnique({ where: { id: goalId } });
      if (!dbGoal) continue;

      await prisma.goal.update({
        where: { id: goalId },
        data: {
          status,
          approvedAt: status === "approved" || status === "locked" ? new Date() : null,
        },
      });

      let actionLabel = "Goal Updated";
      if (status === "approved") actionLabel = "Goal Approved";
      if (status === "rejected") actionLabel = "Goal Rejected";

      await prisma.auditLog.create({
        data: {
          userId: actor.id,
          goalId,
          action: actionLabel,
          details: `Batch updated status of "${dbGoal.title}" to "${status}".`,
        },
      });
    }

    revalidatePath("/goals");
    revalidatePath("/manager/approvals");
    return true;
  } catch (error) {
    console.error("Error in batchUpdateGoalStatus action:", error);
    return false;
  }
}

export async function saveCheckIn(data: {
  goalId: string;
  userId: string;
  quarter: Quarter;
  actualAchievement: number;
  progressStatus: ProgressStatus;
  managerComment?: string;
}): Promise<CheckIn | null> {
  try {
    // Check if check-in for goal and quarter already exists
    const existing = await prisma.checkIn.findUnique({
      where: {
        goalId_quarter: {
          goalId: data.goalId,
          quarter: data.quarter,
        },
      },
    });

    let savedCheckIn;
    if (existing) {
      savedCheckIn = await prisma.checkIn.update({
        where: { id: existing.id },
        data: {
          actualAchievement: Number(data.actualAchievement),
          progressStatus: data.progressStatus,
          managerComment: data.managerComment || existing.managerComment,
        },
      });
    } else {
      savedCheckIn = await prisma.checkIn.create({
        data: {
          goalId: data.goalId,
          userId: data.userId,
          quarter: data.quarter,
          actualAchievement: Number(data.actualAchievement),
          progressStatus: data.progressStatus,
          managerComment: data.managerComment || "",
        },
      });
    }

    // Update goal's overall progress status to match the latest checkin status
    await prisma.goal.update({
      where: { id: data.goalId },
      data: { progressStatus: data.progressStatus },
    });

    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        goalId: data.goalId,
        action: "Check-in Submitted",
        details: `Submitted check-in for ${data.quarter}: achievement=${data.actualAchievement}, status=${data.progressStatus}.`,
      },
    });

    revalidatePath("/checkins");
    revalidatePath("/goals");
    return mapCheckIn(savedCheckIn);
  } catch (error) {
    console.error("Error in saveCheckIn action:", error);
    return null;
  }
}

export async function getAuditLogs(): Promise<any[]> {
  try {
    const dbLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        goal: true,
      },
    });
    return dbLogs.map((log: any) => ({
      id: log.id,
      goalId: log.goalId || undefined,
      userId: log.userId,
      action: log.action,
      details: log.details,
      createdAt: log.createdAt.toISOString().split("T")[0],
      userName: log.user.name,
      goalTitle: log.goal?.title || undefined,
    }));
  } catch (error) {
    console.error("Error in getAuditLogs action:", error);
    return [];
  }
}
