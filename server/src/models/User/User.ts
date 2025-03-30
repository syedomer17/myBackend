import mongoose,{Schema,Document} from "mongoose";

interface IUser extends Document {
    userName: string;
    password: string;
    age: number;
    email: string;
    fitnessGoal?: "weightLoss" | "muscleGain" | "endurance" | "flexibility";
    fitnessLevel?: "beginner" | "intermediate" | "advanced" | "expert";
    subscriptionStatus?: "free" | "basic" | "premium";
    userVerified: {
      email: boolean;
    };
    userVerifiedToken?: {
      email?: string;
    };
}

const userSchema = new Schema<IUser>(
    {
      userName: {
        type: String,
        required: true,
        maxlength: 20,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      age: {
        type: Number,
        maxAge: 70,
        minAge: 10,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        maxlength: 30,
        minlength: 10,
      },
      fitnessGoal: {
        type: String,
        enum: ["weightLoss", "muscleGain", "endurance", "flexibility"],
        default: "muscleGain"
      },
      fitnessLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "expert"],
        default: "beginner"
      },
      subscriptionStatus: {
        type: String,
        enum: ["free", "basic", "premium"],
        default: "free",
      },
      userVerified: {
        email: {
          type: Boolean,
          default: false,
        },
      },
      userVerifiedToken: {
        email: {
          type: String,
        },
      },
    },
    {
      timestamps: true,
    }
  );
  
  const userModel = mongoose.model<IUser>("user",userSchema,"user");
  
  export default userModel