import Modal from "@/app/(components)/Modal";
import { searchUsers } from "@/actions/users";
import { sendInvitation } from "@/actions/invitations";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { User, X, Search, CheckCircle, Loader } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
};

type UserResult = {
  userId: number;
  username: string;
  email: string;
  profilePictureUrl?: string | null;
};

const ModalInvitePeople = ({ isOpen, onClose, projectId }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsLoading(true);
        try {
          const results = await searchUsers(searchQuery);
          setSearchResults(results as UserResult[]);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectUser = (user: UserResult) => {
    if (!selectedUsers.find((u) => u.userId === user.userId)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchResults([]); // Clear search results after selection
    setSearchQuery(""); // Clear search query
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter((u) => u.userId !== userId));
  };

  const handleSendInvitations = async () => {
    if (selectedUsers.length === 0 || !projectId) return;

    setIsSending(true);
    try {
      const promises = selectedUsers.map((user) =>
        sendInvitation({
          receiverEmail: user.email, // Using email as per current action definition
          projectId: Number(projectId),
          message: message,
        })
      );
      await Promise.all(promises);
      onClose();
      // Reset state
      setSelectedUsers([]);
      setMessage("");
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to send invitations:", error);
      // Ideally show error toast here
    } finally {
      setIsSending(false);
    }
  };

  const inputStyles =
    "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Invite People">
      <div className="mt-4 space-y-6">
        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user.userId}
                className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              >
                <span>{user.username}</span>
                <button
                  onClick={() => handleRemoveUser(user.userId)}
                  className="ml-1 rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            className={`${inputStyles} pl-10`}
            placeholder="Search by username or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            {isLoading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-dark-secondary">
            {searchResults.map((user) => (
              <button
                key={user.userId}
                onClick={() => handleSelectUser(user)}
                className="flex w-full items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={selectedUsers.some((u) => u.userId === user.userId)}
              >
                <div className="h-8 w-8 flex-shrink-0">
                  {user.profilePictureUrl ? (
                    <Image
                      src={`/${user.profilePictureUrl}`}
                      alt={user.username}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600">
                      <User className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium dark:text-white">
                    {user.username}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ID: {user.userId}
                  </span>
                </div>
                {selectedUsers.some((u) => u.userId === user.userId) && (
                  <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Optional Message */}
        <textarea
          className={inputStyles}
          placeholder="Add a message (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />

        {/* Action Button */}
        <button
          onClick={handleSendInvitations}
          className={`mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            selectedUsers.length === 0 || isSending
              ? "cursor-not-allowed opacity-50"
              : ""
          }`}
          disabled={selectedUsers.length === 0 || isSending}
        >
          {isSending
            ? "Sending..."
            : `Send Invitation${selectedUsers.length > 1 ? "s" : ""}`}
        </button>
      </div>
    </Modal>
  );
};

export default ModalInvitePeople;
