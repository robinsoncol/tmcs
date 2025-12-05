export default function ActionError({
  error,
  action,
}: {
  error: Error;
  action: { title: string; disabled?: boolean; onClick?: () => void };
}) {
  return (
    <div>
      Error: {error.message}&nbsp;
      <button disabled={action.disabled} onClick={action.onClick}>
        {action.title}
      </button>
    </div>
  );
}
