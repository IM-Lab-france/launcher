# Bookmarks Manager

## Notice d'utilisation

### Description
Bookmarks Manager est une application web permettant d'organiser et de gérer facilement vos favoris dans différentes sections. Vous pouvez ajouter, modifier, supprimer des sections et des favoris, ainsi qu'importer ou sauvegarder vos favoris sous forme de fichier JSON. L'application est disponible en deux langues : français et anglais.

### Fonctionnalités
- **Gestion des Sections et Favoris** : Ajoutez, modifiez, supprimez et réorganisez les sections et les favoris dans chaque section.
- **Chargement et Téléchargement de Fichiers** : Importez vos favoris depuis un fichier JSON et téléchargez-les pour les sauvegarder.
- **Mode Édition** : Basculez entre le mode édition et le mode consultation pour afficher ou masquer les options de modification.
- **Choix de la Langue** : Passez du français à l'anglais depuis le menu déroulant.
- **Accès Jira** : Accédez rapidement aux tickets Jira en saisissant un numéro de ticket dans le pied de page.

### Guide d'Utilisation
1. **Ajouter une Section** : Cliquez sur "+ Nouvelle Section" pour créer une nouvelle catégorie de favoris.
2. **Ajouter un Favori** : Dans chaque section, cliquez sur l'icône `+` pour ajouter un lien.
3. **Éditer et Supprimer** : Passez en "Mode Édition" pour afficher les options de modification ou de suppression de sections et favoris.
4. **Changer la Langue** : Utilisez le menu déroulant pour sélectionner le français ou l'anglais.
5. **Accéder aux Tickets Jira** : Dans le pied de page, saisissez un numéro de ticket Jira pour être redirigé vers la page du ticket.

---

## User Guide

### Description
Bookmarks Manager is a web-based application that allows you to organize and manage your bookmarks across different sections. You can add, edit, delete sections and bookmarks, as well as import and save your bookmarks as a JSON file. The application is available in both English and French.

### Features
- **Section and Link Management**: Add, edit, delete, and reorder sections and bookmarks within each section.
- **File Upload and Download**: Import bookmarks from a JSON file and download them for backup.
- **Edit Mode**: Toggle between edit and view modes to show or hide editing options.
- **Language Selection**: Switch between English and French from the dropdown menu.
- **Jira Integration**: Quickly access Jira tickets by entering a ticket number in the footer.

### Usage Guide
1. **Add a New Section**: Click on "+ Nouvelle Section" to add a new section for your bookmarks.
2. **Add a New Bookmark**: In each section, click on the `+` icon to add a link.
3. **Edit and Delete**: Toggle "Edition" mode to display options for editing or deleting sections and bookmarks.
4. **Switch Language**: Use the dropdown to select either French or English.
5. **Access Jira Tickets**: In the footer, enter a Jira ticket number to be redirected to the ticket page.

---

## Developer Documentation

### Description
Bookmarks Manager is a web-based application designed to allow users to organize and manage bookmarks in different sections. It provides a flexible interface to add, edit, and delete both sections and bookmarks, as well as load and save bookmarks data. The application includes multi-language support, with options for both English and French.

### Features
- **Section and Link Management**: Add, edit, delete, and reorder sections and bookmarks within each section.
- **File Upload and Download**: Import bookmarks from a JSON file and download all bookmarks as a JSON file.
- **Edit Mode**: Toggle between edit and view modes to control visibility of editing features.
- **Language Selection**: Choose between English and French.
- **Jira Integration**: A footer tool to quickly access Jira tickets based on ticket number input.

### Setup
#### Prerequisites
Ensure you have the following tools installed:
- A modern web browser (such as Chrome, Firefox, Safari)
- Basic knowledge of IndexedDB and frontend web technologies

#### Files
- **index.html**: Main file that contains the HTML structure.
- **bookmarks.js**: JavaScript file for managing bookmarks logic.
- **database.js**: Handles IndexedDB operations for persistent storage.
- **modal.js**: Manages modal dialogs for user inputs.
- **language.js**: Controls language switching functionality.
- **style.css**: Defines custom styles.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bookmarks-manager.git
