// FitFun UI Components Module

const UI = {
    // Show modal
    showModal(options) {
        const {
            title,
            content,
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            onConfirm,
            onCancel,
            type = 'default' // 'default', 'danger', 'warning'
        } = options;

        // Create modal backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.id = 'modal-backdrop';

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';

        // Modal header
        const header = document.createElement('div');
        header.className = 'modal-header';

        const titleEl = document.createElement('h3');
        titleEl.className = 'modal-title';
        titleEl.textContent = title;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => this.closeModal();

        header.appendChild(titleEl);
        header.appendChild(closeBtn);

        // Modal body
        const body = document.createElement('div');
        body.className = 'modal-body';

        if (typeof content === 'string') {
            body.innerHTML = content;
        } else {
            body.appendChild(content);
        }

        // Modal footer
        const footer = document.createElement('div');
        footer.className = 'modal-footer';

        if (cancelText) {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-ghost';
            cancelBtn.textContent = cancelText;
            cancelBtn.onclick = () => {
                if (onCancel) onCancel();
                this.closeModal();
            };
            footer.appendChild(cancelBtn);
        }

        const confirmBtn = document.createElement('button');
        confirmBtn.className = type === 'danger' ? 'btn btn-danger' : 'btn btn-primary';
        confirmBtn.textContent = confirmText;
        confirmBtn.onclick = () => {
            if (onConfirm) onConfirm();
            this.closeModal();
        };
        footer.appendChild(confirmBtn);

        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(body);
        modal.appendChild(footer);
        backdrop.appendChild(modal);

        // Add to DOM
        document.body.appendChild(backdrop);

        // Close on backdrop click
        backdrop.onclick = (e) => {
            if (e.target === backdrop) {
                this.closeModal();
            }
        };
    },

    // Close modal
    closeModal() {
        const backdrop = document.getElementById('modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
    },

    // Show notification toast
    showNotification(options) {
        const {
            title,
            message,
            type = 'info', // 'info', 'success', 'warning', 'danger'
            duration = 5000
        } = options;

        // Create or get notification container
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} animate-slide-down`;

        const content = document.createElement('div');
        content.className = 'notification-content';

        if (title) {
            const titleEl = document.createElement('div');
            titleEl.className = 'notification-title';
            titleEl.textContent = title;
            content.appendChild(titleEl);
        }

        const messageEl = document.createElement('div');
        messageEl.className = 'notification-message';
        messageEl.textContent = message;
        content.appendChild(messageEl);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => notification.remove();

        notification.appendChild(content);
        notification.appendChild(closeBtn);

        container.appendChild(notification);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }
    },

    // Show loading spinner
    showLoading(message = 'Loading...') {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.id = 'loading-backdrop';
        backdrop.style.cursor = 'wait';

        const container = document.createElement('div');
        container.style.textAlign = 'center';

        const spinner = document.createElement('div');
        spinner.className = 'spinner spinner-lg';

        const text = document.createElement('p');
        text.textContent = message;
        text.style.color = 'white';
        text.style.marginTop = 'var(--space-4)';

        container.appendChild(spinner);
        container.appendChild(text);
        backdrop.appendChild(container);

        document.body.appendChild(backdrop);
    },

    // Hide loading spinner
    hideLoading() {
        const backdrop = document.getElementById('loading-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
    },

    // Create avatar element
    createAvatar(user, size = 'md') {
        const avatar = document.createElement('div');
        avatar.className = `avatar avatar-${size}`;

        if (user.profileImage) {
            const img = document.createElement('img');
            img.src = user.profileImage;
            img.alt = user.displayName || user.realName;
            avatar.appendChild(img);
        } else {
            avatar.textContent = Utils.getInitials(user.displayName || user.realName);
            avatar.style.backgroundColor = Utils.getRandomColor();
        }

        return avatar;
    },

    // Create badge element
    createBadge(text, type = 'neutral') {
        const badge = document.createElement('span');
        badge.className = `badge badge-${type}`;
        badge.textContent = text;
        return badge;
    },

    // Create empty state
    createEmptyState(options) {
        const { icon, title, description, actionText, onAction } = options;

        const container = document.createElement('div');
        container.className = 'empty-state';

        if (icon) {
            const iconEl = document.createElement('div');
            iconEl.className = 'empty-state-icon';
            iconEl.textContent = icon;
            container.appendChild(iconEl);
        }

        if (title) {
            const titleEl = document.createElement('h3');
            titleEl.className = 'empty-state-title';
            titleEl.textContent = title;
            container.appendChild(titleEl);
        }

        if (description) {
            const descEl = document.createElement('p');
            descEl.className = 'empty-state-description';
            descEl.textContent = description;
            container.appendChild(descEl);
        }

        if (actionText && onAction) {
            const actionBtn = document.createElement('button');
            actionBtn.className = 'btn btn-primary';
            actionBtn.textContent = actionText;
            actionBtn.onclick = onAction;
            container.appendChild(actionBtn);
        }

        return container;
    },

    // Create progress bar
    createProgressBar(percentage, type = 'primary') {
        const container = document.createElement('div');
        container.className = 'progress';

        const bar = document.createElement('div');
        bar.className = `progress-bar progress-bar-${type}`;
        bar.style.width = `${Utils.clamp(percentage, 0, 100)}%`;

        container.appendChild(bar);
        return container;
    },

    // Format competition status badge
    getStatusBadge(status) {
        const statusMap = {
            'upcoming': { text: 'Upcoming', type: 'primary' },
            'active': { text: 'Active', type: 'success' },
            'grace_period': { text: 'Grace Period', type: 'warning' },
            'completed': { text: 'Completed', type: 'neutral' },
            'canceled': { text: 'Canceled', type: 'danger' }
        };

        const config = statusMap[status] || { text: status, type: 'neutral' };
        return this.createBadge(config.text, config.type);
    },

    // Create table from data
    createTable(options) {
        const { columns, data, onRowClick } = options;

        const container = document.createElement('div');
        container.className = 'table-container';

        const table = document.createElement('table');
        table.className = 'table';

        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col.header;
            if (col.width) th.style.width = col.width;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create body
        const tbody = document.createElement('tbody');

        if (data.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = columns.length;
            emptyCell.style.textAlign = 'center';
            emptyCell.style.padding = 'var(--space-12)';
            emptyCell.textContent = 'No data available';
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
        } else {
            data.forEach((row, index) => {
                const tr = document.createElement('tr');
                if (onRowClick) {
                    tr.style.cursor = 'pointer';
                    tr.onclick = () => onRowClick(row, index);
                }

                columns.forEach(col => {
                    const td = document.createElement('td');

                    if (col.render) {
                        const rendered = col.render(row[col.key], row, index);
                        if (typeof rendered === 'string') {
                            td.innerHTML = rendered;
                        } else {
                            td.appendChild(rendered);
                        }
                    } else {
                        td.textContent = row[col.key] || '-';
                    }

                    tr.appendChild(td);
                });

                tbody.appendChild(tr);
            });
        }

        table.appendChild(tbody);
        container.appendChild(table);

        return container;
    },

    // Create form field
    createFormField(options) {
        const {
            type = 'text',
            label,
            name,
            value = '',
            placeholder = '',
            required = false,
            options: selectOptions,
            help,
            error
        } = options;

        const group = document.createElement('div');
        group.className = 'form-group';

        if (label) {
            const labelEl = document.createElement('label');
            labelEl.className = required ? 'form-label form-label-required' : 'form-label';
            labelEl.textContent = label;
            labelEl.htmlFor = name;
            group.appendChild(labelEl);
        }

        let input;

        if (type === 'textarea') {
            input = document.createElement('textarea');
            input.className = 'form-textarea';
        } else if (type === 'select') {
            input = document.createElement('select');
            input.className = 'form-select';

            selectOptions.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.label;
                if (opt.value === value) option.selected = true;
                input.appendChild(option);
            });
        } else {
            input = document.createElement('input');
            input.type = type;
            input.className = 'form-input';
        }

        input.name = name;
        input.id = name;
        input.value = value;
        input.placeholder = placeholder;
        if (required) input.required = true;

        if (error) {
            input.classList.add('form-error');
        }

        group.appendChild(input);

        if (error) {
            const errorEl = document.createElement('span');
            errorEl.className = 'form-error-message';
            errorEl.textContent = error;
            group.appendChild(errorEl);
        } else if (help) {
            const helpEl = document.createElement('span');
            helpEl.className = 'form-help';
            helpEl.textContent = help;
            group.appendChild(helpEl);
        }

        return { group, input };
    },

    // Confirm dialog
    confirm(options) {
        return new Promise((resolve) => {
            this.showModal({
                ...options,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    },

    // Alert dialog
    alert(title, message, type = 'info') {
        return new Promise((resolve) => {
            this.showModal({
                title,
                content: message,
                type,
                cancelText: null,
                confirmText: 'OK',
                onConfirm: () => resolve(true)
            });
        });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
