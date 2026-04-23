import toast from "../components/Toast";

export const copyToClipboard = async (text, label = "ID") => {
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    } catch (err) {
        toast.error("Failed to copy text.");
        console.error('Clipboard Error:', err);
    }
};