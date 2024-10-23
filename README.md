## Overview

This application is a Cloudflare Worker created with Wrangler.

It functions as a webhook consumer for Linear, listening for specific tasks from a designated user.

The primary purpose is to ensure that issues marked as "Ready To Review" include a "release_note" label and content. If the release note is not "ignore" and either the label or content is missing, the issue's status is reverted to "In Progress," and a comment is added.

Additionally, the app is configured to accept requests only from Linear IP addresses, ensuring secure communication.

## Features

- Webhook Listener: Receives webhooks from Linear.
- Issue Status Check: Monitors issues updated to "Ready To Review".
- Label Verification: Checks for the presence of the "release_note" label.
- Automatic Status Update: Reverts the status to "in progress" if the release note content or label is missing.
- Commenting: Adds a comment to the issue when the status is reverted.

## Requirements

### Environments for Development

Copy the example env file and fill it with your needs. You can the the example file for descriptions.

```bash
cp .dev.vars.example .dev.vars
```

### API and Account Requirements

- Cloudflare Account
- Wrangler CLI
- Linear API Access

## Installation

- Clone the Repository:

```bash
git clone https://github.com/burakberkkeskin/cf-worker-linear-webhook.git && \
cd cf-worker-linear-webhook
```

- Install Dependencies:

```bash
npm install
```

- Login to Cloudflare for Wrangler:

```bash
wrangler login
```

## Development

- Run the application for development

```bash
npm run start
```

## Release a New Version

- Commit your changes and push the repo.

- Cloudflare automatically builds the application and deploys the app.

## High Level Use Case and Workflow

Here's a high-level example of how the app works:

1. An issue is updated to "ready to review" by a specific user.
2. Linear webhook sends a request to the Cloudflare worker app.
3. The worker checks if the the actor is the specified email or not.
4. The worker checks if the status of the issue is the "Ready To Review" or not.
5. The worker checks if the release note is ignored or not.
6. If the "release_note" label or "Release Note" content is missing:
   1. The issue status is reverted to "In Progress".
   2. A comment is added to the issue explaining the change.
