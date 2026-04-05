export default function StatusBadge({ status }) {

  const colors = {
    Pending: "status-pending",
    Revision: "status-revision",
    Approved: "status-approved"
  };

  return (
    <span className={`status ${colors[status]}`}>
      {status}
    </span>
  );
}