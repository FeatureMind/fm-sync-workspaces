# FM Sync Workspaces

A command-line tool to sync repositories one-way from a source Bitbucket workspace to a destination Bitbucket workspace. Useful for migrations, maintaining mirrors, or managing repositories across different units.

## ✨ Features

-   One-way sync from source to destination Bitbucket workspace.
-   Supports multiple repositories per run.
-   Creates missing repositories in the destination.
-   Cleans local `repos/` directory before each sync.
-   Includes `Jenkinsfile` for CI/CD automation.
-   Configuration via a single `.env` file.

## 🚀 Requirements

-   **Node.js**: `14.x`+ ( `20.x`+ recommended).
-   **Git**: Installed and in PATH.
-   **Bitbucket App Passwords**: For source (read access) and destination (write/admin access) workspaces.

## 📦 Installation

1.  Clone & enter directory:
    ```bash
    git clone https://github.com/FeatureMind/fm-sync-workspaces.git
    cd fm-sync-workspaces
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure:
    * Copy `.env.example` to `.env`:
        ```bash
        cp .env.example .env
        ```
    * Edit `.env` with your Bitbucket details. Key variables:
        * `REPOS`: Comma-separated repository slugs.
        * `SOURCE_WORKSPACE`, `SOURCE_USERNAME`, `SOURCE_APP_PASSWORD`
        * `DEST_WORKSPACE`, `DEST_USERNAME`, `DEST_APP_PASSWORD`, `DEST_PROJECT_KEY`
        *(Refer to `.env.example` for full details and comments on each variable.)*

## 🛠 Usage

### Local Execution

1.  Ensure `.env` is configured.
2.  Run:
    ```bash
    npm start
    ```
    Alternatively:
    ```bash
    node index.js
    ```

### Jenkins Automation

1.  Use the provided `Jenkinsfile`.
2.  Configure your Jenkins job to pass the required environment variables (from your `.env` content), ideally using Jenkins credentials for sensitive data.

## ⚠️ Key Points

* **Destination Project (`DEST_PROJECT_KEY`):** Must exist in the destination Bitbucket workspace beforehand. The script does *not* create projects.
* **Repository Creation:** Repositories listed in `REPOS` will be created in the destination project if they don't exist.
* **Mirroring:** Existing repositories in the destination will be updated to mirror the source. This is a destructive operation for the destination repo's unique history if it diverges.
* **Permissions:** Ensure App Passwords have correct repository permissions (read for source, write/admin for destination).
* **Local Cleanup:** The `repos/` directory (local clones) is cleared before each sync.

## 🐛 Troubleshooting

* Review console output/logs for error messages.
* Verify your `.env` configuration and variable values.
* Check Bitbucket App Password permissions.
* For bugs or issues, please [open an issue](https://github.com/FeatureMind/fm-sync-workspaces/issues) on GitHub.

## 🤝 Contributing

Contributions via Pull Requests or Issue discussions are welcome.

## 📄 License

MIT License. See [LICENSE](LICENSE) file.

---
Happy syncing! 😊