import Modal from "@/app/(components)/Modal";
import { createTask } from "@/actions/tasks";
import { getProjectUsers } from "@/actions/projects";
import React, { useState, useEffect } from "react";
import { formatISO } from "date-fns";
import Image from "next/image";
import { User, Search, Check, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
};

// Define locally since we removed api.ts types
enum Status {
    ToDo = "To Do",
    WorkInProgress = "Work In Progress",
    UnderReview = "Under Review",
    Completed = "Completed"
}

enum Priority {
    Urgent = "Urgent",
    High = "High",
    Medium = "Medium",
    Low = "Low",
    Backlog = "Backlog"
}

type UserOption = {
  userId: number;
  username: string;
  profilePictureUrl: string | null;
};

const ModalNewTask = ({ isOpen, onClose, id = null }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>(Status.ToDo);
  const [priority, setPriority] = useState<Priority>(Priority.Backlog);
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [projectId, setProjectId] = useState("");
  
  // User Selection State
  const [projectUsers, setProjectUsers] = useState<UserOption[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);

  useEffect(() => {
    // Determine active Project ID
    const activeProjectId = id !== null ? id : projectId;
    
    if (isOpen && activeProjectId) {
        const fetchUsers = async () => {
            setIsUsersLoading(true);
            try {
                const users = await getProjectUsers(Number(activeProjectId));
                setProjectUsers(users);
            } catch (error) {
                console.error("Failed to fetch project users:", error);
            } finally {
                setIsUsersLoading(false);
            }
        };
        fetchUsers();
    }
  }, [isOpen, id, projectId]);

  const handleSubmit = async () => {
    if (!title || !(id !== null || projectId)) return;

    setIsLoading(true);
    try {
      const formattedStartDate = startDate ? formatISO(new Date(startDate), {
        representation: "complete",
      }) : undefined;
      const formattedDueDate = dueDate ? formatISO(new Date(dueDate), {
        representation: "complete",
      }) : undefined;

      await createTask({
        title,
        description,
        status,
        priority,
        tags,
        startDate: formattedStartDate,
        dueDate: formattedDueDate,
        projectId: id !== null ? Number(id) : Number(projectId),
        assignedUserId: selectedUser ? selectedUser.userId : (assignedUserId ? parseInt(assignedUserId) : undefined),
      });

      onClose();
      // Reset form
       setTitle("");
       setDescription("");
       setStatus(Status.ToDo);
       setPriority(Priority.Backlog);
       setTags("");
       setStartDate("");
       setDueDate("");
       setAssignedUserId("");
       setSelectedUser(null);
       setUserSearchQuery("");
       
    } catch (error) {
       console.error("Failed to create task:", error);
    } finally {
        setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return title && (id !== null || projectId);
  };

  const selectStyles =
    "mb-4 block w-full rounded border border-gray-300 px-3 py-2 dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

  const inputStyles =
    "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

  const filteredUsers = projectUsers.filter(user => 
    user.username.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Create New Task">
      <form
        className="mt-4 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          type="text"
          className={inputStyles}
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className={inputStyles}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <select
            className={selectStyles}
            value={status}
            onChange={(e) =>
              setStatus(Status[e.target.value as keyof typeof Status])
            }
          >
            <option value="">Select Status</option>
            <option value={Status.ToDo}>To Do</option>
            <option value={Status.WorkInProgress}>Work In Progress</option>
            <option value={Status.UnderReview}>Under Review</option>
            <option value={Status.Completed}>Completed</option>
          </select>
          <select
            className={selectStyles}
            value={priority}
            onChange={(e) =>
              setPriority(Priority[e.target.value as keyof typeof Priority])
            }
          >
            <option value="">Select Priority</option>
            <option value={Priority.Urgent}>Urgent</option>
            <option value={Priority.High}>High</option>
            <option value={Priority.Medium}>Medium</option>
            <option value={Priority.Low}>Low</option>
            <option value={Priority.Backlog}>Backlog</option>
          </select>
        </div>
        <input
          type="text"
          className={inputStyles}
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <input
            type="date"
            className={inputStyles}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className={inputStyles}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        
        {/* User Selection UI */}
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assign To
            </label>
            <div 
                className={`relative w-full rounded border border-gray-300 bg-white p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white cursor-pointer flex items-center justify-between ${isUserDropdownOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            >
                {selectedUser ? (
                     <div className="flex items-center gap-2">
                        {selectedUser.profilePictureUrl ? (
                            <Image src={`/${selectedUser.profilePictureUrl}`} alt={selectedUser.username} width={24} height={24} className="rounded-full" />
                        ) : (
                            <User className="h-6 w-6 rounded-full bg-gray-200 p-1 dark:bg-gray-600" />
                        )}
                        <span>{selectedUser.username}</span>
                     </div>
                ) : (
                    <span className="text-gray-500">Select a user...</span>
                )}
                {selectedUser && (
                    <div onClick={(e) => { e.stopPropagation(); setSelectedUser(null); }} className="hover:text-red-500">
                        <X className="h-4 w-4" />
                    </div>
                )}
            </div>

            {isUserDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-dark-secondary max-h-60 overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-white dark:bg-dark-secondary border-b dark:border-gray-700">
                        <div className="relative">
                             <input
                                type="text"
                                className="w-full rounded border border-gray-300 p-1.5 pl-8 text-sm dark:border-gray-600 dark:bg-dark-tertiary dark:text-white focus:outline-none"
                                placeholder="Search..."
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                    
                    {isUsersLoading ? (
                        <div className="p-4 text-center text-sm text-gray-500">Loading users...</div>
                    ) : filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <div
                                key={user.userId}
                                className={`flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${selectedUser?.userId === user.userId ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                onClick={() => {
                                    setSelectedUser(user);
                                    setIsUserDropdownOpen(false);
                                }}
                            >
                                {user.profilePictureUrl ? (
                                    <Image src={`/${user.profilePictureUrl}`} alt={user.username} width={24} height={24} className="rounded-full flex-shrink-0" />
                                ) : (
                                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 dark:bg-gray-600">
                                        <User className="h-4 w-4 text-gray-500" />
                                    </div>
                                )}
                                <span className="text-sm dark:text-white truncate">{user.username}</span>
                                {selectedUser?.userId === user.userId && <Check className="ml-auto h-4 w-4 text-blue-500" />}
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-sm text-gray-500">No users found</div>
                    )}
                </div>
            )}
        </div>

        {id === null && (
          <input
            type="text"
            className={inputStyles}
            placeholder="ProjectId"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          />
        )}
        <button
          type="submit"
          className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? "Creating..." : "Create Task"}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewTask;
