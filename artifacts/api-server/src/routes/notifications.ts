import { Router, type IRouter } from "express";
import { db, notificationsTable, eq, desc } from "@workspace/db";

const router: IRouter = Router();

// Get all notifications
router.get("/notifications", async (req, res) => {
  const adminId = req.cookies?.admin_id;
  if (!adminId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const notifications = await db
      .select()
      .from(notificationsTable)
      .orderBy(desc(notificationsTable.createdAt))
      .limit(50);
    
    res.json(notifications);
  } catch (error) {
    console.error("Fetch notifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mark notification as read
router.patch("/notifications/:id/read", async (req, res) => {
  const adminId = req.cookies?.admin_id;
  if (!adminId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { id } = req.params;
  try {
    const [updated] = await db
      .update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.id, parseInt(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    console.error("Update notification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
