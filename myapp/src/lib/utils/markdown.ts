const escapeHtml = (input: string): string =>
	input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');

const isSafeUrl = (url: string): boolean => {
	const trimmed = url.trim().toLowerCase();
	return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:');
};

const formatInline = (input: string): string => {
	const codeSpans: string[] = [];
	let text = input.replace(/`([^`]+)`/g, (_match, code: string) => {
		const idx = codeSpans.push(code) - 1;
		return `@@CODE${idx}@@`;
	});

	text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label: string, url: string) => {
		if (!isSafeUrl(url)) return label;
		return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
	});

	text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
	text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

	text = text.replace(/@@CODE(\d+)@@/g, (_match, idx: string) => {
		const code = codeSpans[Number(idx)] ?? '';
		return `<code>${code}</code>`;
	});

	return text;
};

const renderBlock = (block: string): string => {
	const lines = block.split('\n');
	const out: string[] = [];
	let paragraph: string[] = [];
	let listType: 'ul' | 'ol' | null = null;

	const flushParagraph = () => {
		if (paragraph.length === 0) return;
		const joined = paragraph.join('<br />');
		out.push(`<p>${formatInline(joined)}</p>`);
		paragraph = [];
	};

	const flushList = () => {
		if (!listType) return;
		out.push(`</${listType}>`);
		listType = null;
	};

	for (const rawLine of lines) {
		const line = rawLine.trimEnd();
		if (line.trim() === '') {
			flushParagraph();
			flushList();
			continue;
		}

		const heading = line.match(/^(#{1,3})\s+(.*)$/);
		if (heading) {
			flushParagraph();
			flushList();
			const level = heading[1].length;
			out.push(`<h${level}>${formatInline(heading[2])}</h${level}>`);
			continue;
		}

		const quote = line.match(/^>\s?(.*)$/);
		if (quote) {
			flushParagraph();
			flushList();
			out.push(`<blockquote>${formatInline(quote[1])}</blockquote>`);
			continue;
		}

		const ordered = line.match(/^\d+\.\s+(.*)$/);
		if (ordered) {
			flushParagraph();
			if (listType !== 'ol') {
				flushList();
				listType = 'ol';
				out.push('<ol>');
			}
			out.push(`<li>${formatInline(ordered[1])}</li>`);
			continue;
		}

		const unordered = line.match(/^[-*]\s+(.*)$/);
		if (unordered) {
			flushParagraph();
			if (listType !== 'ul') {
				flushList();
				listType = 'ul';
				out.push('<ul>');
			}
			out.push(`<li>${formatInline(unordered[1])}</li>`);
			continue;
		}

		if (listType) {
			out.push(`<li>${formatInline(line)}</li>`);
			continue;
		}

		paragraph.push(line);
	}

	flushParagraph();
	flushList();

	return out.join('\n');
};

export const renderMarkdown = (input: string): string => {
	if (!input) return '';
	const escaped = escapeHtml(input).replace(/\r\n/g, '\n');
	const segments = escaped.split(/```/);
	const out: string[] = [];

	for (let i = 0; i < segments.length; i += 1) {
		const segment = segments[i];
		if (i % 2 === 1) {
			const firstNewline = segment.indexOf('\n');
			const code =
				firstNewline === -1 ? segment : segment.slice(firstNewline + 1);
			out.push(`<pre><code>${code}</code></pre>`);
		} else {
			out.push(renderBlock(segment));
		}
	}

	return out.join('\n');
};
