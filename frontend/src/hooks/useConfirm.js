import { useState, useCallback } from "react";

// Small state helper for <ConfirmDialog/>. Usage:
//   const confirm = useConfirm();
//   ...
//   confirm.ask({
//     title: "Delete team?",
//     message: "This can't be undone.",
//     onConfirm: async () => { await api.delete(...); confirm.close(); }
//   });
//   ...
//   <ConfirmDialog {...confirm.props} />
export default function useConfirm() {
  const [state, setState] = useState({ open: false });
  const [loading, setLoading] = useState(false);

  const ask = useCallback((opts) => {
    setState({ open: true, ...opts });
  }, []);

  const close = useCallback(() => {
    setState({ open: false });
    setLoading(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!state.onConfirm) return close();
    try {
      setLoading(true);
      await state.onConfirm();
      close();
    } catch (err) {
      setLoading(false);
      alert(err?.response?.data?.message || err?.message || "Action failed");
    }
  }, [state, close]);

  return {
    ask,
    close,
    props: {
      open: state.open,
      title: state.title,
      message: state.message,
      confirmLabel: state.confirmLabel,
      cancelLabel: state.cancelLabel,
      danger: state.danger,
      loading,
      onConfirm: handleConfirm,
      onCancel: close,
    },
  };
}
