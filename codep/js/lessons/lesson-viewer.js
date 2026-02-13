// ── Lesson Viewer Component ──────────────────────────────────────────────────
// Renders structured lesson content into a container element.
// Supports 8 section types: heading, paragraph, tip, key-terms, card-example,
// formula, table, summary.

export class LessonViewer {
    constructor(containerId, cardRenderer) {
        this.containerId = containerId;
        this.renderCards = cardRenderer; // (containerElement, cards) => void
        this.lesson = null;
        this.onComplete = null;
    }

    load(lessonData, onComplete) {
        this.lesson = lessonData;
        this.onComplete = onComplete;
        this.render();
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container || !this.lesson) return;

        container.innerHTML = '';
        container.classList.remove('hidden');

        // Title bar
        const titleBar = document.createElement('div');
        titleBar.className = 'lesson-title-bar';
        titleBar.innerHTML = `
            <h2 class="lesson-title">${this.lesson.title}</h2>
            <span class="lesson-time">~${this.lesson.estimatedMinutes} min read</span>
        `;
        container.appendChild(titleBar);

        // Lesson body
        const body = document.createElement('div');
        body.className = 'lesson-body';

        let cardExampleCount = 0;
        for (const section of this.lesson.sections) {
            const el = this.renderSection(section, cardExampleCount);
            if (el) {
                body.appendChild(el);
                if (section.type === 'card-example') cardExampleCount++;
            }
        }

        container.appendChild(body);

        // Mark complete button
        const btnWrap = document.createElement('div');
        btnWrap.className = 'lesson-complete-wrap';

        const btn = document.createElement('button');
        btn.className = 'btn btn-primary lesson-complete-btn';
        btn.textContent = 'Mark Lesson Complete';
        btn.addEventListener('click', () => {
            if (this.onComplete) this.onComplete();
        });
        btnWrap.appendChild(btn);
        container.appendChild(btnWrap);
    }

    renderSection(section, cardExampleIndex) {
        switch (section.type) {
            case 'heading': return this._renderHeading(section);
            case 'paragraph': return this._renderParagraph(section);
            case 'tip': return this._renderTip(section);
            case 'key-terms': return this._renderKeyTerms(section);
            case 'card-example': return this._renderCardExample(section, cardExampleIndex);
            case 'formula': return this._renderFormula(section);
            case 'table': return this._renderTable(section);
            case 'summary': return this._renderSummary(section);
            default: return null;
        }
    }

    _renderHeading(section) {
        const level = section.level || 2;
        const tag = `h${Math.min(Math.max(level, 2), 4)}`;
        const el = document.createElement(tag);
        el.className = 'lesson-heading';
        el.textContent = section.text;
        return el;
    }

    _renderParagraph(section) {
        const el = document.createElement('div');
        el.className = 'lesson-paragraph';
        el.innerHTML = section.text;
        return el;
    }

    _renderTip(section) {
        const el = document.createElement('div');
        el.className = 'lesson-tip';

        const icons = {
            lightbulb: '💡',
            warning: '⚠️',
            star: '⭐',
            brain: '🧠',
            math: '🔢',
            target: '🎯',
            fire: '🔥',
            check: '✅'
        };
        const icon = icons[section.icon] || '💡';

        el.innerHTML = `
            <span class="lesson-tip-icon">${icon}</span>
            <div class="lesson-tip-text">${section.text}</div>
        `;
        return el;
    }

    _renderKeyTerms(section) {
        const el = document.createElement('div');
        el.className = 'lesson-key-terms';

        let html = '<h4 class="lesson-key-terms-title">Key Terms</h4>';
        html += '<dl class="lesson-definitions">';
        for (const { term, definition } of section.terms) {
            html += `<dt>${term}</dt><dd>${definition}</dd>`;
        }
        html += '</dl>';

        el.innerHTML = html;
        return el;
    }

    _renderCardExample(section, index) {
        const el = document.createElement('div');
        el.className = 'lesson-card-example';

        const label = document.createElement('div');
        label.className = 'lesson-card-label';
        label.textContent = section.label;
        el.appendChild(label);

        if (section.cards && section.cards.length > 0) {
            const cardContainer = document.createElement('div');
            cardContainer.className = 'lesson-card-display';
            cardContainer.id = `lesson-cards-${index}`;
            el.appendChild(cardContainer);

            // Render cards after DOM insertion via setTimeout
            if (this.renderCards) {
                setTimeout(() => {
                    this.renderCards(cardContainer, section.cards);
                }, 0);
            }
        }

        if (section.caption) {
            const caption = document.createElement('div');
            caption.className = 'lesson-card-caption';
            caption.innerHTML = section.caption;
            el.appendChild(caption);
        }

        return el;
    }

    _renderFormula(section) {
        const el = document.createElement('div');
        el.className = 'lesson-formula';

        el.innerHTML = `
            <div class="lesson-formula-label">${section.label}</div>
            <div class="lesson-formula-expr">${section.formula}</div>
            ${section.example ? `<div class="lesson-formula-example">${section.example}</div>` : ''}
        `;
        return el;
    }

    _renderTable(section) {
        const el = document.createElement('div');
        el.className = 'lesson-table-wrap';

        let html = '';
        if (section.caption) {
            html += `<div class="lesson-table-caption">${section.caption}</div>`;
        }

        html += '<table class="lesson-table"><thead><tr>';
        for (const h of section.headers) {
            html += `<th>${h}</th>`;
        }
        html += '</tr></thead><tbody>';
        for (const row of section.rows) {
            html += '<tr>';
            for (const cell of row) {
                html += `<td>${cell}</td>`;
            }
            html += '</tr>';
        }
        html += '</tbody></table>';

        el.innerHTML = html;
        return el;
    }

    _renderSummary(section) {
        const el = document.createElement('div');
        el.className = 'lesson-summary';

        let html = '<h4 class="lesson-summary-title">Key Takeaways</h4><ul>';
        for (const point of section.points) {
            html += `<li>${point}</li>`;
        }
        html += '</ul>';

        el.innerHTML = html;
        return el;
    }

    hide() {
        const container = document.getElementById(this.containerId);
        if (container) container.classList.add('hidden');
    }
}
