import React, { useCallback, useEffect, useState } from "react";
import "../styles/IdentityRequestsPage.css";
import {
  approveRoleRequest,
  getRoleRequests,
  rejectRoleRequest,
} from "../services/adminServise";

export default function IdentityRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("PENDING");
  const [noteByRequest, setNoteByRequest] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadRequests = useCallback(async (nextStatus) => {
    setIsLoading(true);
    try {
      const data = await getRoleRequests(nextStatus);
      setRequests(data);
    } catch (error) {
      setMessage(error?.response?.data?.message ?? "Failed to load requests.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests(status);
  }, [loadRequests, status]);

  const handleApprove = async (requestId) => {
    setMessage("");
    try {
      await approveRoleRequest(requestId);
      setMessage("Request approved.");
      await loadRequests(status);
    } catch (error) {
      setMessage(error?.response?.data?.message ?? "Failed to approve request.");
    }
  };

  const handleReject = async (requestId) => {
    const reviewNote = (noteByRequest[requestId] ?? "").trim();
    if (!reviewNote) {
      setMessage("Please add rejection reason.");
      return;
    }

    setMessage("");
    try {
      await rejectRoleRequest(requestId, reviewNote);
      setMessage("Request rejected.");
      await loadRequests(status);
    } catch (error) {
      setMessage(error?.response?.data?.message ?? "Failed to reject request.");
    }
  };

  return (
    <div className="identity-requests-page">
      <div className="identity-requests-page-headline">
        <h1 className="identity-requests-page-title">Identity requests</h1>
        <p className="identity-requests-page-lead">
          Review student and teacher verification requests before role assignment.
        </p>
      </div>

      <div className="identity-requests-filter-bar">
        <label className="identity-requests-filter">
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
      </div>

      {message && <p className="identity-requests-message">{message}</p>}

      <section className="identity-requests-card">
        {isLoading ? (
          <p className="identity-requests-empty">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="identity-requests-empty">No requests for this status.</p>
        ) : (
          <table className="identity-requests-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Requested Role</th>
                <th>Full Name</th>
                <th>ID</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.requestUser?.username ?? "Unknown"}</td>
                  <td>{request.requestedRole}</td>
                  <td>{request.fullName}</td>
                  <td>{request.externalId}</td>
                  <td>
                    <span
                      className={`identity-requests-status identity-requests-status--${request.status.toLowerCase()}`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td>
                    {request.status === "PENDING" ? (
                      <div className="identity-requests-actions">
                        <textarea
                          placeholder="Rejection reason"
                          value={noteByRequest[request.id] ?? ""}
                          onChange={(event) =>
                            setNoteByRequest((prev) => ({ ...prev, [request.id]: event.target.value }))
                          }
                        />
                        <div className="identity-requests-actions-buttons">
                          <button type="button" onClick={() => handleApprove(request.id)}>
                            Approve
                          </button>
                          <button
                            type="button"
                            className="identity-requests-btn-danger"
                            onClick={() => handleReject(request.id)}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="identity-requests-empty">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
