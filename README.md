
# Bookmarks Manager

## Description
Bookmarks Manager is a web-based application designed to allow users to organize and manage bookmarks in different sections. It provides a flexible interface to add, edit, and delete both sections and bookmarks, as well as load and save bookmarks data. The application includes multi-language support, with options for both English and French.

## Features
- **Section and Link Management**: Add, edit, delete, and reorder sections and bookmarks within each section.
- **File Upload and Download**: Import bookmarks from a JSON file and download all bookmarks as a JSON file.
- **Edit Mode**: Toggle between edit and view modes to control visibility of editing features.
- **Language Selection**: Choose between English and French.
- **Jira Integration**: A footer tool to quickly access Jira tickets based on ticket number input.

## Setup
### Prerequisites
Ensure you have the following tools installed:
- A modern web browser (such as Chrome, Firefox, Safari)
- Basic knowledge of IndexedDB and frontend web technologies

### Files
- **index.html**: Main file that contains the HTML structure.
- **bookmarks.js**: JavaScript file for managing bookmarks logic.
- **database.js**: Handles IndexedDB operations for persistent storage.
- **modal.js**: Manages modal dialogs for user inputs.
- **language.js**: Controls language switching functionality.
- **style.css**: Defines custom styles.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bookmarks-manager.git
   ```
2. Navigate to the project directory:
   ```bash
   cd bookmarks-manager
   ```
3. Open `index.html` in a web browser.

## Usage
1. **Add a New Section**: Click on "+ Nouvelle Section" to add a new section to your bookmarks.
2. **Add a New Bookmark**: Use the `+` icon in each section to add a link.
3. **Edit and Delete**: Toggle "Edition" mode to view options for editing or deleting sections and bookmarks.
4. **Language Switching**: Select either French or English from the dropdown.
5. **Jira Ticket Access**: Enter a Jira ticket number in the footer to be redirected to the ticket page.

## Code Structure
- **HTML**: Structure for displaying sections, links, and modals.
- **CSS**: Styling for a responsive layout and interactive elements.
- **JavaScript**: Handles IndexedDB for data persistence, edit mode toggling, bookmark CRUD operations, and language selection.

## Contributing
To contribute, fork the repository, make changes, and submit a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.

---
