export function generateCodeFromName(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
        .trim()
        .split(/\s+/) // Split by spaces
        .map((word, index) => {
            if (index === 0) return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join('');
}