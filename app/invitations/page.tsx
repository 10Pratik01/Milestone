import { getReceivedInvitations, getSentInvitations, acceptInvitation, declineInvitation } from "@/actions/invitations";
import { Mail, Check, X, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function InvitationsPage() {
  const [receivedInvitations, sentInvitations] = await Promise.all([
    getReceivedInvitations(),
    getSentInvitations(),
  ]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Invitations
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Received Invitations */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Received ({receivedInvitations.length})
          </h2>
          {receivedInvitations.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-dark-secondary rounded-lg border border-gray-200 dark:border-gray-700">
              <Mail className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No pending invitations
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {receivedInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="p-4 bg-white dark:bg-dark-secondary rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {invitation.sender.username} invited you
                      </p>
                      {invitation.message && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {invitation.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(invitation.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <form action={acceptInvitation.bind(null, invitation.id)} className="flex-1">
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </button>
                    </form>
                    <form action={declineInvitation.bind(null, invitation.id)} className="flex-1">
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sent Invitations */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Sent ({sentInvitations.length})
          </h2>
          {sentInvitations.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-dark-secondary rounded-lg border border-gray-200 dark:border-gray-700">
              <Mail className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No sent invitations
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sentInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="p-4 bg-white dark:bg-dark-secondary rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {invitation.receiverEmail}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(invitation.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        invitation.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : invitation.status === "ACCEPTED"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {invitation.status === "PENDING" && <Clock className="h-3 w-3" />}
                      {invitation.status === "ACCEPTED" && <Check className="h-3 w-3" />}
                      {invitation.status === "DECLINED" && <X className="h-3 w-3" />}
                      {invitation.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
