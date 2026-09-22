export async function notify(message: string, opts?: { icon?: string }) {
  const { default: toast } = await import('react-hot-toast');
  toast(message, opts);
}
