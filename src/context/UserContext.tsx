"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  email: string;
  name?: string;
  age?: number;
  city?: string;
  country?: string;
  currency: string;
  monthlyIncome?: number;
  coachingStyle: "gentle" | "brutal" | "nerdy" | "meme";
  activeMode: "normal" | "yolo" | "broke" | "vacation";
  isOnboarded: boolean;
}

interface UserContextType {
  user: User | null;
  userId: Id<"users"> | null;
  isLoading: boolean;
  isSeeding: boolean;
  seedDemoData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Demo user email for development
const DEMO_EMAIL = "demo@amana.my";
const DEMO_NAME = "Firdaus";

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Try to get user by email
  const existingUser = useQuery(api.users.getByEmail, { email: DEMO_EMAIL });

  // Mutations for seeding
  const seedAll = useMutation(api.seed.seedAll);
  const seedCategories = useMutation(api.seed.seedCategories);
  const seedMerchants = useMutation(api.seed.seedMerchants);
  const seedTransactions = useMutation(api.seed.seedTransactions);
  const seedBenchmarks = useMutation(api.seed.seedBenchmarks);

  // Set userId when user is found
  useEffect(() => {
    if (existingUser) {
      setUserId(existingUser._id);
    }
  }, [existingUser]);

  // Get full user profile
  const userProfile = useQuery(
    api.users.getProfile,
    userId ? { userId } : "skip"
  );

  const seedDemoData = async () => {
    if (isSeeding) return;
    setIsSeeding(true);

    try {
      // Create user
      const result = await seedAll({ email: DEMO_EMAIL, name: DEMO_NAME });
      const newUserId = result.userId;

      // Seed categories and merchants
      await seedCategories({});
      await seedMerchants({});
      await seedBenchmarks({});

      // Seed transactions for the user
      await seedTransactions({
        userId: newUserId,
        months: 6,
        transactionsPerMonth: 60,
      });

      setUserId(newUserId);
    } catch (error) {
      console.error("Error seeding demo data:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  const isLoading = existingUser === undefined;

  const user: User | null = userProfile
    ? {
        _id: userProfile._id,
        email: userProfile.email,
        name: userProfile.name,
        age: userProfile.age,
        city: userProfile.city,
        country: userProfile.country,
        currency: userProfile.currency,
        monthlyIncome: userProfile.monthlyIncome,
        coachingStyle: userProfile.coachingStyle,
        activeMode: userProfile.activeMode,
        isOnboarded: userProfile.isOnboarded,
      }
    : null;

  return (
    <UserContext.Provider
      value={{
        user,
        userId,
        isLoading,
        isSeeding,
        seedDemoData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

