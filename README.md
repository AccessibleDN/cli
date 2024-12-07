# AccessibleDN Project

Welcome to the AccessibleDN CLI! This command-line tool helps you quickly scaffold and manage AccessibleDN projects. With a simple command, you can generate new projects using our collection of generation packs, run development servers, build for production, and configure your project settings.

## Getting Started

To get started with the AccessibleDN project, follow these steps:

1. **Install the CLI:**

   ```sh
   npm install --location=global @accessibledn-pack/cli
   ```

2. **Generate a new project:**
   You can generate a new project using the default generation pack or specify a custom pack.

   - Using a custom generation pack:
     ```sh
     accessibledn generate [pack]
     ```
     Replace `[pack]` with the name of the custom generation pack you want to use or remove it to use the default generation pack.
