document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const noteTitle = document.getElementById('note-title');
    const noteContent = document.getElementById('note-content');
    const addNoteBtn = document.getElementById('add-note');
    const notesContainer = document.getElementById('notes-container');
    const colorOptions = document.querySelectorAll('.color-option');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const formatMenu = document.getElementById('format-menu');
    const checkboxBtn = document.getElementById('checkbox-btn');
    const listBtn = document.getElementById('list-btn');
    const bulletBtn = document.getElementById('bullet-btn');

    // Variables
    let selectedColor = '#ffffff'; // Default color
    let editingNoteId = null;
    let activeFormatType = null; // Track active formatting

    // Initialize textarea auto-resize
    initTextareaAutoResize();

    // Initialize notes from localStorage
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    renderNotes();

    // Function to initialize textarea auto-resize
    function initTextareaAutoResize() {
        // Set initial height
        autoResizeTextarea(noteContent);
        
        // Add input event listener for auto-resize
        noteContent.addEventListener('input', function() {
            autoResizeTextarea(this);
        });
    }

    // Function to auto-resize textarea
    function autoResizeTextarea(textarea) {
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        
        // Set new height based on scrollHeight
        // Adding a small buffer (2px) to prevent scrollbar flashing
        textarea.style.height = (textarea.scrollHeight + 2) + 'px';
    }

    // Event Listeners
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            option.classList.add('selected');
            // Update selected color
            selectedColor = option.getAttribute('data-color');
        });
    });

    // Toggle hamburger menu
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        formatMenu.classList.toggle('active');
    });

    // Close hamburger menu when clicking outside
    document.addEventListener('click', () => {
        if (formatMenu.classList.contains('active')) {
            formatMenu.classList.remove('active');
        }
    });

    // Prevent menu from closing when clicked
    formatMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Format options
    checkboxBtn.addEventListener('click', () => {
        insertFormatting('checkbox');
        activeFormatType = 'checkbox';
        formatMenu.classList.remove('active');
    });

    listBtn.addEventListener('click', () => {
        insertFormatting('list');
        activeFormatType = 'list';
        formatMenu.classList.remove('active');
    });

    bulletBtn.addEventListener('click', () => {
        insertFormatting('bullet');
        activeFormatType = 'bullet';
        formatMenu.classList.remove('active');
    });

    // Add keydown event listener to textarea for enhanced formatting
    noteContent.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            const cursorPos = noteContent.selectionStart;
            const text = noteContent.value;
            const currentLine = getCurrentLine(text, cursorPos);
            
            // Handle different formatting types
            if (activeFormatType === 'list' && isNumberedListItem(currentLine)) {
                e.preventDefault();
                handleNumberedList(currentLine);
                // Resize after adding content
                setTimeout(() => autoResizeTextarea(noteContent), 0);
                return;
            } else if (activeFormatType === 'checkbox' && isCheckboxItem(currentLine)) {
                e.preventDefault();
                handleCheckboxList();
                // Resize after adding content
                setTimeout(() => autoResizeTextarea(noteContent), 0);
                return;
            } else if (activeFormatType === 'bullet' && isBulletItem(currentLine)) {
                e.preventDefault();
                handleBulletList();
                // Resize after adding content
                setTimeout(() => autoResizeTextarea(noteContent), 0);
                return;
            }
            
            // If we reach here, no specific formatting is active at cursor
            activeFormatType = null;
        }
    });

    // Function to get the current line based on cursor position
    function getCurrentLine(text, cursorPos) {
        const textBeforeCursor = text.substring(0, cursorPos);
        const lastNewlineBeforeCursor = textBeforeCursor.lastIndexOf('\n');
        const lineStartPos = lastNewlineBeforeCursor === -1 ? 0 : lastNewlineBeforeCursor + 1;
        const lineEndPos = text.indexOf('\n', cursorPos);
        const actualLineEndPos = lineEndPos === -1 ? text.length : lineEndPos;
        return {
            text: text.substring(lineStartPos, actualLineEndPos),
            startPos: lineStartPos,
            endPos: actualLineEndPos
        };
    }

    // Check if the current line is a numbered list item
    function isNumberedListItem(line) {
        return /^\s*\d+\.\s.*$/.test(line.text);
    }

    // Check if the current line is a checkbox item
    function isCheckboxItem(line) {
        return /^\s*\[\s?\]\s.*$/.test(line.text);
    }

    // Check if the current line is a bullet item
    function isBulletItem(line) {
        return /^\s*•\s.*$/.test(line.text);
    }

    // Handle numbered list continuation
    function handleNumberedList(currentLine) {
        const match = currentLine.text.match(/^(\s*)(\d+)\.(\s*)(.*)/);
        if (match) {
            const indentation = match[1];
            const number = parseInt(match[2]);
            const spacing = match[3];
            const content = match[4];
            
            const textarea = noteContent;
            const text = textarea.value;
            const cursorPos = textarea.selectionStart;
            
            // If the line is empty except for the number and formatting, remove the list formatting
            if (!content.trim()) {
                const newText = text.substring(0, currentLine.startPos) + text.substring(currentLine.endPos);
                textarea.value = newText;
                textarea.selectionStart = currentLine.startPos;
                textarea.selectionEnd = currentLine.startPos;
                activeFormatType = null;
            } else {
                // Continue the numbered list with an incremented number
                const newListItem = `\n${indentation}${number + 1}.${spacing}`;
                const newText = text.substring(0, cursorPos) + newListItem + text.substring(cursorPos);
                textarea.value = newText;
                textarea.selectionStart = cursorPos + newListItem.length;
                textarea.selectionEnd = cursorPos + newListItem.length;
            }
        }
    }

    // Handle checkbox list continuation
    function handleCheckboxList() {
        const textarea = noteContent;
        const text = textarea.value;
        const cursorPos = textarea.selectionStart;
        const currentLine = getCurrentLine(text, cursorPos);
        
        const match = currentLine.text.match(/^(\s*\[\s?\]\s)(.*)/);
        if (match) {
            const checkboxFormat = match[1];
            const content = match[2];
            
            // If the line is empty except for the checkbox, remove the formatting
            if (!content.trim()) {
                const newText = text.substring(0, currentLine.startPos) + text.substring(currentLine.endPos);
                textarea.value = newText;
                textarea.selectionStart = currentLine.startPos;
                textarea.selectionEnd = currentLine.startPos;
                activeFormatType = null;
            } else {
                // Continue the checkbox list
                const newCheckboxItem = `\n${checkboxFormat}`;
                const newText = text.substring(0, cursorPos) + newCheckboxItem + text.substring(cursorPos);
                textarea.value = newText;
                textarea.selectionStart = cursorPos + newCheckboxItem.length;
                textarea.selectionEnd = cursorPos + newCheckboxItem.length;
            }
        }
    }

    // Handle bullet list continuation
    function handleBulletList() {
        const textarea = noteContent;
        const text = textarea.value;
        const cursorPos = textarea.selectionStart;
        const currentLine = getCurrentLine(text, cursorPos);
        
        const match = currentLine.text.match(/^(\s*•\s)(.*)/);
        if (match) {
            const bulletFormat = match[1];
            const content = match[2];
            
            // If the line is empty except for the bullet, remove the formatting
            if (!content.trim()) {
                const newText = text.substring(0, currentLine.startPos) + text.substring(currentLine.endPos);
                textarea.value = newText;
                textarea.selectionStart = currentLine.startPos;
                textarea.selectionEnd = currentLine.startPos;
                activeFormatType = null;
            } else {
                // Continue the bullet list
                const newBulletItem = `\n${bulletFormat}`;
                const newText = text.substring(0, cursorPos) + newBulletItem + text.substring(cursorPos);
                textarea.value = newText;
                textarea.selectionStart = cursorPos + newBulletItem.length;
                textarea.selectionEnd = cursorPos + newBulletItem.length;
            }
        }
    }

    // Function to insert formatted content
    function insertFormatting(type) {
        const textarea = noteContent;
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const text = textarea.value;
        let selectedText = text.substring(startPos, endPos);
        let formattedText = '';

        switch (type) {
            case 'checkbox':
                if (selectedText) {
                    const lines = selectedText.split('\n');
                    formattedText = lines.map(line => line ? `[ ] ${line}` : '').join('\n');
                } else {
                    formattedText = '[ ] ';
                }
                break;
            case 'list':
                if (selectedText) {
                    const lines = selectedText.split('\n');
                    formattedText = lines.map((line, index) => line ? `${index + 1}. ${line}` : '').join('\n');
                } else {
                    formattedText = '1. ';
                }
                break;
            case 'bullet':
                if (selectedText) {
                    const lines = selectedText.split('\n');
                    formattedText = lines.map(line => line ? `• ${line}` : '').join('\n');
                } else {
                    formattedText = '• ';
                }
                break;
        }

        textarea.value = text.substring(0, startPos) + formattedText + text.substring(endPos);
        textarea.focus();
        textarea.selectionStart = startPos + formattedText.length;
        textarea.selectionEnd = startPos + formattedText.length;
        
        // Resize after inserting content
        setTimeout(() => autoResizeTextarea(textarea), 0);
    }

    addNoteBtn.addEventListener('click', () => {
        const title = noteTitle.value.trim();
        const content = noteContent.value.trim();

        if (content) {
            if (editingNoteId) {
                // Update existing note
                updateNote(editingNoteId, title, content, selectedColor);
                editingNoteId = null;
                addNoteBtn.textContent = 'Add Note';
            } else {
                // Add new note
                addNote(title, content, selectedColor);
            }

            // Reset form
            noteTitle.value = '';
            noteContent.value = '';
            selectedColor = '#ffffff';
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            colorOptions[0].classList.add('selected');
            activeFormatType = null;
            
            // Reset textarea height
            autoResizeTextarea(noteContent);
        }
    });

    // Functions
    function addNote(title, content, color) {
        const note = {
            id: Date.now(),
            title,
            content,
            color,
            createdAt: new Date().toLocaleString()
        };

        notes.push(note);
        saveNotes();
        renderNotes();
    }

    function updateNote(id, title, content, color) {
        const noteIndex = notes.findIndex(note => note.id == id);
        if (noteIndex > -1) {
            notes[noteIndex].title = title;
            notes[noteIndex].content = content;
            notes[noteIndex].color = color;
            saveNotes();
            renderNotes();
        }
    }

    function deleteNote(id) {
        notes = notes.filter(note => note.id != id);
        saveNotes();
        renderNotes();
    }

    function editNote(id) {
        const note = notes.find(note => note.id == id);
        if (note) {
            noteTitle.value = note.title;
            noteContent.value = note.content;
            selectedColor = note.color;
            editingNoteId = id;
            addNoteBtn.textContent = 'Update Note';

            // Select the correct color option
            colorOptions.forEach(opt => {
                if (opt.getAttribute('data-color') === note.color) {
                    opt.classList.add('selected');
                } else {
                    opt.classList.remove('selected');
                }
            });

            // Auto-resize the textarea after setting content
            setTimeout(() => autoResizeTextarea(noteContent), 0);

            // Scroll to form
            document.querySelector('.note-form').scrollIntoView({ behavior: 'smooth' });
        }
    }

    function saveNotes() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    function formatNoteContent(content) {
        // Format checkboxes
        content = content.replace(/\[\s?\]\s(.*?)(?=$|\n)/g, '<div class="checkbox-item"><input type="checkbox">$1</div>');
        content = content.replace(/\[x\]\s(.*?)(?=$|\n)/g, '<div class="checkbox-item"><input type="checkbox" checked>$1</div>');
        
        // Format numbered lists
        content = content.replace(/(\d+)\.\s(.*?)(?=$|\n)/g, '<div class="list-item">$1. $2</div>');
        
        // Format bullet points
        content = content.replace(/•\s(.*?)(?=$|\n)/g, '<div class="bullet-item">$1</div>');
        
        return content;
    }

    function renderNotes() {
        notesContainer.innerHTML = '';
        
        if (notes.length === 0) {
            notesContainer.innerHTML = '<p class="no-notes">No notes yet. Create your first note!</p>';
            return;
        }

        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note');
            noteElement.style.backgroundColor = note.color;
            
            const formattedContent = formatNoteContent(note.content);
            
            noteElement.innerHTML = `
                <div class="note-title">${note.title || 'Untitled'}</div>
                <div class="note-content">${formattedContent}</div>
                <div class="note-actions">
                    <button class="edit-note" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="delete-note" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            `;

            // Add event listeners to checkboxes
            const checkboxes = noteElement.querySelectorAll('.checkbox-item input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    // Just for UI interaction, won't persist after refresh since we're storing plain text
                    this.parentElement.classList.toggle('checked');
                });
            });

            // Add event listeners to buttons
            noteElement.querySelector('.edit-note').addEventListener('click', () => {
                editNote(note.id);
            });

            noteElement.querySelector('.delete-note').addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this note?')) {
                    deleteNote(note.id);
                }
            });

            notesContainer.appendChild(noteElement);
        });
    }
}); 