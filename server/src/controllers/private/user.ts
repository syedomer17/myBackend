import express, { Request, Response, Router } from "express";
import userModel from "../../models/User/User";

const router: Router = express.Router();

// ✅ Get all users
router.get("/getallusers", async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userModel.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// ✅ Get user by ID
router.get("/getuserbyid/:id", async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// ✅ Delete all users
router.delete("/deleteall", async (req: Request, res: Response): Promise<void> => {
  try {
    await userModel.deleteMany();
    res.status(200).json({ message: "All users deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// ✅ Delete user by ID
router.delete("/deletebyid/:id", async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// ✅ Edit user by ID
router.put("/editbyid/:id", async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const updatedUser = await userModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;