"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { syncUser } from "@/actions/users";

export default function UserSync() {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const sync = async () => {
        try {
          await syncUser();
        } catch (error) {
          console.error("Failed to sync user:", error);
        }
      };
      sync();
    }
  }, [isLoaded, isSignedIn]);

  return null;
}
