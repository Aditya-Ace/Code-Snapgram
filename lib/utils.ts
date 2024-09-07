import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// detectLanguage.ts
// Helper functions for each language detection
const isCpp = (code: string): boolean => {
	return (
		/#include\s*<.*?>/.test(code) ||
		code.includes('iostream') ||
		code.includes('using namespace std') ||
		/int\s+main\s*\(/.test(code) ||
		code.includes('cout') ||
		code.includes('cin') ||
		/return\s+0\s*;/.test(code)
	);
};

const isHtml = (code: string): boolean => {
	return (
		code.startsWith('<!doctype html') ||
		/<\/?(html|head|body|div|span|a|p|h[1-6])\b/.test(code)
	);
};

const isCss = (code: string): boolean => {
	return (
		/[a-z-]+\s*:\s*[^;]+;/.test(code) && // Matches CSS property-value pairs
		/{\s*[^}]*\s*}/.test(code) && // Matches CSS blocks
		!code.includes('function') // Avoid confusion with JavaScript
	);
};

const isTypeScript = (code: string): boolean => {
	return (
		code.includes('interface') ||
		code.includes('type') ||
		code.includes('readonly') ||
		/:\s*(string|number|boolean|any)/.test(code) || // Type annotations
		/const\s+\w+:\s*\w+/.test(code) // Variable type annotations
	);
};

const isJavaScript = (code: string): boolean => {
	return (
		/function\s*\(/.test(code) ||
		/=>/.test(code) ||
		/var\s+\w+/.test(code) ||
		/let\s+\w+/.test(code) ||
		/const\s+\w+/.test(code) ||
		code.includes('console.') ||
		code.includes('return') ||
		/if\s*\(/.test(code)
	);
};

// Main detect language function
export const detectLanguage = (code: string): string => {
	const trimmedCode = code.trim();
	if (isCpp(trimmedCode)) return 'cpp';
	if (isHtml(trimmedCode)) return 'html';
	if (isCss(trimmedCode)) return 'css';
	if (isTypeScript(trimmedCode)) return 'typescript';
	if (isJavaScript(trimmedCode)) return 'javascript';

	return 'plaintext'; // Default fallback
};
